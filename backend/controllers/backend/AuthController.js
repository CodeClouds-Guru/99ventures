/**
 * @description All Authentication related functionalities are here in this Controller.
 * @author Sourabh (CodeClouds)
 */

const Joi = require('joi')
const { User } = require('../../models/index')
const { Invitation } = require('../../models/index')
const bcrypt = require('bcryptjs')
const { generateToken } = require('../../helpers/global')

class AuthController {
  AuthController() {
    this.signup = this.signup.bind(this)
    this.validate = this.validate.bind(this)
    this.getCompanyAndSites = this.getCompanyAndSites.bind(this)
  }

  async signup(req, res) {
    const schema = Joi.object({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      username: Joi.string().alphanum().min(3).max(30).required(),
      password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),
      phone_no: Joi.string().required(),
      email: Joi.string().email().required(),
      invitation: Joi.number(),
      token: Joi.string()
    })
    const { error, value } = schema.validate(req.body)
    if (error) {
      res.status(401).json({
        status: false,
        errors: error.details.map((err) => err.message),
      })
    }

    try {
      
      let existing_user = await User.findAll({
        limit: 1,
        where: {
          email: value.email
        },
      })
      
      if ((existing_user.length > 0 && value.invitation =='') || (value.invitation == 1 && existing_user.length > 0 && existing_user[0].status == '1')) {
        return res.status(400).json({
          status: false,
          errors: ['User Already Exists'],
        })
      }
      let hash_obj = '';
      if(value.invitation == '1')
      {
        hash_obj = Buffer.from(value.token, 'base64')
        hash_obj = hash_obj.toString('utf8')
        hash_obj = JSON.parse(hash_obj)
        if(new Date(hash_obj.expired_at) < new Date()){
          return res.status(400).json({
            status: false,
            errors: ['This link has been expired'],
          })
        }
      }
      const salt = await bcrypt.genSalt(10)
      const password = await bcrypt.hash(value.password, salt)
      let new_user = [];
      if(value.invitation == '1')
      {
        
        
        let update_user = await User.update({
          first_name:value.first_name,
          last_name:value.last_name,
          username:value.username,
          password:password,
          phone_no:value.phone_no,
          status:1,
        },{
          where: { id: hash_obj.id }
        })
        new_user = await User.findOne({where: {id:hash_obj.id}});

        //update invitation accepted time
        let update_invitation = await Invitation.update({accepted_on:new Date()},{where:{id:hash_obj.invitation_id}})
        
      }else{
        new_user = await User.create({
          ...value,
          password,
        })
      }
      const token = generateToken({
        user: {
          id: new_user.id,
        },
      })
      res.status(200).json({
        status: true,
        user: new_user,
        access_token: token
      })
    } catch (err) {
      console.log(err.message)
      res.status(500).json({
        status: false,
        message: 'unable to save data',
      })
    }
  }

  async login(req, res) {
    const schema = Joi.object({
      password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),
      email: Joi.string().email().required(),
    })
    const { error, value } = schema.validate(req.body)
    if (error) {
      res.status(401).json({
        status: false,
        errors: error.details.map((err) => err.message),
      })
      return
    }
    const user = await User.findOne({ where: { email: value.email } })
    if (!user) {
      res.status(401).json({
        status: false,
        errors: 'Sorry! this email is not registered with us',
      })
      return
    }
    const isMatch = await bcrypt.compare(value.password, user.password)
    if (!isMatch) {
      res.status(401).json({
        status: false,
        message: 'Invalid Credentials',
      })
      return
    }
    const token = generateToken({
      user: {
        id: user.id,
      },
    })
    res.status(200).json({
      status: true,
      user: user,
      access_token: token,
    })
  }

  async profile(req, res) {
    res.status(200).json({ status: true, user: req.user })
  }

  async logout(req, res) {
    res.status(200).json({ status: true })
  }

  async refreshToken(req, res) {
    const user = req.user
    const companies = await user.getCompanies()
    const token = generateToken({
      user: {
        id: user.id,
      },
    })
    res.status(200).json({
      status: true,
      access_token: token,
      user,
      companies,
    })
  }

  async getCompanyAndSites(req, res) {
    const user = await User.findOne({
      where: {
        id: req.user.id,
      },
      include: [{ all: true, nested: true }],
    })
    res.status(200).json({
      status: true,
      companies: 'Companies' in user && user.Companies ? user.Companies : [],
    })
  }
  //forgot password
  async forgotPassword(req, res) {
    const schema = Joi.object({
      email: Joi.string().email().required(),
    })
    const { error, value } = schema.validate(req.body)
    if (error) {
      res.status(401).json({
        status: false,
        errors: error.details.map((err) => err.message),
      })
      return
    }
    //user details
    const user = await User.findOne({ where: { email: value.email } })
    if (!user) {
      res.status(401).json({
        status: false,
        errors: 'Sorry! this email is not registered with us',
      })
      return
    }
    let reset_obj = { id: user.id, email: user.email }
    reset_obj = JSON.stringify(reset_obj)
    let base64data = Buffer.from(reset_obj, 'utf8')
    let base64String = base64data.toString('base64')
    res.status(200).json({
      status: true,
      reset_link:
        process.env.CLIENT_ORIGIN + '/reset-password?hash=' + base64String,
      message: 'Reset password mail has been sent to your email',
    })
  }
  //reset password
  async resetPassword(req, res) {
    const schema = Joi.object({
      hash: Joi.string().required(),
      password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),
    })

    const { error, value } = schema.validate(req.body)
    let hash_obj = Buffer.from(value.hash, 'base64')
    hash_obj = hash_obj.toString('utf8')
    hash_obj = JSON.parse(hash_obj)

    if (error) {
      res.status(401).json({
        status: false,
        errors: error.details.map((err) => err.message),
      })
      return
    }
    //user details
    const user = await User.findOne({ where: { id: hash_obj.id } })
    if (!user) {
      res.status(401).json({
        status: false,
        errors: 'Sorry! this email is not registered with us',
      })
      return
    }

    const salt = await bcrypt.genSalt(10)
    const password = await bcrypt.hash(value.password, salt)
    let update_user = await User.update(
      { password: password },
      { where: { id: hash_obj.id } }
    )
    res.status(200).json({
      status: true,
      message: 'Password updated',
    })
  }
}

module.exports = AuthController
