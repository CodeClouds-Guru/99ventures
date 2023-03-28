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
  EmailAlert,
} = require('../../models/index');
const bcrypt = require('bcryptjs');
const IpHelper = require('../../helpers/IpHelper');
const IpQualityScoreClass = require('../../helpers/IpQualityScore');
class MemberAuthController {
  constructor() {
    this.geoTrack = this.geoTrack.bind(this);
    this.login = this.login.bind(this);
    this.signup = this.signup.bind(this);
    this.referralDetails = this.referralDetails.bind(this);
    this.saveRegistrationBonus = this.saveRegistrationBonus.bind(this);
    this.emailVerify = this.emailVerify.bind(this);
    this.setMemberEligibility = this.setMemberEligibility.bind(this);
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
        console.dir(member);
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
            'Your account status is <b>' +
            member.status +
            '</b>. Please contact to our admin!';
        }
      }
    }
    if (member_status) {
      req.session.member = member;
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
      const schema = Joi.object({
        first_name: Joi.string().required().label('First Name'),
        last_name: Joi.string().required().label('Last Name'),
        email: Joi.string().optional(),
        password: Joi.string().optional(),
        confirm_password: Joi.string().optional(),
      });
      const { error, value } = schema.validate(req.body);
      let member_status = true;
      let member_message = 'Registered successfully!';
      if (error) {
        member_status = false;
        member_message = error.details.map((err) => err.message);
      }
      //check if IP is blacklisted
      const ipHelper = new IpHelper();
      let ip_ckeck = await ipHelper.checkIp(ip, company_portal_id);
      if (ip_ckeck.status) {
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(value.password, salt);
        let existing_email_or_username = await Member.findOne({
          where: {
            company_portal_id: company_portal_id,
            email: req.body.email,
          },
        });

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
            first_name: value.first_name,
            last_name: value.last_name,
            email: value.email,
            password: password,
            membership_tier_id: 1,
            company_portal_id: company_portal_id,
            company_id: company_id,
            status: 'validating',
            username: value.email.split('@')[0],
            created_at: new Date(),
          };
          const res = await Member.create(data);
          //send mail
          const eventBus = require('../../eventBus');
          let member_details = await Member.findOne({
            where: { email: req.body.email },
          });

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
          if (req.body.referral_code != '') {
            await this.referralDetails(req, res);
            //signed up with referral code
          }
          //registration bonus
          await this.saveRegistrationBonus(member_details);
        }
        if (member_status) {
          req.session.flash = { message: member_message };
        } else {
          req.session.flash = { error: member_message };
        }
      }
      res.redirect('back');
    } catch (error) {
      req.session.flash = { error: 'Unable to save data' };
      res.redirect('back');
    }
  }

  //referral
  async referralDetails(req, res) {
    if (req.body.referral_code != '') {
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
    // let hash_obj = Buffer.from(req.body.hash, "base64");
    // hash_obj = hash_obj.toString("utf8");
    // hash_obj = JSON.parse(hash_obj);
    // let member_details = await Member.findOne({where:{id:hash_obj.id,email:hash_obj.email}})
    let member_details = await Member.findOne({
      where: { id: 1, email: 'demomember@mailinator.com' },
    });
    if (member_details) {
      //set member eligibility
      await this.setMemberEligibility(member_details.id);
    }
    res.redirect('/');
    return;
  }

  //set member eligibility
  async setMemberEligibility(member_id) {
    //gender
    let member_details = await Member.findOne({ where: { id: 1 } });
    let member_eligibility = [];
    if (member_details.gender == 'male') {
      member_eligibility.push({
        member_id: member_id,
        survey_question_id: 43,
        precode_id: 23,
      });
    } else {
      member_eligibility.push({
        member_id: member_id,
        survey_question_id: 43,
        precode_id: 22,
      });
    }
    await MemberEligibilities.destroy({
      where: { member_id: member_id },
      force: true,
    });
    await MemberEligibilities.bulkCreate(member_eligibility);
    return;
    // let member_gender =  await SurveyQuestion.findAll({where:{name:'GENDER'}})
    // member_gender.forEach(function (record, key) {
    //   //get precodes
    //   let precodes = await
    // })
  }

  //update member profile
  async profileUpdate(req, res) {
    const member_id = req.session.member.id;
    // const member_id = req.params.id;
    let member_status = true;
    let member_message = 'Successfully updated!';
    let member = await Member.findOne({ where: { id: member_id } });
    req.headers.company_id = req.session.member.company_id;
    req.headers.site_id = req.session.member.company_portal_id;
    // const schema = Joi.object({
    //   first_name: Joi.string().required().label('First Name'),
    //   last_name: Joi.string().required().label('Last Name'),
    //   country_id: Joi.number().required().label('Country'),
    //   zip_code: Joi.number().required().label('Zipcode'),
    //   city: Joi.string().required().label('City'),
    //   gender: Joi.string().required().label('Gender'),
    //   phone_no: Joi.string().required().label('Phone number'),
    //   country_code: Joi.number().optional().label('Phone code'),
    //   address_1: Joi.string().allow('').required().label('Address 1'),
    //   address_2: Joi.string().allow('').optional().label('Address 2'),
    //   email_alerts: Joi.array().allow('').optional().label('Email Alerts'),
    // });
    // const { error, value } = schema.validate(req.body);

    // if (error) {
    //   member_status = false;
    //   member_message = error.details.map((err) => err.message);
    // }
    req.body.username = member.username;
    let request_data = req.body;
    request_data.updated_by = member_id;
    request_data.avatar = null;
    if (req.files) {
      request_data.avatar = await Member.updateAvatar(req, member);
    }
    console.log(request_data);
    let model = await Member.update(request_data, {
      where: { id: member_id },
    });

    if (req.body.email_alerts && req.body.email_alerts.length > 0) {
      let email_alerts = req.body.email_alerts;
      member_status = await EmailAlert.saveEmailAlerts(member_id, email_alerts);
    }
    if (member_status) {
      req.session.flash = { message: member_message };
    } else {
      req.session.flash = { error: member_message };
    }
    return res.send({ status: member_status, user: member_message });
  }
  async logout(req, res) {
    req.session.member = null;
    res.redirect('/');
  }
}
module.exports = MemberAuthController;
