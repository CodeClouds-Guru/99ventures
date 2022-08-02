const Controller = require('./Controller')
const { User } = require('../../models/index')
const { Invitation } = require('../../models/index')
const { CompanyUser } = require('../../models/index')
const Joi = require('joi')

class InvitationController extends Controller {
  constructor() {
    super('Invitation')
  }

  async sendInvitation(req, res){
    // res.status(401).json({
    //     data:req.headers
    // })
    const schema = Joi.object({
        email: Joi.string().email().required(),
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        username: Joi.string().required(),
        company_id: Joi.string().required(),
        group_id: Joi.string().required(),
    })
    const { error, value } = schema.validate(req.body)
    if (error) {
        res.status(401).json({
            status: false,
            errors: error.details.map((err) => err.message),
        })
        return
    }
    //get company id
    const user = req.user
    //   const companies = await user.getCompanies()
    //email checking
    const invited_user = await User.findOne({ where: { email: value.email } })
    if (invited_user) {
        res.status(401).json({
            status: false,
            errors: 'Sorry! this email is already registered with us',
        })
        return
    }else{
        let new_user = await User.create({
            first_name: value.first_name,
            last_name: value.last_name,
            username: value.username,
            email: value.email,
            password: '2222',
            status: 0,
            created_by: user.id
        })
        

        let company_user = await CompanyUser.create({
            user_id: new_user.id,
            company_id: value.company_id,
            group_id: value.group_id
        })
        var expired_at = new Date();
        // add a day
        expired_at.setDate(expired_at.getDate() + 1);
        let new_invitation = await Invitation.create({
            user_id: user.id,
            email: value.email,
            expired_at: expired_at,
            created_by: user.id
        })
        let token = { id: new_user.id, email: new_user.email,invitation_id: new_invitation.id,expired_at:expired_at}
        token = JSON.stringify(token)
        let base64data = Buffer.from(token, 'utf8')
        token = base64data.toString('base64')
        //update token
        let update_token = await Invitation.update({token:token},{where:{id:new_invitation.id}})

        res.status(200).json({
            status: true,
            link:process.env.CLIENT_ORIGIN + '/sign-up?token=' + token,
            email: value.email
        })
    }
  }
}

module.exports = new InvitationController()