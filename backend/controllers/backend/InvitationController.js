const Controller = require('./Controller')
const { User, Invitation, CompanyUser, Company } = require('../../models/index')
const Joi = require('joi')
const { concat } = require('lodash')

class InvitationController extends Controller {
  constructor() {
    super('Invitation')
  }
  //send invitation
  async sendInvitation(req, res) {
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
      let error_msg = error.details.map((err) => err.message)
      res.status(401).json({
        status: false,
        errors: error_msg.join(','),
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
    } else {
      let new_user = await User.create({
        first_name: value.first_name,
        last_name: value.last_name,
        username: value.username,
        email: value.email,
        password: '2222',
        status: 0,
        created_by: user.id,
      })

      let company_user = await CompanyUser.create({
        user_id: new_user.id,
        company_id: value.company_id,
        group_id: value.group_id,
      })
      var expired_at = new Date()
      // add a day
      expired_at.setDate(expired_at.getDate() + 1)
      let new_invitation = await Invitation.create({
        user_id: user.id,
        email: value.email,
        expired_at: expired_at,
        created_by: user.id,
      })
      let token = {
        id: new_user.id,
        email: new_user.email,
        invitation_id: new_invitation.id,
        expired_at: expired_at,
      }
      token = JSON.stringify(token)
      let base64data = Buffer.from(token, 'utf8')
      token = base64data.toString('base64')
      //update token
      let update_token = await Invitation.update(
        { token: token },
        { where: { id: new_invitation.id } }
      )

      res.status(200).json({
        status: true,
        link: process.env.CLIENT_ORIGIN + '/sign-up?token=' + token,
        email: value.email,
        message: 'Invitation sent',
      })
    }
  }
  //re-send invitation
  async resendInvitation(req, res) {
    let id = req.params.id
    let invitation = await Invitation.findOne({ where: { id: id } })

    let hash_obj = Buffer.from(invitation.token, 'base64')
    hash_obj = hash_obj.toString('utf8')
    hash_obj = JSON.parse(hash_obj)
    var expired_at = new Date()
    // add a day
    expired_at.setDate(expired_at.getDate() + 1)
    hash_obj.expired_at = expired_at

    //create new token
    let token = JSON.stringify(hash_obj)
    let base64data = Buffer.from(token, 'utf8')
    token = base64data.toString('base64')
    //update expiry time

    let update_invitation = await Invitation.update(
      { expired_at: expired_at, token: token },
      { where: { id: id } }
    )

    res.status(200).json({
      status: true,
      link: process.env.CLIENT_ORIGIN + '/sign-up?token=' + token,
      email: invitation.email,
      message: 'Invitation sent',
    })
  }
  //invitation details
  async invitationDetails(req, res) {
    const schema = Joi.object({
      token: Joi.string().required(),
    })
    const { error, value } = schema.validate(req.body)
    if (error) {
      let error_msg = error.details.map((err) => err.message)
      res.status(401).json({
        status: false,
        errors: error_msg.join(','),
      })
      return
    }
    //check invitation expiry time
    var hash_obj = Buffer.from(value.token, 'base64')
    hash_obj = hash_obj.toString('utf8')
    hash_obj = JSON.parse(hash_obj)
    if (new Date(hash_obj.expired_at) < new Date()) {
      res.status(400).json({
        status: false,
        errors: 'This link has been expired',
      })
      return
    }
    //get user details
    var user = await User.findOne({ where: { id: hash_obj.id } })
    var creator_name = await User.findOne({
      attributes: ['first_name', 'last_name'],
      where: { id: user.created_by },
    })
    var company_name = await Company.findOne({
      attributes: ['name'],
      where: { id: hash_obj.company_id },
    })
    creator_name = creator_name.first_name
      .concat(' ')
      .concat(creator_name.last_name)
    user.setDataValue('company_id', hash_obj.company_id)
    user.setDataValue('company_name', company_name.name)
    user.setDataValue('creator_name', creator_name)
    res.status(200).json({
      status: true,
      message: 'You have been invited to '
        .concat(company_name.name)
        .concat(' by ')
        .concat(creator_name),
      user: user,
    })
  }
}

module.exports = InvitationController
