const Joi = require("joi");
const { Member, MemberBalance } = require("../../models/index");
const bcrypt = require("bcryptjs");
const IpHelper = require("../../helpers/IpHelper");
class MemberAuthController {
    constructor() {
      // super('Member');
    }
    //login
    async login(req,res){
        // let company_portal_id = req.headers.site_id
        let company_portal_id = 1
        let ip = (req.connection.remoteAddress).split('::ffff:');
        ip = ip[ip.length - 1] 
        // res.send(ip);
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
        let ip_ckeck = await ipHelper.checkIp(ip,company_portal_id);
        if(ip_ckeck.status){
          if(ip_ckeck.blacklisted){
            member_status = false
            member_message = "This IP is blacklisted!"
          }
          const member = await Member.findOne({ where: { email: value.email,company_portal_id:company_portal_id } });
          if (!member) {
            member_status = false
            member_message = "Email is not registered!"
          }
          let isMatch = false
          if(member.password != null){
            isMatch = await bcrypt.compare(value.password, member.password);
          }
          if (!isMatch) {
            member_status = false
            member_message = "Invalid credentials!"
          }
          let session = {member_id:member.id,logged_in:true}
          req.session = session
          console.log(req.session)
          //member status checking
          if(member.status != 'member'){
            member_status = false
            member_message = "Your account status is <b>"+member.status+"</b>. Please contact to our admin!"
          }
        }else{
          member_status = false
          member_message = "Failed to check IP"
        }
        if(member_status)
          res.redirect('profile')
        else
          res.send(member_message);
    }
    //signup
    async signup(req,res){
      try {
        let company_portal_id = req.headers.site_id
        const schema = Joi.object({
          first_name: Joi.string().required(),
          last_name: Joi.string().required(),
          username: Joi.string().alphanum().min(3).max(30).required(),
          password: Joi.string()
            .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
            .required(),
          phone_no: Joi.string().required(),
          email: Joi.string().email().required(),
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
          let error_msg = error.details.map((err) => err.message);
          res.status(401).json({
            status: false,
            errors: error_msg.join(","),
          });
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
          res.status(500).json({
            status: false,
            message:"Sorry! this username or email has already been taken"
          });
          return
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
          // console.log("---------------res", res.result.id);
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
  
          let model = await Member.update(
            { referral_code: res.result.id + '0' + new Date().getTime() },
            {
              where: { id: res.result.id },
            }
          );
          res.status(200).json({
            status: true,
            message:"Registered Successfully."
          });
          return
        }
        
      } catch (error) {
        console.error('error saving member', error);
        res.status(500).json({
          status: false,
          message:"Unable to save data"
        });
        return
      }
    }
    //profile
    async profile(req,res){
      console.log('iioioi')
      console.log(req.session)
      res.status(200).json({
        status: true,
        session:req.session,
        h:8
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