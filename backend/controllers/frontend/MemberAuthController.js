const Joi = require("joi");
const { Member } = require("../../models/index");
const bcrypt = require("bcryptjs");

class MemberAuthController {
    constructor() {
      
    }
    //login
    async login(req,res){
      
        let company_portal_id = req.headers.site_id
        const schema = Joi.object({
            password: Joi.string()
                .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
                .required(),
            email: Joi.string().email().required(),
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            let error_msg = error.details.map((err) => err.message);
            res.status(401).json({
              status: false,
              errors: error_msg.join(","),
            });
            return;
        }
        const member = await Member.findOne({ where: { email: value.email,company_portal_id:company_portal_id } });
        if (!member) {
          res.status(401).json({
            status: false,
            errors: "Email is not registered",
          });
          return;
        }
        const isMatch = await bcrypt.compare(value.password, member.password);
        if (!isMatch) {
          res.status(401).json({
            status: false,
            errors: "Invalid Credentials",
          });
          return;
        }
        let session = {member_id:member.id,logged_in:true}
        req.session = session
        console.log(req.session)
        // req.session.save(function(err) {
        //   // session saved
        // })
        res.status(200).json({
          status: true,
          member: member,
          member_id:member.id,
          session:session
        });
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