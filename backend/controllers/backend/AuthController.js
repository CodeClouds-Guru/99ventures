/**
 * @description All Authentication related functionalities are here in this Controller.
 * @author Sourabh (CodeClouds)
 */

const Joi = require('joi')
const { User } = require('../../models/index')
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
          email: value.email,
        },
      })
      if (existing_user.length > 0) {
        return res.status(400).json({
          status: false,
          errors: ['User Already Exists'],
        })
      }
      const salt = await bcrypt.genSalt(10)
      const password = await bcrypt.hash(value.password, salt)
      let new_user = await User.create({
        ...value,
        password,
      })
      const token = generateToken({
        user: {
          id: new_user.id,
        },
      })
      res.status(200).json({
        status: true,
        user: new_user,
        access_token: token,
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
      token,
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
}

module.exports = AuthController
