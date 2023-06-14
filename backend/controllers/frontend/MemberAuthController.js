const Joi = require('joi');
const {
  Member,
  MemberBalance,
  IpLog,
  MemberReferral,
  Page,
  Setting,
  SurveyQuestion,
  SurveyAnswerPrecodes,
  MemberEligibilities,
  MembershipTier,
  MemberTransaction,
  EmailAlert,
  PaymentMethod,
  MemberPaymentInformation,
  WithdrawalRequest,
  WithdrawalType,
  CompanyPortal,
  Company,
  User,
  Group,
} = require('../../models/index');
const bcrypt = require('bcryptjs');
const IpHelper = require('../../helpers/IpHelper');
const IpQualityScoreClass = require('../../helpers/IpQualityScore');
const eventBus = require('../../eventBus');
const { genarateHash } = require('../../helpers/global');
const { decodeHash } = require('../../helpers/global');
const { response } = require('express');
const { ResourceGroups } = require('aws-sdk');
const db = require('../../models/index');
const { QueryTypes, Op } = require('sequelize');
const Paypal = require('../../helpers/Paypal');
const moment = require('moment');
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
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    // this.updatePaymentInformation = this.updatePaymentInformation.bind(this);
    this.password_regex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,30}$/;
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
    var password_regex = this.password_regex;
    const schema = Joi.object({
      password: Joi.string()
        //.pattern(new RegExp('^[a-zA-Z0-9]{8,15}$'))
        .required(),
      email: Joi.string().email().required(),
      remember_me: Joi.optional(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      member_status = false;
      member_message = error.details.map((err) => err.message);
    }
    if (!password_regex.test(value.password)) {
      member_status = false;
      member_message = 'Password does not match the pattern.';
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
          //check for newsletter
          var newsletter = req.body.newsletter;
          // console.log('newsletter', newsletter);
          if (newsletter === 'true' || newsletter == true) {
            //save email alert
            await db.sequelize.query(
              'INSERT INTO email_alert_member (email_alert_id, member_id) VALUES (?, ?)',
              {
                type: QueryTypes.INSERT,
                replacements: [5, res.id],
              }
            );
          }
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
          req.session.flash = {
            message: 'Registered successfully!',
            success_status: true,
            notice: member_message,
          };
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
    let referrer = [];
    if (req.body.referral_code) {
      referrer = await Member.findOne({
        where: { referral_code: req.body.referral_code },
      });
      if (referrer) {
        referrer = referrer.id;
        //update member referral info
        let ip = req.ip;
        if (Array.isArray(ip)) {
          ip = ip[0];
        } else {
          ip = ip.replace('::ffff:', '');
        }
        const reportObj = new IpQualityScoreClass();
        var geo = await reportObj.getIpReport(ip);

        let referral_details = await MemberReferral.findOne({
          where: { referral_id: referrer, referral_email: req.body.email },
          order: [['id', 'DESC']],
        });
        if (referral_details) {
          await MemberReferral.update(
            {
              geo_location:
                geo.report.country_code +
                ',' +
                geo.report.region +
                ',' +
                geo.report.city,
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
            referral_id: res.id,
            referral_email: req.body.email,
            geo_location: geo.region,
            ip: ip,
            join_date: new Date(),
          });
        }
      }
      let model = await Member.update(
        {
          referral_code: res.id + '0' + new Date().getTime(),
          member_referral_id: referrer,
        },
        {
          where: { id: res.id },
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
    await MemberTransaction.updateMemberTransactionAndBalance({
      member_id: member_details.id,
      amount: registration_bonus.settings_value,
      note: '',
      status: '2',
      type: 'credited',
      amount_action: 'registration_bonus',
      balance: registration_bonus.settings_value,
      currency: 'USD',
      created_by: 0,
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
      req.session.member = member_details;
      //set member eligibility
      await this.setMemberEligibility(member_details.id);
      let activityEventbus = eventBus.emit('member_activity', {
        member_id: member_details.id,
        action: 'Email Verified',
      });
      let loginActivityEventbus = eventBus.emit('member_activity', {
        member_id: member_details.id,
        action: 'Member Logged In',
      });
      req.session.flash = {
        message:
          'Welcome to Moresurveys! Your email has been verified successfully.',
        success_status: true,
      };
    }
    res.redirect('/dashboard');
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

        // console.log('----------------', req.body);

        const schema = Joi.object({
          first_name: Joi.string().required().label('First Name'),
          last_name: Joi.string().required().label('Last Name'),
          username: Joi.string().required().label('User Name'),
          country: Joi.number().required().label('Country'),
          zipcode: Joi.string().required().label('Zipcode'),
          city: Joi.string().optional().label('City'),
          gender: Joi.string().required().label('Gender'),
          phone_no: Joi.string().required().label('Phone number'),
          // country_code: Joi.required().label('Phone code'),
          address_1: Joi.string().allow('').required().label('Address 1'),
          address_2: Joi.string().allow('').optional().label('Address 2'),
          state: Joi.string().allow('').optional().label('State'),
          email_alerts: Joi.allow('').optional().label('Email Alerts'),
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
        request_data.username = member.username;
        // request_data.avatar = null;
        if (req.files) {
          request_data.avatar = await Member.updateAvatar(req, member);
        }
        let model = await Member.update(request_data, {
          where: { id: member_id },
        });
        //set eligibility
        await this.setMemberEligibility(member_id);

        // if (req.body.email_alerts && req.body.email_alerts.length > 0) {
        let email_alerts = req.body.email_alerts || [];
        if (email_alerts.length > 0) {
          member_status = await EmailAlert.saveEmailAlerts(
            member_id,
            email_alerts
          );
        }

        // }
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

        req.session.flash = { message: member_message, success_status: true };
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
    var member_eligibility = [];

    //eligibility entry for gender
    let nmae_list = ['GENDER', 'ZIP', 'STATE', 'REGION', 'AGE'];
    let questions = await SurveyQuestion.findAll({
      where: { name: nmae_list },
    });
    
    if (questions.length) {
      // questions.forEach(async function (record, key) {
      for(let record of questions) {
        if (record.survey_provider_id) {
          let precode = '';
          switch (record.name) {
            //get precodes
            case 'GENDER':
              if (record.survey_provider_id == 1) {
                if (member_details.gender == 'male') {
                  precode = 1;
                } else if (member_details.gender == 'female') {
                  precode = 2;
                }
              }
              else if (record.survey_provider_id == 3) {
                if (member_details.gender == 'male') {
                  precode = 111;
                } else if (member_details.gender == 'female') {
                  precode = 112;
                }
              }
              else if (record.survey_provider_id == 4) {
                if (member_details.gender == 'male') {
                  precode = 58;
                } else if (member_details.gender == 'female') {
                  precode = 59;
                }
              }
              break;
            case 'ZIP':
              precode = member_details.zip_code;
              break;
            case 'REGION':
              precode = member_details.city;
              break;
            case 'AGE':
              if (member_details.dob) {
                var dob = new Date(member_details.dob);
                precode = new Date(new Date() - dob).getFullYear() - 1970;
              }
              break;
              case 'STATE':
                if(member_details.state)
                  precode = member_details.state
                break;
              
          }
          if (precode) {
            let precode_id = ''
            let survey_answer_precodes = await SurveyAnswerPrecodes.findOne({where:{
              precode:record.survey_provider_question_id,
              survey_provider_id: record.survey_provider_id,
              option:precode
            }})
            if(survey_answer_precodes){
              precode_id = survey_answer_precodes.id
              precode = ''
            }
            member_eligibility.push({
              member_id: member_id,
              survey_question_id: record.id,
              survey_answer_precode_id: precode_id,
              open_ended_value: precode
            });
          }
        }
      }//
      await MemberEligibilities.destroy({
        where: { member_id: member_id },
        force: true,
      });
      await MemberEligibilities.bulkCreate(member_eligibility);
    }
    return;
  }
  //change password
  async changePassword(req, member) {
    let member_status = true;
    let member_message = 'Successfully updated!';
    try {
      // const member_id = req.session.member.id;
      const member_id = member.id;
      var password_regex = this.password_regex;
      const schema = Joi.object({
        old_password: Joi.string().required(),
        new_password: Joi.string().required(),
        confirm_password: Joi.string().required(),
      });

      const { error, value } = schema.validate(req.body);

      if (error) {
        member_status = false;
        member_message = error.details.map((err) => err.message);
      }
      if (!password_regex.test(value.new_password)) {
        member_status = false;
        member_message = 'Password does not match the pattern.';
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
        req.session.flash = { message: member_message, success_status: true };
        // res.redirect('/');
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
      include: [
        {
          model: MemberBalance,
          as: 'member_amounts',
          attributes: ['amount'],
          where: { amount_type: 'cash' },
        },
        {
          model: CompanyPortal,
          // attributes: ['compnay_id'],
        },
      ],
    });
    member = JSON.parse(JSON.stringify(member));

    //get admin and super admin
    const options = {};
    options.include = [
      {
        model: Company,
        where: {
          id: member.CompanyPortal.company_id,
        },
        attributes: [],
      },
      {
        model: Group,
        attributes: [],
        nested: false,
        where: { name: 'Admin' },
      },
    ];
    options.attributes = ['email'];
    let result = await User.findAll(options);
    result = JSON.parse(JSON.stringify(result));
    result = result.map((x) => x.email);

    //get withdrawal type
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

    //check all conditions
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
    var ip = req.ip;
    if (Array.isArray(ip)) {
      ip = ip[0];
    } else {
      ip = ip.replace('::ffff:', '');
    }
    if (request_data.email === '') {
      return {
        member_status: false,
        member_message: 'Please enter payment email',
      };
    }
    var email_regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (!email_regex.test(request_data.email)) {
      return {
        member_status: false,
        member_message: 'Please enter valid payment email',
      };
    }

    await MemberPaymentInformation.updatePaymentInformation({
      member_id: request_data.member_id,
      payment_email: request_data.email,
    });
    let withdrawal_req_data = {
      member_id: request_data.member_id,
      amount: withdrawal_amount,
      amount_type: 'cash',
      currency: 'USD',
      status: 'pending',
      requested_on: new Date(),
      payment_email: request_data.email,
      withdrawal_type_id: parseInt(request_data.withdrawal_type_id),
      ip: ip,
    };
    let transaction_resp = {};
    if (
      withdrawal_type.slug == 'instant_paypal' ||
      withdrawal_type.slug == 'skrill'
    ) {
      withdrawal_req_data.note = 'Withdrawal request auto approved';
      withdrawal_req_data.transaction_made_by = request_data.member_id;
      withdrawal_req_data.status = 'approved';

      //Insert into member transaction and update balance
      transaction_resp =
        await MemberTransaction.updateMemberTransactionAndBalance({
          member_id: request_data.member_id,
          amount: -withdrawal_amount,
          note: 'Withdrawal request for $' + withdrawal_amount,
          type: 'withdraw',
          amount_action: 'member_withdrawal',
          created_by: request_data.member_id,
          status: withdrawal_type.slug == 'instant_paypal' ? 1 : 2,
        });

      if (withdrawal_type.slug == 'instant_paypal') {
        const paypal_class = new Paypal(req.session.company_portal.id);
        const create_resp = await paypal_class.payout([
          {
            amount: withdrawal_amount,
            currency: 'USD',
            member_id: request_data.member_id,
            email: request_data.email,
            first_name: member.first_name,
            last_name: member.last_name,
            member_transaction_id: transaction_resp.transaction_id,
          },
        ]);
        // console.log('create_resp', create_resp);
        if (create_resp.status) {
          await MemberTransaction.update(
            { batch_id: create_resp.batch_id, status: 2 },
            { where: { id: transaction_resp.transaction_id } }
          );
        }
      }
      //paypal payment section
    }
    if (transaction_resp.status)
      withdrawal_req_data.member_transaction_id =
        transaction_resp.transaction_id;
    // Insert in WithdrawalRequest
    // console.log('====================', withdrawal_req_data);
    const res = await WithdrawalRequest.create(withdrawal_req_data);

    //member activity
    const activityEventbus = eventBus.emit('member_activity', {
      member_id: request_data.member_id,
      action: 'Member cash withdrawal request',
    });
    // console.log(withdrawal_type, member);
    if (
      withdrawal_type.slug == 'instant_paypal' ||
      withdrawal_type.slug == 'skrill'
    ) {
      // email body for member
      let member_mail = await this.sendMailEvent({
        action: 'Member Cash Withdrawal',
        data: {
          email: member.email,
          details: {
            members: member,
            withdraw_requests: {
              amount: withdrawal_amount,
              date: moment(new Date()).format('llll'),
            },
          },
        },
        req: req,
      });
    } else {
      let member_mail = await this.sendMailEvent({
        action: 'Withdraw Request Member',
        data: {
          email: member.email,
          details: {
            members: member,
            withdraw_requests: {
              amount: withdrawal_amount,
              date: moment(new Date()).format('llll'),
            },
          },
        },
        req: req,
      });
    }

    // email body for admin
    let admin_mail = await this.sendMailEvent({
      action: 'Withdraw Request Admin',
      data: {
        email: result,
        details: {
          members: {
            ...member,
            amount: withdrawal_amount,
            requested_on: moment(new Date()).format('llll'),
          },
          withdraw_requests: {
            amount: withdrawal_amount,
            requested_on: moment(new Date()).format('llll'),
          },
        },
      },
      req: req,
    });

    return {
      member_status: true,
      member_message: 'Action executed successfully',
    };
  }

  //send mail event call
  async sendMailEvent(mail_data) {
    return eventBus.emit('send_email', mail_data);
  }

  async getLoginStreak(req, res) {
    try {
      //login streak
      let login_streak = await db.sequelize.query(
        'SELECT MAX(streak) AS streak FROM ( SELECT member_id, `created_at`, DATEDIFF(NOW(), `created_at`), @streak := IF( DATEDIFF(NOW(), `created_at`) - @days_diff > 1, @streak, IF(@days_diff := DATEDIFF(NOW(), `created_at`), @streak+1, @streak+1)) AS streak FROM member_activity_logs CROSS JOIN (SELECT @streak := 0, @days_diff := -1) AS vars WHERE member_id = ? AND `created_at` <= NOW() ORDER BY `created_at` DESC) AS t;',
        {
          replacements: [req.session.member.id],
          type: QueryTypes.SELECT,
        }
      );
      res.json({
        status: true,
        data: {
          streak: login_streak[0].streak,
          member_firstname: req.session.member.first_name,
        },
      });
    } catch (e) {
      console.log(e);
      res.json({
        status: false,
        data: e,
      });
    }
  }
  //meber forgot password
  async forgotPassword(req, res) {
    const schema = Joi.object({
      email: Joi.string().email().required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      let error_msg = error.details.map((err) => err.message);
      req.session.flash = { error: error_msg.join(',') };
      res.redirect('back');
    } else {
      //user details
      const member = await Member.findOne({ where: { email: value.email } });
      if (!member) {
        req.session.flash = { error: 'Email is not registered' };
        res.redirect('back');
      } else {
        req.headers.site_id = member.company_portal_id;
        let reset_obj = {
          id: member.id,
          email: member.email,
          date: new Date(),
        };
        reset_obj = JSON.stringify(reset_obj);
        let base64data = Buffer.from(reset_obj, 'utf8');
        let base64String = base64data.toString('base64');
        //send mail
        let evntbus = eventBus.emit('send_email', {
          action: 'Forgot Password',
          data: {
            email: value.email,
            details: {
              reset_password_link:
                process.env.CLIENT_API_PUBLIC_URL +
                '/reset-password?hash=' +
                base64String,
            },
          },
          req: req,
        });
        req.session.flash = {
          message: 'Reset password mail has been sent to your email',
          success_status: true,
        };
        res.redirect('back');
      }
    }
  }
  //reset password
  async resetPassword(req, res) {
    const schema = Joi.object({
      hash: Joi.string().required(),
      password: Joi.string().required(),
      c_password: Joi.optional().allow(''),
    });
    try {
      const { error, value } = schema.validate(req.body);
      var password_regex = this.password_regex;
      let hash_obj = Buffer.from(req.body.hash, 'base64');
      hash_obj = hash_obj.toString('utf8');
      hash_obj = JSON.parse(hash_obj);
      if (error) {
        req.session.flash = { error: 'Link expired.' };
        res.redirect('back');
        return;
      }
      if (!password_regex.test(value.password)) {
        req.session.flash = { error: 'Password does not match the pattern.' };
        res.redirect('back');
        return;
      }
      //user details
      const member = await Member.findOne({ where: { id: hash_obj.id } });
      if (!member) {
        req.session.flash = { error: 'Member not found.' };
        res.redirect('/');
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(value.password, salt);
      let update_user = await Member.update(
        { password: password },
        { where: { id: hash_obj.id } }
      );
      req.session.flash = {
        message: 'Password updated.',
        success_status: true,
      };
      res.redirect('/');
    } catch (e) {
      console.log(e);
      req.session.flash = { error: 'Link expired.' };
      res.redirect('back');
    }
  }

  //payment information update
  // async updatePaymentInformation(data) {
  //   await MemberPaymentInformation.update(
  //     {
  //       status: 0,
  //     },
  //     {
  //       where: {
  //         member_id: data.member_id,
  //       },
  //     }
  //   );
  //   let payment_methods = await PaymentMethod.findAll({
  //     where: { status: 1 },
  //     attributes: ['id'],
  //   });
  //   // console.log(payment_methods);
  //   if (payment_methods) {
  //     payment_methods = payment_methods.map((methods) => {
  //       return {
  //         member_id: data.member_id,
  //         payment_method_id: methods.id,
  //         name: 'email',
  //         value: data.payment_email,
  //         created_by: data.member_id,
  //         status: 1,
  //       };
  //     });

  //     //bulck create isp list
  //     await MemberPaymentInformation.bulkCreate(payment_methods);
  //   }
  //   return true;
  // }
}
module.exports = MemberAuthController;
