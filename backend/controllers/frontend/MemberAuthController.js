const Joi = require("joi");
const { Member, MemberBalance, IpLog, MemberReferral } = require("../../models/index");
const bcrypt = require("bcryptjs");
const IpHelper = require("../../helpers/IpHelper");
const geoip = require('geoip-lite');
class MemberAuthController {
  constructor() {
    // super('Member');
  }
  //login
  async login(req, res) {
    let company_portal_id = 1
    let redirect_page = await Page.findOne({where:{company_portal_id:company_portal_id,after_signin:1}})
    if(redirect_page)
      redirect_page = '/'+redirect_page.slug
    else
      redirect_page = '/'
    if (req.session.member) {
      res.redirect(redirect_page);
      return
    } else {
      
      const member = await Member.findOne({ where: { email: req.body.email, company_portal_id: company_portal_id } });
      let ip = (req.ip).split('::ffff:');
      ip = ip[ip.length - 1]
      
      let member_status = true
      let member_message = "Logged in successfully!"
      const schema = Joi.object({
        password: Joi.string()
          .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
          .required(),
        email: Joi.string().email().required(),
        remember_me: Joi.optional(),
      });
      const { error, value } = schema.validate(req.body);
      if (error) {
        member_status = false
        member_message = error.details.map((err) => err.message);
      }

      //check if IP is blacklisted
      const ipHelper = new IpHelper();
      let ip_ckeck = await ipHelper.checkIp(ip, company_portal_id);
      if (ip_ckeck.status) {
        if (ip_ckeck.blacklisted) {
          member_status = false
          member_message = "This IP is blacklisted!"
        }
        if (!member) {
          member_status = false
          member_message = "Email is not registered!"
        } else {
          let isMatch = false
          if (!member.password) {
            member_status = false
            member_message = "Please Setup your account before login"
          } else {
            isMatch = await bcrypt.compare(value.password, member.password);
            if (!isMatch) {
              member_status = false
              member_message = "Invalid credentials!"
            }else{
              var geo = geoip.lookup('122.163.102.160');
              let ip_logs = {
                member_id: member.id,
                geo_location: geo.region,
                ip:ip,
                browser:req.headers["user-agent"],
                browser_language: req.headers["accept-language"],
                latitude: geo.range[0],
                longitude: geo.range[1]
              }
              //ip logs
              await IpLog.create(ip_logs)
            }
            if (member.status != 'member') {
              member_status = false
              member_message = "Your account status is <b>" + member.status + "</b>. Please contact to our admin!"
            }
          }
        }
      } else {
        member_status = false
        member_message = "Failed to check IP"
      }
      //remember me
      if(req.body.remember_me){
        //res.cookie('remember_me', true);
      }else{
        //res.cookie('remember_me', false);
      }
      if (member_status) {
        req.session.member = member
        res.redirect(redirect_page)
      }
      else {
        req.session.flash = { error: member_message }
        res.redirect('back')
      }
    }

  }
  //signup
  async signup(req, res) {
    try {
      let company_portal_id = req.headers.site_id
      const schema = Joi.object({
                  first_name: Joi.string().required().label("First Name"),
                  last_name: Joi.string().required().label("Last Name"),
                  gender: Joi.string().required().label("Gender"),
                  status: Joi.string().optional().label("Status"),
                  username: Joi.string().min(3).max(30).required().label("Username"),
                  email: Joi.string().optional(),
                  company_portal_id: Joi.string().optional(),
                  company_id: Joi.string().optional(),
                  password: Joi.string().optional(),
                  dob: Joi.string().optional(),
                  phone_no: Joi.string().optional().label("Phone No"),
                  country_id: Joi.optional().label("Country"),
                  address_1: Joi.string().allow("").required().label("Address 1"),
                  address_2: Joi.string().allow("").optional().label("Address 2"),
                  address_3: Joi.string().allow("").optional().label("Address 3"),
                  zip_code: Joi.string().allow("").optional().label("Zip Code"),
                  avatar: Joi.optional().label("Avatar"),
                  country_code: Joi.optional().label("Country Code"),
                  state: Joi.optional().label("State"),
                  referral_code: Joi.optional().allow('').label("Referral Code"),
      });
      const { error, value } = schema.validate(req.body);
      let member_status = true
      let member_message = "Registered successfully!"
      if (error) {
        member_status = false
        member_message = error.details.map((err) => err.message);
      }
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(value.password, salt);
      const existing_email_or_username = await Member.count({
        where: {
          company_portal_id: company_portal_id,
          [Op.or]: {
            email: req.body.email,
            username: req.body.username,
          },
        },
      });

      if (existing_email_or_username > 0) {
          member_status = false
          member_message = "Sorry! this username or email has already been taken"
      } else {
        req.body.membership_tier_id = 1;
        let files = [];
        if (req.files) {
          files[0] = req.files.avatar;
          const fileHelper = new FileHelper(files, 'members', req);
          const file_name = await fileHelper.upload();
          req.body.avatar = file_name.files[0].filename;
        }

        await Member.create({
          ...req.body,
          password,
        });
        //send mail
        const eventBus = require('../../eventBus');
        let member_details = await Member.findOne({
          where: { email: req.body.email },
        });
        await MemberBalance.bulkCreate([
          {
            member_id: member_details.id,
            amount: 0.0,
            amount_type: 'cash',
            created_by: '0',
          },
          {
            member_id: member_details.id,
            amount: 0.0,
            amount_type: 'point',
            created_by: '0',
          },
        ]);
        let evntbus = eventBus.emit('send_email', {
          action: 'Welcome',
          data: {
            email: req.body.email,
            details: { members: member_details },
          },
          req: req,
        });

        //Referral code
        let referrer = ''
        if(req.body.referral_code != ''){
          referrer = await Member.findOne({where:{referral_code:req.body.referral_code}})
          if(referrer){
            referrer = referrer.id
            //update member referral info
            let ip = (req.ip).split('::ffff:');
            ip = ip[ip.length - 1]
            var geo = geoip.lookup('122.163.102.160');
            
            let referral_details = await MemberReferral.findOne({where:{referral_id:referrer,referral_email:req.body.email}, order: [['id', 'DESC']],})
            if(referral_details){
              await MemberReferral.update(
                { geo_location: geo.region,ip:ip,member_id: referrer, join_date: new Date()},
                {
                  where: { id: referral_details.id },
                }
              );
            }
            else{
                    await MemberReferral.create({
                                          member_id: referrer,
                                          referral_id: member_details.id,
                                          referral_email:req.body.email,
                                          geo_location: geo.region,
                                          ip:ip,
                                          join_date: new Date()
                                      })
              }
          }
          let model = await Member.update(
            { referral_code: res.result.id + '0' + new Date().getTime(),member_referral_id:referrer },
            {
              where: { id: res.result.id },
            }
          );
          //signed up with referral code
        }
        //registration bonus
        let registration_bonus = await Setting.findOne({where:{settings_key:'registration_bonus'}})
        await MemberTransaction.create({
          type:'credited',
          amount: registration_bonus.settings_value,
          status:2,
          member_id:member_details.id,
          amount_action:'admin_adjustment',
          balance: registration_bonus.settings_value
        })
      }
      if (member_status) {
        req.session.flash = { message: member_message }
      }
      else {
        req.session.flash = { error: member_message }
      }
      res.redirect('back')
    } catch (error) {
      req.session.flash = { error: "Unable to save data"}
      res.redirect('back')
    }
  }
  //profile
  async profile(req, res) {
    console.log(req.cookies.remember_me)
    console.log(req.cookies.name)
    res.status(200).json({
      status: true,
      session: req.session.flash.error,
      h: 8
    });
    //   return req.session
    //   global.socket.emit("shoutbox", { name: 'Nandita', place: 'USA', message: 'Socket connected' });

    //     res.status(200).json({
    //         status: false,
    //         data: 'data',
    //     });
    //     return;
  }
}
module.exports = MemberAuthController;