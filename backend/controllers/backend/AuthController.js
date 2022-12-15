/**
 * @description All Authentication related functionalities are here in this Controller.
 * @author Sourabh (CodeClouds)
 */

const Joi = require("joi");
const { User } = require("../../models/index");
const {
  Invitation,
  GroupRole,
  PermissionRole,
  Role,
  Permission,
  Group,
  Company,
  Ticket,
  CompanyPortal
} = require("../../models/index");
const { QueryTypes, Op } = require("sequelize");
const db = require("../../models/index");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../../helpers/global");
const permission = require("../../models/permission");
const UserResources = require("../../resources/UserResources");
const FileHelper = require("../../helpers/fileHelper");

class AuthController {
  constructor() {
    this.signup = this.signup.bind(this);
    // this.validate = this.validate.bind(this)
    this.getCompanyAndSites = this.getCompanyAndSites.bind(this);
    this.login = this.login.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.profileUpdate = this.profileUpdate.bind(this);
    this.profile = this.profile.bind(this);
    this.profileDetails = this.profileDetails.bind(this);
  }

  async signup(req, res) {
    const schema = Joi.object({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      username: Joi.string().alphanum().min(3).max(30).required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
      phone_no: Joi.string().required(),
      email: Joi.string().email().required(),
      invitation: Joi.number(),
      token: Joi.string(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      let error_msg = error.details.map((err) => err.message);
      res.status(401).json({
        status: false,
        errors: error_msg.join(","),
      });
    }

    try {
      let existing_user = await User.findAll({
        limit: 1,
        where: {
          email: value.email,
        },
      });

      if (
        (existing_user.length > 0 && value.invitation == "") ||
        (value.invitation == 1 &&
          existing_user.length > 0 &&
          existing_user[0].status == "1")
      ) {
        return res.status(400).json({
          status: false,
          errors: "User Already Exists",
        });
      }
      let hash_obj = "";
      if (value.invitation == "1") {
        hash_obj = Buffer.from(value.token, "base64");
        hash_obj = hash_obj.toString("utf8");
        hash_obj = JSON.parse(hash_obj);
        if (new Date(hash_obj.expired_at) < new Date()) {
          return res.status(400).json({
            status: false,
            errors: "This link has been expired",
          });
        }
      }
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(value.password, salt);
      let new_user = [];
      if (value.invitation == "1") {
        let update_user = await User.update(
          {
            first_name: value.first_name,
            last_name: value.last_name,
            username: value.username,
            password: password,
            phone_no: value.phone_no,
            status: 1,
          },
          {
            where: { id: hash_obj.id },
          }
        );
        new_user = await User.findOne({ where: { id: hash_obj.id } });

        //update invitation accepted time
        let update_invitation = await Invitation.update(
          { accepted_on: new Date() },
          { where: { id: hash_obj.invitation_id } }
        );
      } else {
        new_user = await User.create({
          ...value,
          password,
        });
      }
      const token = generateToken({
        user: {
          id: new_user.id,
        },
      });
      res.status(200).json({
        status: true,
        user: new_user,
        access_token: token,
      });
    } catch (err) {
      console.log(err.message);
      res.status(500).json({
        status: false,
        errors: "Unable to save data",
      });
    }
  }

  async login(req, res) {
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
    const user = await User.findOne({ where: { email: value.email } });
    if (!user) {
      res.status(401).json({
        status: false,
        errors: "Email is not registered",
      });
      return;
    }
    const isMatch = await bcrypt.compare(value.password, user.password);
    if (!isMatch) {
      res.status(401).json({
        status: false,
        errors: "Invalid Credentials",
      });
      return;
    }
    const token = generateToken({
      user: {
        id: user.id,
      },
    });

    const companies = await user.getCompanies({ include: ["CompanyPortals"] });

    const userResourcesObj = new UserResources(user);
    const userResourcesData = await userResourcesObj.getUserFormattedData();

    res.status(200).json({
      status: true,
      user: userResourcesData,
      companies,
      access_token: token,
    });
  }

  async profile(req, res) {
    const userResourcesData = await this.profileDetails(req);
    res.send({ status: true, user: userResourcesData });
  }
  async profileDetails(req) {
    var groups = [];
    var roles = [];
    var permissions = [];
    let user = req.user;
    const header_company_id = req.header("company_id") || 0;
    const header_company_portal_id = req.header("site_id") || 0;

    const userResourcesObj = new UserResources(user, header_company_id);
    const userResourcesData = await userResourcesObj.getUserFormattedData();

    var unread_ticket_count = await Ticket.getTicketCount(
      0,
      header_company_portal_id
    );
    var company_portal = await CompanyPortal.findByPk(header_company_portal_id)
    userResourcesData.setDataValue("unread_tickets", unread_ticket_count);
    userResourcesData.setDataValue("loggedin_portal", company_portal);
    return userResourcesData;
  }
  async logout(req, res) {
    res.status(200).json({ status: true });
  }

  async refreshToken(req, res) {
    const user = req.user;
    const companies = await user.getCompanies({ include: ["CompanyPortals"] });

    const token = generateToken({
      user: {
        id: user.id,
      },
    });

    const userResourcesObj = new UserResources(user);
    const userResourcesData = await userResourcesObj.getUserFormattedData();

    res.status(200).json({
      status: true,
      access_token: token,
      user: userResourcesData,
      companies,
    });
  }

  async getCompanyAndSites(req, res) {
    const user = await User.findOne({
      where: {
        id: req.user.id,
      },
      include: [{ all: true, nested: true }],
    });
    res.status(200).json({
      status: true,
      companies: "Companies" in user && user.Companies ? user.Companies : [],
    });
  }
  //forgot password
  async forgotPassword(req, res) {
    const schema = Joi.object({
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
    //user details
    const user = await User.findOne({where: { email: value.email }});
    if (!user) {
      res.status(401).json({
        status: false,
        errors: "Email is not registered",
      });
      return;
    }
    const companies = await user.getCompanies({ include: ["CompanyPortals"] });
    req.headers.site_id = companies[0].CompanyPortals[0].id
    let reset_obj = { id: user.id, email: user.email };
    reset_obj = JSON.stringify(reset_obj);
    let base64data = Buffer.from(reset_obj, "utf8");
    let base64String = base64data.toString("base64");
    //send mail
    const eventBus = require('../../eventBus');
    let evntbus = eventBus.emit('send_email', {
      action: 'Forgot Password',
      data: {
        'email': value.email,
        'details':{'reset_password_link':process.env.CLIENT_ORIGIN + "/reset-password?hash=" + base64String}
      },
      req:req
    });

    res.status(200).json({
      status: true,
      reset_link:
        process.env.CLIENT_ORIGIN + "/reset-password?hash=" + base64String,
      message: "Reset password mail has been sent to your email",
    });
  }
  //reset password
  async resetPassword(req, res) {
    const schema = Joi.object({
      hash: Joi.string().required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
    });

    const { error, value } = schema.validate(req.body);
    let hash_obj = Buffer.from(value.hash, "base64");
    hash_obj = hash_obj.toString("utf8");
    hash_obj = JSON.parse(hash_obj);

    if (error) {
      let error_msg = error.details.map((err) => err.message);
      res.status(401).json({
        status: false,
        errors: error_msg.join(","),
      });
      return;
    }
    //user details
    const user = await User.findOne({ where: { id: hash_obj.id } });
    if (!user) {
      res.status(401).json({
        status: false,
        errors: "Email is not registered",
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(value.password, salt);
    let update_user = await User.update(
      { password: password },
      { where: { id: hash_obj.id } }
    );
    res.status(200).json({
      status: true,
      message: "Password updated",
    });
  }
  //get user permissions
  async getUserPermissions(id) {
    const user = await User.findByPk(id);
    const companies = await user.getCompanies();
    //user roles
    let roles = await GroupRole.findAll({
      attributes: ["group_id", "role_id"],
      where: { group_id: companies[0].company_user.group_id },
    });
    roles = roles.map((role) => {
      return role.role_id;
    });
    //user permissions based on the role
    let permissions = await Role.findAll({
      where: { id: roles },
      include: {
        model: Permission,
        required: true,
        attributes: ["name", "id", "slug"],
      },
    });
    permissions = permissions.map((permission) => {
      return permission.Permissions.map((all_permission) => {
        return all_permission.slug;
      });
    });
    // permissions = [].concat.apply([], permissions)
    permissions = permissions.flat();
    return permissions;
  }
  //profile update
  async profileUpdate(req, res) {
    let user = req.user;
    if (req.body.type == "basic_details") {
      delete req.body.type;
      this.updateBasicDetails(req, res);
    } else if (req.body.type == "change_avatar") {
      delete req.body.type;
      this.changeAvatar(req, res);
    } else if (req.body.type == "change_password") {
      delete req.body.type;
      this.changePassword(req, res);
    } else {
      res.status(401).json({
        status: false,
        errors: "Type is required.",
      });
    }
  }
  //update user basic details
  async updateBasicDetails(req, res) {
    let user = req.user;
    const schema = Joi.object({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      phone_no: Joi.required(),
      avatar: Joi.optional(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      let error_msg = error.details.map((err) => err.message);
      res.status(422).json({
        status: false,
        errors: error_msg.join(","),
      });
      return;
    }
    //update details
    try {
      //update basic details
      await User.update(
        {
          ...value,
        },
        { where: { id: user.id } }
      );
      // let profile_details = await this.profileDetails(req)
      res.status(200).json({
        status: true,
        message: "Profile Updated.",
        // user: profile_details
      });
    } catch (error) {
      throw error;
    }
  }
  //change avatar
  async changeAvatar(req, res) {
    let user = req.user;
    if (req.files) {
      let pre_avatar = user.avatar;
      let files = [];
      files[0] = req.files.avatar;
      const fileHelper = new FileHelper(files, "users", req);
      const file_name = await fileHelper.upload();
      await User.update(
        {
          avatar: file_name.files[0].filename,
        },
        { where: { id: user.id } }
      );
      if (pre_avatar != "") {
        let file_delete = await fileHelper.deleteFile(pre_avatar);
      }
      // let profile_details = await this.profileDetails(req)
      res.status(200).json({
        status: true,
        message: "Avatar Updated.",
        // user: profile_details
      });
    } else {
      res.status(422).json({
        status: false,
        errors: "Avatar is required.",
      });
    }
  }
  //change password
  async changePassword(req, res) {
    let user = req.user;
    const schema = Joi.object({
      old_password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
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
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(value.password, salt);
    //check old password
    const isMatch = await bcrypt.compare(value.old_password, user.password);
    if (!isMatch) {
      res.status(422).json({
        status: false,
        errors: "Old password does not match",
      });
      return;
    }
    //update password
    try {
      //update basic details
      await User.update(
        {
          password,
        },
        { where: { id: user.id } }
      );
      res.status(200).json({
        status: true,
        message: "Password Updated.'",
      });
    } catch (error) {
      throw error;
    }
  }

  //check password
  async checkAuth(req, res) {
    try {
      const password = req.body.password || "";
      if (!password) {
        return res.status(422).json({
          status: false,
          errors: "Password missing",
        });
      }
      const user = await User.findOne({ where: { id: req.user.id } });
      if (!user) {
        return res.status(422).json({
          status: false,
          errors: "User does not exists",
        });
      }
      // console.log(user)
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(422).json({
          status: false,
          errors: "Invalid Credentials",
        });
      }

      return res.status(200).json({
        status: true,
        message: "Paswword correct",
      });
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({
        status: false,
        errors: "Unable to get data",
      });
    }
  }
}

module.exports = AuthController;
