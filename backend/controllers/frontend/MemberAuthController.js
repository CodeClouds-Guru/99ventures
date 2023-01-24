const Joi = require("joi");
const { Member } = require("../../models/index");
const bcrypt = require("bcryptjs");

class MemberAuthController {
    constructor() {
      
    }
    //login
    async login(req,res){
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
        const member = await Member.findOne({ where: { email: value.email } });
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
    
        res.status(200).json({
          status: true,
          member: member,
          member_id:member.id,
        });
    }
    //profile
    async profile(req,res){
      global.socket.emit("shoutbox", { name: 'Nandita', place: 'USA', message: 'Socket connected' });
        
        res.status(200).json({
            status: false,
            data: 'data',
        });
        return;
    }
}
module.exports = MemberAuthController;