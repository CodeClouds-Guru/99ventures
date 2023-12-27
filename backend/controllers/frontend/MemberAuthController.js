const Joi = require('joi');
const {
  sequelize,
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
  CompanyPortal,
  Company,
  User,
  Group,
  PaymentMethodFieldOption,
  CountrySurveyQuestion,
  SurveyProvider,
  CountryConfiguration,
  State,
  PromoCode,
  NewsReaction,
  News,
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
const TolunaHelper = require('../../helpers/Toluna');
const TolunaAge = require('../../config/toluna_age.json');
const { generateUserIdForSurveyProviders } = require('../../helpers/global');
// const IpQualityScoreClass = require('../helpers/IpQualityScore');
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
    this.manualMemberEligibility = this.manualMemberEligibility.bind(this);
    this.checkCountryBlacklistedFromIp =
      this.checkCountryBlacklistedFromIp.bind(this);
    // this.updatePaymentInformation = this.updatePaymentInformation.bind(this);
    this.password_regex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,30}$/;
    this.getCompanyPortal = this.getCompanyPortal.bind(this);
    this.redeemPromoCode = this.redeemPromoCode.bind(this);
    this.newsReaction = this.newsReaction.bind(this);
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
        if (member.status != 'member' && member.status != 'suspended') {
          member_status = false;
          member_message =
            'Your account has been suspended. Please contact our admin via support ticket';
        }
      }
    }
    if (member_status) {
      req.session.member = member;
      if (!member.profile_completed_on) redirect_page = '/profile';
      let activityEventbus = eventBus.emit('member_activity', {
        member_id: member.id,
        action: 'Member Logged In',
      });
      await Member.update(
        { last_active_on: new Date() },
        { where: { id: member.id } }
      );
      res.redirect(redirect_page);
    } else {
      req.session.flash = { error: member_message };
      res.redirect('back');
    }
  }
  //signup
  async signup(req, res) {
    try {
      // let company_portal_id = req.session.company_portal.id;
      // req.headers.site_id = company_portal_id;
      // let company_id = req.session.company_portal.company_id;

      //rewritting the company portal ids
      const companyPortal = await this.getCompanyPortal(req);
      let company_portal_id = companyPortal.id;
      req.headers.site_id = company_portal_id;
      let company_id = companyPortal.company_id;
      //rewritting the company portal ids

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

      //check if country is blacklisted
      const balcklisted_country = await this.checkCountryBlacklistedFromIp(
        ip,
        company_portal_id
      );
      if (balcklisted_country > 0) {
        req.session.flash = {
          error:
            'Unfortunately, MoreSurveys is currently unavailable in your country.Don’t worry, we will be opening up to more countries soon, so please check back regularly. Thank you for your patience.',
        };
        return res.redirect('back');
      }
      if (ip_ckeck.status) {
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(req.body.password, salt);
        const email = req.body.email.trim().toLowerCase();
        let existing_email_or_username = await Member.count({
          where: {
            company_portal_id: company_portal_id,
            email,
          },
        });
        let member_details = [];
        if (existing_email_or_username > 0) {
          member_status = false;
          member_message = 'Sorry! this email has already been taken';
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
            first_name: req.body.first_name.trim(),
            last_name: req.body.last_name.trim(),
            email: email,
            password: password,
            membership_tier_id: 1,
            company_portal_id: company_portal_id,
            company_id: company_id,
            status: 'validating',
            dob: '1990-01-01 00:00:00',
            // username: `${req.body.email.split('@')[0]}-${new Date().getTime()}`,
            username: new Date().getMilliseconds(),
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
            where: { email: email },
          });
          let model = await Member.update(
            {
              username: member_details.id,
            },
            {
              where: { id: member_details.id },
            }
          );

          let hash_obj = { id: member_details.id, email: email };
          var buf = genarateHash(JSON.stringify(hash_obj));
          member_details.email_confirmation_link =
            'https://' +
            req.session.company_portal.domain +
            '/email-verify/' +
            buf;
          let evntbus = eventBus.emit('send_email', {
            action: 'Welcome',
            data: {
              email: email,
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
          // res.redirect('/notice');
          return res.redirect('/alert');
        } else {
          req.session.flash = { error: member_message };
          return res.redirect('back');
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
      note: 'Registration Bonus',
      status: '2',
      type: 'credited',
      amount_action: 'registration_bonus',
      balance: registration_bonus.settings_value,
      currency: 'USD',
      created_by: 0,
    });
    //send mail
    let req = {
      headers: {
        site_id: member_details.company_portal_id,
      },
      user: member_details,
    };
    let evntbus = eventBus.emit('send_email', {
      action: 'Registration Bonus',
      data: {
        email: member_details.email,
        details: {
          members: member_details,
          registration_bonus: parseFloat(
            registration_bonus.settings_value
          ).toFixed(2),
        },
      },
      req: req,
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
          // username: member_details.id,
          email_verified_on: new Date(),
          status: 'member',
        },
        {
          where: { id: member_details.id },
        }
      );
      req.session.member = member_details;
      //set member eligibility
      if (member_details.profile_completed_on) {
        await this.setMemberEligibility(member_details.id);
      }
      // await this.setMemberEligibility(
      //   member_details.id,
      //   member_details.profile_completed_on
      // );
      let activityEventbus = eventBus.emit('member_activity', {
        member_id: member_details.id,
        action: 'Email Verified',
      });
      let loginActivityEventbus = eventBus.emit('member_activity', {
        member_id: member_details.id,
        action: 'Member Logged In',
      });
      // req.session.flash = {
      //   message:
      //     'Welcome to Moresurveys! Your email has been verified successfully.',
      //   success_status: true,
      // };
      let bonus = await Setting.findOne({
        where: {
          settings_key: 'registration_bonus',
          company_portal_id: member_details.company_portal_id,
        },
      });
      res.cookie('email_verified', true, {
        maxAge: 900000,
      });
      res.cookie('registration_bonus', bonus.settings_value, {
        maxAge: 900000,
      });

      let redirect_page = '';
      if (!member_details.profile_completed_on) redirect_page = '/profile';
      else {
        let company_portal_id = req.session.company_portal.id;
        redirect_page = await Page.findOne({
          where: { company_portal_id: company_portal_id, after_signin: 1 },
        });
        if (redirect_page) redirect_page = '/' + redirect_page.slug;
        else redirect_page = '/';
      }
      if (req.session.member) {
        res.redirect(redirect_page);
        return;
      }
    }
    res.redirect('/');
    return;
  }

  //update member profile
  async profileUpdate(req, res) {
    let member_status = true;
    let member_message = 'Successfully updated!';
    let getmember = {};
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
          username: Joi.string().alphanum().required().label('User Name'),
          country: Joi.number().required().label('Country'),
          zipcode: Joi.string().required().label('Zipcode'),
          city: Joi.string().optional().label('City'),
          gender: Joi.string().required().label('Gender'),
          phone_no: Joi.string().required().label('Phone number'),
          country_code: Joi.optional().allow('').label('Phone code'),
          address_1: Joi.string().allow('').required().label('Address 1'),
          address_2: Joi.string().allow('').optional().label('Address 2'),
          state: Joi.string().allow('').optional().label('State'),
          email_alerts: Joi.allow('').optional().label('Email Alerts'),
          dob: Joi.string().required().label('DOB'),
        });
        if (member.profile_completed_on === null) {
          const { error, value } = schema.validate(req.body);

          if (error) {
            member_status = false;
            member_message = error.details.map((err) => err.message);
          }
        } else {
          req.body.username = member.username;
        }
        if (
          !member.profile_completed_on &&
          member.username === req.body.username
        ) {
          member_status = false;
          member_message = 'You need to set username to complete your profile';
        }
        // console.log('===============req.body', req.body);

        //check member username
        let member_username = await Member.count({
          where: {
            username: req.body.username,
            id: { [Op.ne]: member.id },
          },
        });
        if (member_username > 0) {
          member_status = false;
          member_message = 'Username already exists.';
        }

        if (member_status) {
          req.headers.site_id = member.company_portal_id;
          if (!member.profile_completed_on) {
            await Member.creditBonusByType(
              member,
              'complete_profile_bonus',
              req
            );
            req.body.profile_completed_on = new Date();
            let activityEventbus = eventBus.emit('member_activity', {
              member_id: member.id,
              action: 'Profile Completed',
            });

            let bonus = await Setting.findOne({
              where: {
                settings_key: 'complete_profile_bonus',
                company_portal_id: member.company_portal_id,
              },
            });
            res.cookie('member_profile_update', true, {
              maxAge: 900000,
            });
            res.cookie('profile_completed_bonus', bonus.settings_value, {
              maxAge: 900000,
            });
          }
          req.body.country_id = req.body.country;
          req.body.zip_code = req.body.zipcode
            ? req.body.zipcode.trim()
            : member.zip_code;
          request_data = req.body;
          request_data.city = req.body.city
            ? req.body.city.trim()
            : member.city;
          request_data.updated_by = member_id;

          // request_data.username = member.username;
          // request_data.avatar = null;
          if (req.files) {
            request_data.avatar = await Member.updateAvatar(req, member);
          }
          // console.log('==============request_data==============', request_data);
          let model = await Member.update(request_data, {
            where: { id: member_id },
          });

          //set eligibility
          getmember = await Member.findOne({
            attributes: ['id', 'profile_completed_on'],
            where: {
              id: member_id,
            },
          });
          if (getmember.profile_completed_on !== null) {
            await this.setMemberEligibility(member_id);
          }
          // await this.setMemberEligibility(
          //   member_id,
          //   member.profile_completed_on
          // );
          let email_alerts = req.body.email_alerts || null;

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
        req.session.member = getmember;
        if (request_data.avatar) {
          req.session.member.avatar =
            process.env.S3_BUCKET_OBJECT_URL + request_data.avatar;
        } else req.session.member.avatar = member.avatar;
        if (member.profile_completed_on)
          req.session.flash = { message: member_message, success_status: true };
      } else {
        req.session.flash = { error: member_message };
      }
      // console.log(req.session.flash);
      if (method === 'POST') {
        res.redirect('back');
      } else {
        res.json({ status: member_status, message: member_message });
      }
    }
  }

  //Start - Api to insert Member Eligibility manually
  async manualMemberEligibility(req, res) {
    let members = await Member.findAll({
      // attributes: ['id'],
      where: {
        // id: 249,
        profile_completed_on: {
          [Op.ne]: null,
        },
        status: 'member',
        deleted_at: null,
        country_id: 226,
        created_at: {
          [Op.lt]: '2023-10-01',
        },
      },
      limit: 10,
    });

    for (const member of members) {
      // await MemberAuthController.prototype.updateMemberEligibility(member.id, member.profile_completed_on);
      this.setMemberEligibility(member.id);
    }
    res.json({ data: members });
  }
  //Start - Api to insert Member Eligibility manually

  //set member eligibility
  /*async setMemberEligibility(member_id, profile_completed_on) {
    try {
      let member_details = await Member.findOne({
        where: { id: member_id },
        include: {
          model: CompanyPortal,
          attributes: ['domain', 'name'],
        },
      });
      var member_eligibility = [];
      var toluna_questions = [];
      //eligibility entry for gender

      let name_list = [
        'GENDER',
        'ZIP',
        'STATE',
        'REGION',
        'AGE',
        'POSTAL CODE',
        'STANDARD_Postal_Code_GB',
        'STANDARD_Postal_Area',
        'SAMPLECUBE_ZIP_UK',
        'STANDARD_POSTAL_CODE_GB',
        'Zipcode',
        'Region 1',
        'Region 2',
        'Fulcrum_Region_UK_NUTS_I',
        'Fulcrum_Region_UK_NUTS_II',
        'STANDARD_Region_GB',
        'REGION_UK_NUTS_I',
        'STANDARD_UK_REGION_PLACE',
        'city',
      ];
      // let question_id_list = [
      //   229, 45, 143, 726, 29532, 211, 60, 43, 5784, 631, 247, 212, 59, 42, 290,
      //   237, 79362, 79388, 79335, 79336, 12452, 12453,
      // ];
      let questions = await SurveyQuestion.findAll({
        // logging: console.log,
        attributes: [
          'id',
          'question_text',
          'name',
          'survey_provider_id',
          'survey_provider_question_id',
          'question_type',
        ],
        // where: { survey_provider_question_id: { [Op.in]: question_id_list } },
        where: { name: { [Op.in]: name_list } },
        include: [
          {
            model: CountrySurveyQuestion,
            attributes: ['id'],
            where: { country_id: member_details.country_id },
            required: true,
          },
          {
            model: SurveyAnswerPrecodes,
            attributes: ['id', 'option', 'option_text'],
            where: { country_id: member_details.country_id },
            required: false,
          },
          {
            model: SurveyProvider,
            attributes: ['name'],
            required: false,
          },
        ],
      });
      // console.log('------------------questions-----------------', questions);
      if (questions.length) {
        // questions.forEach(async function (record, key) {
        for (let record of questions) {
          if (record.survey_provider_id) {
            let precode = '';
            let precode_id = '';
            var question_name = record.name;
            question_name = question_name.toUpperCase();
            switch (question_name) {
              //get precodes
              case 'GENDER':
                var pre = record.SurveyAnswerPrecodes.find((element) => {
                  return (
                    element.option_text.toLowerCase() ===
                    member_details.gender.toLowerCase()
                  );
                });
                // console.log('==========pre', pre.dataValues);
                // if (record.survey_provider_id === 6) {
                //   toluna_questions.push({
                //     QuestionID: record.id,
                //     Answers: [{ AnswerID: pre.id }],
                //   });
                // }
                if (record.survey_provider_id !== 6)
                  precode_id = pre ? pre.id : '';
                break;
              case 'ZIP':
              case 'ZIPCODE':
              case 'POSTAL CODE':
              case 'STANDARD_POSTAL_CODE_GB':
              case 'STANDARD_POSTAL_AREA':
              case 'SAMPLECUBE_ZIP_UK':
              case 'STANDARD_POSTAL_CODE_GB':
              case 'PostalCodeVal':
                if (record.SurveyProvider.name === 'Purespectrum') {
                  precode = member_details.zip_code.split(' ')[0];
                } else {
                  precode = member_details.zip_code.replaceAll(/ /g, '');
                }
                break;
              case 'REGION':
              case 'REGION 1':
              case 'REGION 2':
              case 'FULCRUM_REGION_UK_NUTS_I':
              case 'FULCRUM_REGION_UK_NUTS_II':
              case 'STANDARD_REGION_GB':
              case 'REGION_UK_NUTS_I':
              case 'STANDARD_UK_REGION_PLACE':
              case 'CITY':
              case 'City of residence':
                // precode = member_details.city;
                var pre = record.SurveyAnswerPrecodes.find((element) => {
                  return (
                    element.option_text.toLowerCase() ==
                    member_details.city.toLowerCase()
                  );
                });
                // console.log('==========pre', pre.id);
                precode_id = pre ? pre.id : '';

                break;
              case 'AGE':
                if (member_details.dob) {
                  var dob = new Date(member_details.dob);
                  dob = new Date(new Date() - dob).getFullYear() - 1970;

                  var pre = record.SurveyAnswerPrecodes.find((element) => {
                    return element.option == dob;
                  });
                  // console.log('==========pre', pre.id);
                  precode_id = pre ? pre.id : '';
                }
                break;
              case 'STATE':
              case 'States NEW!':
                var pre = record.SurveyAnswerPrecodes.find((element) => {
                  return (
                    element.option_text.toLowerCase() ==
                    member_details.state.toLowerCase()
                  );
                });
                precode_id = pre ? pre.id : '';
                break;
            }

            if (precode_id || precode) {
              member_eligibility.push({
                member_id: member_id,
                country_survey_question_id: record.CountrySurveyQuestion.id,
                survey_answer_precode_id: precode_id,
                open_ended_value: precode,
              });
            }
            // }
          }
        }
        //
        await MemberEligibilities.destroy({
          where: { member_id: member_id },
          force: true,
        });
        // console.log('--------member_eligibility--------', member_eligibility);
        await MemberEligibilities.bulkCreate(member_eligibility);
      }
      if (!profile_completed_on) {
        // var toluna_questions = [];
        // if (member_details.gender == 'male') {
        //   toluna_questions.push({
        //     QuestionID: 1001007,
        //     Answers: [{ AnswerID: 2000247 }],
        //   });
        // } else if (member_details.gender == 'female') {
        //   toluna_questions.push({
        //     QuestionID: 1001007,
        //     Answers: [{ AnswerID: 2000246 }],
        //   });
        // }
        // toluna_questions.push({
        //   "QuestionID": 1001042,
        //   "Answers": [{"AnswerValue":member_details.zip_code}]
        // })
        // try {
        //   let tolunaHelper = new TolunaHelper();
        //   const payload = {
        //     PartnerGUID: process.env.PARTNER_GUID,
        //     MemberCode: member_details.CompanyPortal.name + '_' + member_details.id,
        //     Email: (member_details.email).toLowerCase(),
        //     BirthDate: moment(member_details.dob).format('MM/DD/YYYY'),
        //     PostalCode: member_details.zip_code,
        //     // "IsActive": true,  // Default is True
        //     // "IsTest": true,
        //     RegistrationAnswers: toluna_questions,
        //   };
        //   let t = await tolunaHelper.addMemebr(payload);
        // } catch (error) {
        //   console.log(error);
        // }
      }
      return;
    } catch (error) {
      console.error(error);

      // res.redirect('back');
    }
  }*/

  async setMemberEligibility(member_id) {
    try {
      let member_details = await Member.findOne({
        where: { id: member_id },
        include: {
          model: CompanyPortal,
          attributes: ['domain', 'name'],
        },
      });
      var member_eligibility = [];
      var toluna_questions = [];
      let name_list = [
        'GENDER',
        'ZIP',
        'STATE',
        'REGION',
        'AGE',
        'POSTAL CODE',
        'STANDARD_Postal_Code_GB',
        'STANDARD_Postal_Area',
        'SAMPLECUBE_ZIP_UK',
        'STANDARD_POSTAL_CODE_GB',
        'Zipcode',
        'Region 1',
        'Region 2',
        'Fulcrum_Region_UK_NUTS_I',
        'Fulcrum_Region_UK_NUTS_II',
        'STANDARD_Region_GB',
        'REGION_UK_NUTS_I',
        'STANDARD_UK_REGION_PLACE',
        'city',
        'PostalCodeVal',
        'City of residence',
      ];

      let questions = await SurveyQuestion.findAll({
        attributes: [
          'id',
          'question_text',
          'name',
          'survey_provider_id',
          'survey_provider_question_id',
          'question_type',
        ],
        where: {
          name: { [Op.in]: name_list },
          question_type: {
            [Op.ne]: 'ComputedType', // Computed Type questions are not supported by Toluna
          },
        },
        include: [
          {
            model: CountrySurveyQuestion,
            attributes: ['id'],
            where: { country_id: member_details.country_id },
            required: true,
          },
          {
            model: SurveyAnswerPrecodes,
            attributes: ['id', 'option', 'option_text'],
            where: { country_id: member_details.country_id },
            required: false,
          },
          {
            model: SurveyProvider,
            attributes: ['name'],
            required: false,
          },
        ],
      });
      if (questions.length) {
        for (let record of questions) {
          if (record.survey_provider_id) {
            let precode = '';
            let precode_id = '';
            var question_name = record.name;
            question_name = question_name.toUpperCase();
            switch (question_name) {
              case 'GENDER':
                var pre = record.SurveyAnswerPrecodes.find((element) => {
                  return (
                    element.option_text.toLowerCase() ===
                    member_details.gender.toLowerCase()
                  );
                });
                // if (record.survey_provider_id === 6) {
                //   toluna_questions.push({
                //     QuestionID: record.id,
                //     Answers: [{ AnswerID: pre.id }],
                //   });
                // }
                // if (record.survey_provider_id !== 6)
                precode_id = pre ? pre.id : '';

                if (record.survey_provider_id === 6 && pre !== undefined) {
                  toluna_questions.push({
                    QuestionID: record.survey_provider_question_id,
                    Answers: [{ AnswerID: pre.option }],
                  });
                }
                break;
              case 'ZIP':
              case 'ZIPCODE':
              case 'POSTAL CODE':
              case 'STANDARD_POSTAL_AREA':
              case 'SAMPLECUBE_ZIP_UK':
              case 'STANDARD_POSTAL_CODE_GB':
              case 'POSTALCODEVAL':
                precode = member_details.zip_code.split(' ')[0];
                // if (record.SurveyProvider.name === 'Purespectrum') {
                //   precode = member_details.zip_code.split(' ')[0];
                // } else {
                //   precode = member_details.zip_code.replaceAll(/ /g, '');
                // }
                break;
              case 'REGION':
              case 'REGION 1':
              case 'REGION 2':
              case 'FULCRUM_REGION_UK_NUTS_I':
              case 'FULCRUM_REGION_UK_NUTS_II':
              case 'STANDARD_REGION_GB':
              case 'REGION_UK_NUTS_I':
              case 'STANDARD_UK_REGION_PLACE':
              case 'CITY':
              case 'City OF RESIDENCE':
                // precode = member_details.city;
                var pre = record.SurveyAnswerPrecodes.find((element) => {
                  return (
                    element.option_text.toLowerCase() ==
                    member_details.city.toLowerCase()
                  );
                });
                precode_id = pre ? pre.id : '';
                if (record.survey_provider_id === 6 && pre !== undefined) {
                  toluna_questions.push({
                    QuestionID: record.survey_provider_question_id,
                    Answers: [{ AnswerId: pre.option }],
                  });
                }
                break;
              case 'AGE':
                if (member_details.dob) {
                  var dob = new Date(member_details.dob);
                  dob = new Date(new Date() - dob).getFullYear() - 1970;

                  var pre = record.SurveyAnswerPrecodes.find((element) => {
                    return element.option == dob;
                  });
                  precode_id = pre ? pre.id : '';
                }
                break;
              case 'STATE':
                if (member_details.state !== null) {
                  var pre = record.SurveyAnswerPrecodes.find((element) => {
                    return (
                      element.option_text.toLowerCase() ==
                      member_details.state.toLowerCase()
                    );
                  });
                  precode_id = pre ? pre.id : '';
                  if (record.survey_provider_id === 6 && pre !== undefined) {
                    toluna_questions.push({
                      QuestionID: record.survey_provider_question_id,
                      Answers: [{ AnswerId: pre.option }],
                    });
                  }
                }
                break;
            }

            if (precode_id || precode) {
              member_eligibility.push({
                member_id: member_id,
                country_survey_question_id: record.CountrySurveyQuestion.id,
                survey_answer_precode_id: precode_id,
                open_ended_value: precode,
              });
            }
          }
        }

        await MemberEligibilities.destroy({
          where: { member_id: member_id },
          force: true,
        });

        await MemberEligibilities.bulkCreate(member_eligibility);
        if (toluna_questions.length) {
          MemberAuthController.prototype.tolunaProfileCreateAndUpdate(
            member_details,
            toluna_questions
          );
        }
      }
      return;
    } catch (error) {
      console.error(error);
      // res.redirect('back');
    }
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
    req.session.impersonation = null;
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
      if (member_status === true) {
        req.session.flash = {
          message: member_message,
          success_status: true,
        };
        // res.redirect('/paid-surveys');
      }
      res.json({
        status: member_status,
        message: member_message,
        data: response,
      });
    }
  }

  //Withdrawal request main function - new
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
    //get admin and super admin - end

    //get withdrawal type
    let payment_method_details = await PaymentMethod.findOne({
      where: { id: request_data.payment_method_id },
      attributes: [
        'id',
        'name',
        'slug',
        'type_user_info_again',
        'minimum_amount',
        'maximum_amount',
        'fixed_amount',
        'withdraw_redo_interval',
        'past_withdrawal_options',
        'past_withdrawal_count',
        'payment_type',
        'api_username',
        'api_password',
        'parent_payment_method_id',
      ],
      include: {
        model: PaymentMethodFieldOption,
        attributes: ['field_name', 'field_type'],
        required: false,
      },
    });
    payment_method_details = JSON.parse(JSON.stringify(payment_method_details));

    //call for withdrawal req validation
    var amountValidationResp =
      await WithdrawalRequest.withdrawalRequestAmountValidation(
        payment_method_details,
        withdrawal_amount,
        request_data.member_id,
        member
      );
    // console.log(amountValidationResp);
    if (!amountValidationResp.member_status) {
      return amountValidationResp;
    }
    //call for field validation
    var fieldValidationResp =
      await WithdrawalRequest.withdrawalRequestFieldValidation(
        payment_method_details,
        req.body
      );
    if (!fieldValidationResp.member_status) {
      return fieldValidationResp;
    }
    //check for same payment info
    var samePaymentInfoResp = await WithdrawalRequest.checkIfSamePaymentInfo(
      fieldValidationResp.payment_field,
      request_data.member_id
    );
    // console.log(samePaymentInfoResp);
    if (!samePaymentInfoResp.member_status) {
      return samePaymentInfoResp;
    }
    //check If Different Payment Method
    var checkIfDifferentPaymentMethodResp =
      await WithdrawalRequest.checkIfDifferentPaymentMethod(
        payment_method_details,
        request_data.member_id
      );
    if (!checkIfDifferentPaymentMethodResp.member_status) {
      return checkIfDifferentPaymentMethodResp;
    }
    //withdrawal process
    if (fieldValidationResp.member_payment_info.length > 0) {
      await MemberPaymentInformation.updatePaymentInformation({
        member_id: request_data.member_id,
        member_payment_info: fieldValidationResp.member_payment_info,
      });
      var ip = req.ip;
      if (Array.isArray(ip)) {
        ip = ip[0];
      } else {
        ip = ip.replace('::ffff:', '');
      }
      var index = fieldValidationResp.member_payment_info.findIndex(
        (info) => info.field_name === 'email'
      );

      let withdrawal_req_data = {
        member_id: request_data.member_id,
        amount: withdrawal_amount,
        amount_type: 'cash',
        currency: 'USD',
        status: 'pending',
        requested_on: new Date(),
        // payment_email: request_data.payment_field,
        payment_email:
          index !== -1
            ? fieldValidationResp.member_payment_info[index].field_value
            : fieldValidationResp.member_payment_info[0].field_value,
        withdrawal_type_id: parseInt(request_data.payment_method_id),
        ip: ip,
        note: 'Withdrawal request processed and waiting for approval',
        transaction_made_by: request_data.member_id,
      };
      var transaction_status =
        payment_method_details.api_username !== '' ? 1 : 2;
      if (payment_method_details.payment_type === 'Manual') {
        transaction_status = 1;
      }
      let transaction_data = {
        member_id: request_data.member_id,
        amount: -withdrawal_amount,
        note: 'Withdrawal request for $' + withdrawal_amount,
        type: 'withdraw',
        amount_action: 'member_withdrawal',
        created_by: request_data.member_id,
        modified_total_earnings:
          parseFloat(member.member_amounts[0].amount) -
          parseFloat(withdrawal_amount),
        // status: payment_method_details.payment_type === 'Auto' ? 2 : 1,
        status: transaction_status,
      };
      var transaction_resp = await MemberTransaction.insertTransaction(
        transaction_data
      );
      if (payment_method_details.payment_type === 'Auto') {
        withdrawal_req_data.note = 'Withdrawal request auto approved';
        withdrawal_req_data.transaction_made_by = request_data.member_id;

        if (
          payment_method_details.api_username !== '' &&
          payment_method_details.api_password !== ''
        ) {
          withdrawal_req_data.status = 'approved';
          if (payment_method_details.slug == 'instant_paypal') {
            const paypal_class = new Paypal(
              req.session.company_portal.id,
              'instant_paypal'
            );
            var paypal_request = [
              {
                amount: withdrawal_amount,
                currency: 'USD',
                member_id: request_data.member_id,
                // email: request_data.payment_field,
                first_name: member.first_name,
                last_name: member.last_name,
                member_transaction_id: transaction_resp.id,
              },
            ];
            for (const info of fieldValidationResp.member_payment_info) {
              paypal_request[0][info.field_name] = info.field_value;
            }

            const create_resp = await paypal_class.payout(paypal_request);

            if (create_resp.status) {
              await MemberTransaction.update(
                {
                  batch_id: create_resp.batch_id,
                },
                { where: { id: transaction_resp.id } }
              );
            } else {
              console.log('create_resp', create_resp);
            }
          }
        } else {
          withdrawal_req_data.status = 'completed';
        }
      }

      withdrawal_req_data.member_transaction_id = transaction_resp.id;
      await WithdrawalRequest.create(withdrawal_req_data);
      await MemberTransaction.updateMemberBalance({
        amount:
          parseFloat(member.member_amounts[0].amount) -
          parseFloat(withdrawal_amount),
        member_id: request_data.member_id,
        action: 'member_withdrawal',
        transaction_amount: withdrawal_amount,
      });
      //member activity
      const activityEventbus = eventBus.emit('member_activity', {
        member_id: request_data.member_id,
        action: 'Member cash withdrawal request',
      });
    } else {
      return {
        member_status: false,
        member_message:
          'Your request can not be processed right now. Please try again later',
      };
    }

    //response structure
    let member_message = '';
    if (
      payment_method_details &&
      payment_method_details.payment_type === 'Auto'
    ) {
      member_message =
        'You have successfully requested your payment. The requested amount will be deducted from your balance total once it has been processed by the MoreSurveys Support Team.';
    } else {
      member_message =
        'Congratulations. You have successfully withdrawn your earnings. Start taking more paid surveys here.';
    }
    return {
      member_status: true,
      member_message: member_message,
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

  //Start - Check country blacklisted
  async checkCountryBlacklistedFromIp(ip, company_portal_id) {
    const reportObj = new IpQualityScoreClass();
    const geo = await reportObj.getIpReport(ip);
    // console.log('geo=', geo);
    return await CountryConfiguration.count({
      where: {
        company_portal_id: company_portal_id,
        status: 0,
        iso: geo.report.country_code || '',
      },
    });
  }
  //End - Check country blacklisted

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

  async getStateList(req, res) {
    try {
      let options = {
        attributes: ['state'],
      };
      if (req.query.country_id) {
        options.where = {
          country_id: req.query.country_id,
        };
      }
      let data = await State.getAllStates(options);
      res.json({
        status: true,
        data,
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({
        status: false,
        message: 'Unable to get data',
      });
    }
  }

  /**
   * To create an account on Toluna.
   * The idea behind this, first of all we checked if the member account has created or not.
   * If created, we are updating the account otherwise create an account
   *
   * @param {Object} member
   * @param {Array of Object} questionAnswer
   */
  async tolunaProfileCreateAndUpdate(member, questionAnswer) {
    const tolunaHelper = new TolunaHelper();
    const memberCode = generateUserIdForSurveyProviders(
      member.CompanyPortal.name,
      member.id
    );
    if (member.country_id === 226) {
      // US Country
      var dob = new Date(member.dob);
      dob = new Date(new Date() - dob).getFullYear() - 1970;
      let ageData = TolunaAge.find((element) => {
        return element.option == dob;
      });
      if (ageData !== undefined) {
        questionAnswer.push({
          QuestionID: 1001538, // Age
          Answers: [{ AnswerId: ageData.answer_id }],
        });
      }
    }

    const payload = {
      MemberCountryId: member.country_id,
      MemberCode: memberCode,
      Email: member.email.toLowerCase(),
      BirthDate: moment(member.dob).format('MM/DD/YYYY'),
      PostalCode: member.zip_code,
      // "IsActive": true,  // Default is True
      RegistrationAnswers: questionAnswer,
    };
    if (process.env.DEV_MODE === '1' || process.env.DEV_MODE === '2') {
      payload.IsTest = true;
    }

    try {
      let checkMember = await tolunaHelper.getMember(
        memberCode,
        member.country_id
      );
      if ('MemberCode' in checkMember) {
        await tolunaHelper.updateMember(payload);
      }
    } catch (error) {
      if ('status' in error.response && error.response.status === 400) {
        try {
          await tolunaHelper.addMemebr(payload);
        } catch (err) {
          const logger = require('../../helpers/Logger')(`toluna-errror.log`);
          logger.error(err);
          logger.error(JSON.stringify(payload));
        }
      } else {
        console.log(error);
      }
    }
    return true;
  }

  // get Company Portal details for signup
  async getCompanyPortal(req) {
    var company_portal_id = await CompanyPortal.findOne({ where: { id: 1 } });
    const existing_portal = await CompanyPortal.findOne({
      where: {
        domain: {
          [Op.substring]: req.get('host'),
        },
      },
    });
    return existing_portal ? existing_portal : company_portal_id;
  }

  /**
   * Temp function
   */
  /*async updateMemberEligibility(member_id, profile_completed_on) {
    try {
      let member_details = await Member.findOne({
        where: { id: member_id },
        include: {
          model: CompanyPortal,
          attributes: ['domain', 'name'],
        },
      });
      var member_eligibility = [];
      var toluna_questions = [];
      let name_list = [
        'GENDER',
        'ZIP',
        'STATE',
        'REGION',
        'AGE',
        'POSTAL CODE',
        'STANDARD_Postal_Code_GB',
        'STANDARD_Postal_Area',
        'SAMPLECUBE_ZIP_UK',
        'STANDARD_POSTAL_CODE_GB',
        'Zipcode',
        'Region 1',
        'Region 2',
        'Fulcrum_Region_UK_NUTS_I',
        'Fulcrum_Region_UK_NUTS_II',
        'STANDARD_Region_GB',
        'REGION_UK_NUTS_I',
        'STANDARD_UK_REGION_PLACE',
        'city',
        'PostalCodeVal',
        'City of residence'
      ];

      let questions = await SurveyQuestion.findAll({
        attributes: [
          'id',
          'question_text',
          'name',
          'survey_provider_id',
          'survey_provider_question_id',
          'question_type',
        ],
        where: { 
          survey_provider_id: 6,
          name: { [Op.in]: name_list },
          question_type: {
            [Op.ne]: 'ComputedType'   // Computed Type questions are not supported by Toluna
          }
        },
        include: [
          {
            model: CountrySurveyQuestion,
            attributes: ['id'],
            where: { country_id: member_details.country_id },
            required: true,
          },
          {
            model: SurveyAnswerPrecodes,
            attributes: ['id', 'option', 'option_text'],
            where: { country_id: member_details.country_id },
            required: false,
          },
          {
            model: SurveyProvider,
            attributes: ['name'],
            required: false,
          },
        ],
      });
      if (questions.length) {
        for (let record of questions) {
          if (record.survey_provider_id) {
            let precode = '';
            let precode_id = '';
            var question_name = record.name;
            question_name = question_name.toUpperCase();
            switch (question_name) {
              case 'GENDER':
                var pre = record.SurveyAnswerPrecodes.find((element) => {
                  return (
                    element.option_text.toLowerCase() ===
                    member_details.gender.toLowerCase()
                  );
                });
                // if (record.survey_provider_id === 6) {
                //   toluna_questions.push({
                //     QuestionID: record.id,
                //     Answers: [{ AnswerID: pre.id }],
                //   });
                // }
                // if (record.survey_provider_id !== 6)
                  precode_id = pre ? pre.id : '';

                if (record.survey_provider_id === 6 && pre !== undefined) {
                  toluna_questions.push({
                    QuestionID: record.survey_provider_question_id,
                    Answers: [{ AnswerID: pre.option }],
                  });
                }
                break;
              case 'ZIP':
              case 'ZIPCODE':
              case 'POSTAL CODE':
              case 'STANDARD_POSTAL_CODE_GB':
              case 'STANDARD_POSTAL_AREA':
              case 'SAMPLECUBE_ZIP_UK':
              case 'STANDARD_POSTAL_CODE_GB':
              case 'POSTALCODEVAL':
                if (record.SurveyProvider.name === 'Purespectrum') {
                  precode = member_details.zip_code.split(' ')[0];
                } else {
                  precode = member_details.zip_code.replaceAll(/ /g, '');
                }
                break;
              case 'REGION':
              case 'REGION 1':
              case 'REGION 2':
              case 'FULCRUM_REGION_UK_NUTS_I':
              case 'FULCRUM_REGION_UK_NUTS_II':
              case 'STANDARD_REGION_GB':
              case 'REGION_UK_NUTS_I':
              case 'STANDARD_UK_REGION_PLACE':
              case 'CITY':
              case 'City OF RESIDENCE':
                // precode = member_details.city;
                var pre = record.SurveyAnswerPrecodes.find((element) => {
                  return (
                    element.option_text.toLowerCase() ==
                    member_details.city.toLowerCase()
                  );
                });
                precode_id = pre ? pre.id : '';
                if (record.survey_provider_id === 6 && pre !== undefined) {
                  toluna_questions.push({
                    QuestionID: record.survey_provider_question_id,
                    Answers: [{ AnswerId: pre.option }],
                  });
                }
                break;
              case 'AGE':
                if (member_details.dob) {
                  var dob = new Date(member_details.dob);
                  dob = new Date(new Date() - dob).getFullYear() - 1970;

                  var pre = record.SurveyAnswerPrecodes.find((element) => {
                    return element.option == dob;
                  });
                  precode_id = pre ? pre.id : '';
                }
                break;
              case 'STATE':
                if(member_details.state !== null) {
                  var pre = record.SurveyAnswerPrecodes.find((element) => {
                    return (
                      element.option_text.toLowerCase() == member_details.state.toLowerCase()
                    );
                  });
                  precode_id = pre ? pre.id : '';
                  if (record.survey_provider_id === 6 && pre !== undefined) {
                    toluna_questions.push({
                      QuestionID: record.survey_provider_question_id,
                      Answers: [{ AnswerId: pre.option }],
                    });
                  }
                }                
                break;
            }

            if (precode_id || precode) {
              member_eligibility.push({
                member_id: member_id,
                country_survey_question_id: record.CountrySurveyQuestion.id,
                survey_answer_precode_id: precode_id,
                open_ended_value: precode,
              });
            }
          }
        }

        // await MemberEligibilities.destroy({
        //   where: { member_id: member_id },
        //   force: true,
        // });
        if(profile_completed_on !== null){
          await MemberEligibilities.bulkCreate(member_eligibility);
          if (toluna_questions.length) {
            MemberAuthController.prototype.tolunaProfileCreateAndUpdate(member_details, toluna_questions);
          }
        }
      }
      return;
    } catch (error) {
      console.error(error);
      // res.redirect('back');
    }
  }*/

  //Promo code redeem by member
  async redeemPromoCode(req, res) {
    // console.log('redeemPromoCode', req);
    let resp_status = false;
    let resp_message = 'Unable to save data';
    let response = [];
    // console.log(req.body);
    const companyPortal = await this.getCompanyPortal(req);
    let company_portal_id = companyPortal.id;
    req.headers.site_id = company_portal_id;
    let company_id = companyPortal.company_id;
    req.headers.site_id = company_portal_id;
    req.headers.company_id = company_id;

    req.body.member_id = req.session.member.id;
    // req.body.member_id = 1;
    let request_data = req.body;
    var promo_code = request_data.promocode;
    try {
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
        ],
      });

      //validation
      let promocode_validation = await PromoCode.redeemPromoValidation({
        promo_code: request_data.promocode,
        company_portal_id: company_portal_id,
        member_id: req.body.member_id,
      });
      // console.log('promocode_validation', promocode_validation);
      if (!promocode_validation.resp_status) {
        resp_status = promocode_validation.resp_status;
        resp_message = promocode_validation.resp_message;
      } else {
        if (promocode_validation.data.dataValues) {
          let modified_balance =
            parseFloat(member.member_amounts[0].amount) +
            parseFloat(promocode_validation.data.dataValues.cash);
          let transaction_data = {
            member_id: request_data.member_id,
            amount: parseFloat(promocode_validation.data.dataValues.cash),
            note: promocode_validation.data.dataValues.code,
            type: 'credited',
            amount_action: 'promo_code',
            created_by: request_data.member_id,
            modified_total_earnings: modified_balance,
            status: 2,
          };
          var transaction_resp = await MemberTransaction.insertTransaction(
            transaction_data
          );
          await MemberBalance.update(
            { amount: modified_balance },
            {
              where: {
                member_id: request_data.member_id,
                amount_type: 'cash',
              },
            }
          );
          await db.sequelize.query(
            'INSERT INTO member_promo_codes (promo_code_id, member_id) VALUES (?, ?)',
            {
              type: QueryTypes.INSERT,
              replacements: [
                promocode_validation.data.dataValues.id,
                request_data.member_id,
              ],
            }
          );
          let promo_code_used_count =
            promocode_validation.data.dataValues.used > 0
              ? parseInt(promocode_validation.data.dataValues.used) + 1
              : 1;
          let promo_code_status =
            promocode_validation.data.dataValues.max_uses ==
            promo_code_used_count
              ? 'expired'
              : 'active';

          await PromoCode.update(
            {
              used: promo_code_used_count,
              status: promo_code_status,
            },
            { where: { id: promocode_validation.data.dataValues.id } }
          );
          resp_status = true;
          resp_message =
            'Great news! Your Promo Code was a hit. Your account has been successfully credited: $' +
            promocode_validation.data.dataValues.cash.toFixed(2);
        }
      }
    } catch (error) {
      console.error(error);
      resp_status = false;
      resp_message = 'Error occured';
    } finally {
      if (resp_status === true) {
        // req.session.flash = {
        //   message: resp_message,
        //   success_status: true,
        // };
        // res.redirect('/paid-surveys');
      }
      res.json({
        status: resp_status,
        message: resp_message,
      });
    }
  }

  //newsReaction
  async newsReaction(req, res) {
    let resp_status = false;
    let resp_message = 'Unable to save data';
    let response = [];
    // console.log(req.body);
    const companyPortal = await this.getCompanyPortal(req);
    let company_portal_id = companyPortal.id;
    req.headers.site_id = company_portal_id;
    let company_id = companyPortal.company_id;
    req.headers.site_id = company_portal_id;
    req.headers.company_id = company_id;
    // req.body.member_id = req.session.member.id;
    req.body.member_id = 1;
    let request_data = req.body;
    try {
      //get news
      let news = await News.findOne({
        id: request_data.news_id,
        company_portal_id: company_portal_id,
        include: {
          model: NewsReaction,
          where: {
            member_id: req.body.member_id,
            news_id: request_data.news_id,
          },
        },
      });
      // console.log('news.NewsReactions', news.dataValues.NewsReactions);
      if (news && news.NewsReactions) {
        await NewsReaction.destroy({
          where: {
            news_id: request_data.news_id,
            member_id: req.body.member_id,
          },
        });
        resp_status = true;
        resp_message = 'Reaction removed';
      } else {
        await NewsReaction.create({
          news_id: request_data.news_id,
          member_id: req.body.member_id,
          reaction: '1',
        });
        resp_status = true;
        resp_message = 'News liked';
      }
    } catch (error) {
      console.error(error);
      resp_status = false;
      resp_message = 'Error occured';
    } finally {
      res.json({
        status: resp_status,
        message: resp_message,
      });
    }
  }
}
module.exports = MemberAuthController;
