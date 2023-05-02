const Joi = require('joi');
const {
  Member,
  MemberBalance,
  IpLog,
  MemberReferral,
  Page,
  Setting,
  SurveyQuestion,
  MemberEligibilities,
  MembershipTier,
  MemberTransaction,
  EmailAlert,
  PaymentMethod,
  MemberPaymentInformation,
  WithdrawalRequest,
  WithdrawalType,
} = require('../../models/index');
const bcrypt = require('bcryptjs');
const IpHelper = require('../../helpers/IpHelper');
const IpQualityScoreClass = require('../../helpers/IpQualityScore');
const eventBus = require('../../eventBus');
const { genarateHash } = require('../../helpers/global');
const { decodeHash } = require('../../helpers/global');
const { response } = require('express');
const { ResourceGroups } = require('aws-sdk');

class MemberAuthController {
  constructor() {
    this.geoTrack = this.geoTrack.bind(this);
    this.login = this.login.bind(this);
    this.signup = this.signup.bind(this);
    this.referralDetails = this.referralDetails.bind(this);
    this.saveRegistrationBonus = this.saveRegistrationBonus.bind(this);
    this.emailVerify = this.emailVerify.bind(this);
    this.setMemberEligibility = this.setMemberEligibility.bind(this);
    this.profileUpdate = this.profileUpdate.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.memberWithdrawal = this.memberWithdrawal.bind(this);
    this.withdraw = this.withdraw.bind(this);
    this.sendMailEvent = this.sendMailEvent.bind(this);
  }
  //login
  async login(req, res) {
    let company_portal_id = req.session.company_portal.id;
    req.headers.site_id = company_portal_id;
    let company_id = req.session.company_portal.company_id;
    let redirect_page = await Page.findOne({
      where: { company_portal_id: company_portal_id, after_signin: 1 },
    });
    if (redirect_page) redirect_page = '/' + redirect_page.slug;
    else redirect_page = '/';
    if (req.session.member) {
      res.redirect(redirect_page);
      return;
    }
    const member = await Member.findOne({
      where: { email: req.body.email, company_portal_id: company_portal_id },
    });
    let ip = req.ip;
    if (Array.isArray(ip)) {
      ip = ip[0];
    } else {
      ip = ip.replace('::ffff:', '');
    }

    let member_status = true;
    let member_message = 'Logged in successfully!';
    const schema = Joi.object({
      password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),
      email: Joi.string().email().required(),
      remember_me: Joi.optional(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      member_status = false;
      member_message = error.details.map((err) => err.message);
    }
    if (!member) {
      member_status = false;
      member_message = 'Email is not registered!';
    } else {
      let isMatch = false;
      if (!member.password) {
        member_status = false;
        member_message = 'Please Setup your account before login';
      } else {
        isMatch = await bcrypt.compare(value.password, member.password);
        if (!isMatch) {
          member_status = false;
          member_message = 'Invalid credentials!';
        } else {
          // await this.geoTrack(req, ip, member)
        }
        if (member.status != 'member') {
          member_status = false;
          member_message =
            'Your account status is ' +
            member.status +
            '. Please contact to our admin!';
        }
      }
    }
    if (member_status) {
      req.session.member = member;
      let activityEventbus = eventBus.emit('member_activity', {
        member_id: member.id,
        action: 'Member Logged In',
      });
      res.redirect(redirect_page);
    } else {
      req.session.flash = { error: member_message };
      res.redirect('back');
    }
  }
  //signup
  async signup(req, res) {
    try {
      let company_portal_id = req.session.company_portal.id;
      req.headers.site_id = company_portal_id;
      let company_id = req.session.company_portal.company_id;
      let ip = req.ip;
      if (Array.isArray(ip)) {
        ip = ip[0];
      } else {
        ip = ip.replace('::ffff:', '');
      }
      // const schema = Joi.object({
      //   first_name: Joi.string().required().label('First Name'),
      //   last_name: Joi.string().required().label('Last Name'),
      //   email: Joi.string().optional(),
      //   password: Joi.string().optional(),
      //   confirm_password: Joi.string().optional(),
      // });
      // const { error, value } = schema.validate(req.body);
      let member_status = true;
      let member_message =
        'Registered successfully! We have sent a mail to your registered email. Please confirm your email.';
      // if (error) {
      //   member_status = false;
      //   member_message = error.details.map((err) => err.message);
      // }
      //check if IP is blacklisted
      const ipHelper = new IpHelper();
      let ip_ckeck = await ipHelper.checkIp(ip, company_portal_id);
      if (ip_ckeck.status) {
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(req.body.password, salt);
        let existing_email_or_username = await Member.findOne({
          where: {
            company_portal_id: company_portal_id,
            email: req.body.email,
          },
        });
        let member_details = [];
        if (existing_email_or_username) {
          member_status = false;
          member_message =
            'Sorry! this username or email has already been taken';
        } else {
          req.body.membership_tier_id = 1;
          // let files = [];
          // if (req.files) {
          //   files[0] = req.files.avatar;
          //   const fileHelper = new FileHelper(files, 'members', req);
          //   const file_name = await fileHelper.upload();
          //   req.body.avatar = file_name.files[0].filename;
          // }

          let data = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: password,
            membership_tier_id: 1,
            company_portal_id: company_portal_id,
            company_id: company_id,
            status: 'validating',
            username: req.body.email.split('@')[0],
            created_at: new Date(),
          };
          const res = await Member.create(data);
          //send mail
          const eventBus = require('../../eventBus');
          member_details = await Member.findOne({
            where: { email: req.body.email },
          });

          let hash_obj = { id: member_details.id, email: req.body.email };
          var buf = genarateHash(JSON.stringify(hash_obj));
          member_details.email_confirmation_link =
            req.session.company_portal.domain + '/email-verify/' + buf;
          let evntbus = eventBus.emit('send_email', {
            action: 'Welcome',
            data: {
              email: req.body.email,
              details: { members: member_details },
            },
            req: req,
          });

          //Referral code
          let referrer = '';
          if (req.body.referral_code) {
            await this.referralDetails(req, res);
            //signed up with referral code
          }
          //registration bonus
          await this.saveRegistrationBonus(member_details);
        }
        if (member_status) {
          let activityEventbus = eventBus.emit('member_activity', {
            member_id: member_details.id,
            action: 'Member Sign Up',
          });
          req.session.flash = { message: member_message };
          res.redirect('/notice');
        } else {
          req.session.flash = { error: member_message };
          res.redirect('back');
        }
      }
    } catch (error) {
      console.error(error);
      req.session.flash = { error: 'Unable to save data' };
      res.redirect('back');
    }
  }

  //referral
  async referralDetails(req, res) {
    if (req.body.referral_code) {
      referrer = await Member.findOne({
        where: { referral_code: req.body.referral_code },
      });
      if (referrer) {
        referrer = referrer.id;
        //update member referral info
        let ip = req.ip.split('::ffff:');
        ip = ip[ip.length - 1];
        var geo = geoip.lookup('122.163.102.160');

        let referral_details = await MemberReferral.findOne({
          where: { referral_id: referrer, referral_email: req.body.email },
          order: [['id', 'DESC']],
        });
        if (referral_details) {
          await MemberReferral.update(
            {
              geo_location: geo.region,
              ip: ip,
              member_id: referrer,
              join_date: new Date(),
            },
            {
              where: { id: referral_details.id },
            }
          );
        } else {
          await MemberReferral.create({
            member_id: referrer,
            referral_id: member_details.id,
            referral_email: req.body.email,
            geo_location: geo.region,
            ip: ip,
            join_date: new Date(),
          });
        }
      }
      let model = await Member.update(
        {
          referral_code: res.result.id + '0' + new Date().getTime(),
          member_referral_id: referrer,
        },
        {
          where: { id: res.result.id },
        }
      );
      //signed up with referral code
    }
  }
  //registration bonus
  async saveRegistrationBonus(member_details) {
    let registration_bonus = await Setting.findOne({
      where: { settings_key: 'registration_bonus' },
    });
    await MemberTransaction.create({
      type: 'credited',
      amount: registration_bonus.settings_value,
      status: 2,
      member_id: member_details.id,
      amount_action: 'admin_adjustment',
      balance: registration_bonus.settings_value,
      completed_at: new Date(),
    });
  }
  //geo track
  async geoTrack(req, ip, member) {
    const reportObj = new IpQualityScoreClass();
    const geo = await reportObj.getIpReport(ip);
    let ip_logs = {
      member_id: member.id,
      ip: ip,
      browser: req.headers['user-agent'],
      browser_language: req.headers['accept-language'],
    };
    if (geo.status) {
      ip_logs['geo_location'] =
        geo.report.country_code +
        ',' +
        geo.report.region +
        ',' +
        geo.report.city;
      ip_logs['isp'] = geo.report.ISP;
      ip_logs['fraud_score'] = geo.report.fraud_score;
      ip_logs['vpn'] = geo.report.vpn;
      ip_logs['proxy'] = geo.report.proxy;
      ip_logs['tor'] = geo.report.tor;
      ip_logs['bot_status'] = geo.report.bot_status;
      ip_logs['latitude'] = geo.report.latitude;
      ip_logs['longitude'] = geo.report.longitude;
    }
    //ip logs
    await IpLog.create(ip_logs);
  }

  //verify verify
  async emailVerify(req, res) {
    let hash_obj = decodeHash(req.params.hash);
    let member_details = await Member.findOne({
      where: { id: hash_obj.id, email: hash_obj.email },
    });
    if (member_details) {
      let model = await Member.update(
        {
          email_verified_on: new Date(),
          status: 'member',
        },
        {
          where: { id: member_details.id },
        }
      );
      //set member eligibility
      await this.setMemberEligibility(member_details.id);
      let activityEventbus = eventBus.emit('member_activity', {
        member_id: member_details.id,
        action: 'Email Verified',
      });
    }
    res.redirect('/');
    return;
  }

  //update member profile
  async profileUpdate(req, res) {
    let member_status = true;
    let member_message = 'Successfully updated!';
    const method = req.method;
    let request_data = {};
    let member = {};
    try {
      const member_id = req.session.member.id;
      member = await Member.findOne({ where: { id: member_id } });

      if (method === 'POST') {
        req.headers.company_id = req.session.company_portal.company_id;
        req.headers.site_id = req.session.company_portal.id;

        const schema = Joi.object({
          first_name: Joi.string().required().label('First Name'),
          last_name: Joi.string().required().label('Last Name'),
          username: Joi.string().required().label('User Name'),
          country: Joi.number().required().label('Country'),
          zipcode: Joi.number().required().label('Zipcode'),
          city: Joi.string().optional().label('City'),
          gender: Joi.string().required().label('Gender'),
          phone_no: Joi.string().required().label('Phone number'),
          // country_code: Joi.number().optional().label('Phone code'),
          address_1: Joi.string().allow('').required().label('Address 1'),
          address_2: Joi.string().allow('').optional().label('Address 2'),
          // email_alerts: Joi.array().allow('').optional().label('Email Alerts'),
        });
        const { error, value } = schema.validate(req.body);

        if (error) {
          member_status = false;
          member_message = error.details.map((err) => err.message);
        }
        if (!member.profile_completed_on) {
          await Member.creditBonusByType(member, 'complete_profile_bonus', req);
          req.body.profile_completed_on = new Date();
          let activityEventbus = eventBus.emit('member_activity', {
            member_id: member.id,
            action: 'Profile Completed',
          });
        }
        req.body.country_id = req.body.country;
        req.body.zip_code = req.body.zipcode;
        request_data = req.body;
        request_data.updated_by = member_id;
        // request_data.avatar = null;
        if (req.files) {
          request_data.avatar = await Member.updateAvatar(req, member);
        }
        let model = await Member.update(request_data, {
          where: { id: member_id },
        });
        //set eligibility
        await this.setMemberEligibility(member_id);

        if (req.body.email_alerts && req.body.email_alerts.length > 0) {
          let email_alerts = req.body.email_alerts;
          member_status = await EmailAlert.saveEmailAlerts(
            member_id,
            email_alerts
          );
        }
      }
      if (method === 'PUT') {
        let rsp = await this.changePassword(req, member);

        member_status = rsp.member_status;
        member_message = rsp.member_message;
      }
    } catch (error) {
      console.error(error);
      member_status = false;
      member_message = 'Unable to save data';
      // res.redirect('back');
    } finally {
      if (member_status) {
        if (request_data.avatar) {
          req.session.member.avatar =
            process.env.S3_BUCKET_OBJECT_URL + request_data.avatar;
        } else req.session.member.avatar = member.avatar;

        req.session.flash = { message: member_message };
      } else {
        req.session.flash = { error: member_message };
      }
      if (method === 'POST') {
        res.redirect('back');
      } else {
        res.json({ status: member_status, message: member_message });
      }
    }
  }
  //set member eligibility
  async setMemberEligibility(member_id) {
    //gender
    let member_details = await Member.findOne({ where: { id: member_id } });
    let member_eligibility = [];

    //eligibility entry for gender
    let nmae_list = ['GENDER', 'ZIP', 'STATE', 'REGION', 'AGE'];
    let questions = await SurveyQuestion.findAll({
      where: { name: nmae_list },
    });

    if (questions.length) {
      questions.forEach(function (record, key) {
        if (record.survey_provider_id) {
          let precode = '';
          switch (record.name) {
            case 'GENDER':
              if (record.survey_provider_id == 1) {
                if (member_details.gender == 'male') {
                  precode = 1;
                } else if (member_details.gender == 'female') {
                  precode = 2;
                }
              }
              break;
            case 'ZIP':
              precode = member_details.zip_code;
              break;
            // case 'STATE':
            //   precode = member_details.zip_code
            //   break;
            case 'REGION':
              precode = member_details.city;
              break;
            case 'AGE':
              if (member_details.dob) {
                var dob = new Date(member_details.dob);
                var month_diff = Date.now() - dob.getTime();
                var age_dt = new Date(month_diff);
                var year = age_dt.getUTCFullYear();
                precode = Math.abs(year - 1970);
              }
              break;
          }
          member_eligibility.push({
            member_id: member_id,
            survey_question_id: record.id,
            precode_id: precode,
          });
        }
      });
    }
    await MemberEligibilities.bulkCreate(member_eligibility, {
      updateOnDuplicate: ['precode_id'],
      ignoreDuplicates: true,
    });
    return;
  }
  //change password
  async changePassword(req, member) {
    let member_status = true;
    let member_message = 'Successfully updated!';
    try {
      // const member_id = req.session.member.id;
      const member_id = member.id;
      const schema = Joi.object({
        old_password: Joi.string().required(),
        new_password: Joi.string()
          .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
          .required(),
        confirm_password: Joi.string().required(),
      });

      const { error, value } = schema.validate(req.body);

      if (error) {
        member_status = false;
        member_message = error.details.map((err) => err.message);
      }
      //member details
      const isMatch = await bcrypt.compare(
        req.body.old_password,
        member.password
      );

      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(value.new_password, salt);

      if (!isMatch) {
        member_status = false;
        member_message = 'Incorrect old password';
      }
      if (req.body.new_password !== req.body.confirm_password) {
        member_status = false;
        member_message = 'New password and confirm password are different';
      }

      if (member_status) {
        let update_member = await Member.update(
          { password: password },
          { where: { id: member_id } }
        );
        let activityEventbus = eventBus.emit('member_activity', {
          member_id: member.id,
          action: 'Password Changed',
        });
      }
    } catch (error) {
      console.error(error);
      member_status = false;
      member_message = 'Unable to save data';
    } finally {
      return { member_status, member_message };
    }
  }
  async logout(req, res) {
    req.session.member = null;
    res.redirect('/');
  }

  //Add Payment Credentials
  async addPaymentCredentials(req, res) { }

  //Member Withdrawal
  async memberWithdrawal(req, res) {
    let member_status = false;
    let member_message = 'Unable to save data';
    let response = [];
    const method = req.method;
    try {
      if (method === 'POST') {
        req.headers.site_id = req.session.company_portal.id;
        req.headers.company_id = req.session.company_portal.company_id;

        req.body.member_id = req.session.member.id;
        let resp = await this.withdraw(req);
        member_status = resp.member_status;
        member_message = resp.member_message;
      }
    } catch (error) {
      console.error(error);
      member_status = false;
      member_message = 'Error occured';
    } finally {
      if (member_status) {
        req.session.flash = { message: member_message };
      } else {
        req.session.flash = { error: member_message };
      }

      res.json({
        status: member_status,
        message: member_message,
        data: response,
      });
    }
  }

  //Add Payment Credentials
  async withdraw(req) {
    let request_data = req.body;
    var withdrawal_amount = parseFloat(request_data.amount);
    //get member
    let member = await Member.findOne({
      where: { id: request_data.member_id },
      include: {
        model: MemberBalance,
        as: 'member_amounts',
        attributes: ['amount'],
        where: { amount_type: 'cash' },
      },
    });
    member = JSON.parse(JSON.stringify(member));
    // console.log(member);
    let withdrawal_type = await WithdrawalType.findOne({
      where: { id: request_data.withdrawal_type_id },
      attributes: [
        'name',
        'slug',
        'payment_method_id',
        'logo',
        'min_amount',
        'max_amount',
      ],
    });
    withdrawal_type = JSON.parse(JSON.stringify(withdrawal_type));
    if (withdrawal_amount < parseFloat(withdrawal_type.min_amount)) {
      return {
        member_status: false,
        member_message:
          'Amount must be more than $' + withdrawal_type.min_amount,
      };
    }
    if (withdrawal_amount >= parseFloat(withdrawal_type.max_amount)) {
      return {
        member_status: false,
        member_message:
          'Amount must be less than $' + withdrawal_type.max_amount,
      };
    }
    // console.log(JSON.parse(JSON.stringify(member)));
    if (withdrawal_amount >= parseFloat(member.member_amounts[0].amount)) {
      return {
        member_status: false,
        member_message: 'Please check your balance',
      };
    }
    let withdrawal_req_data = {
      member_id: request_data.member_id,
      amount: withdrawal_amount,
      amount_type: 'cash',
      currency: 'USD',
      status: 'pending',
    };

    if (request_data.payment_method === 'paypal_instant_payment') {
      withdrawal_req_data.note = 'Withdrawal request auto approved';
      withdrawal_req_data.transaction_made_by = request_data.member_id;
      withdrawal_req_data.status = 'approved';

      //Insert into member transaction and update balance
      await MemberTransaction.updateMemberTransactionAndBalance({
        member_id: request_data.member_id,
        amount: -withdrawal_amount,
        note: 'Withdrawal request for $' + withdrawal_amount,
        type: 'withdraw',
        amount_action: 'member_withdrawal',
        created_by: request_data.member_id,
      });
    }
    // Insert in WxithdrawalRequest
    const res = await WithdrawalRequest.create(withdrawal_req_data);

    //member activity
    const activityEventbus = eventBus.emit('member_activity', {
      member_id: request_data.member_id,
      action: 'Member cash withdrawal request',
    });

    // email body for member
    let member_mail = await this.sendMailEvent({
      action: 'Withdraw Request Member',
      data: {
        email: member.email,
        details: { members: member },
      },
      req: req,
    });
    return {
      member_status: true,
      member_message: 'Withdrawal request processed',
    };
  }

  //send mail event call
  async sendMailEvent(mail_data) {
    return eventBus.emit('send_email', mail_data);
  }
}
module.exports = MemberAuthController;
