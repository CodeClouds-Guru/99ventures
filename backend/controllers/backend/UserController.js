const Controller = require("./Controller");
const { Group } = require("../../models/index");
const { CompanyUser, Invitation, Company } = require("../../models/index");
const AuthControllerClass = require("../backend/AuthController");
const AuthController = new AuthControllerClass();
const bcrypt = require("bcryptjs");
const { sendInvitation } = require("../../helpers/global");
const InvitationHelper = require("../../helpers/InvitationHelper");
const { Op } = require("sequelize");

class UserController extends Controller {
  constructor() {
    super("User");
    this.save = this.save.bind(this);
  }
  //override list function
  async list(req, res) {
    let permissions = await AuthController.getUserPermissions(req.user.id);
    const options = this.getQueryOptions(req);
    let company_id = req.headers.company_id;
    let sort_field = req.query.sort || "id";
    let sort_order = req.query.sort_order || "asc";
    // return options;
    if (permissions.indexOf("all-users-list") !== -1) {
    }
    if (permissions.indexOf("group-users-list") !== -1) {
      options.include = [
        {
          model: Company,
          where: {
            id: company_id,
          },
          attributes: ["id"],
        },
        // { all: true, nested: true , attributes: ["name"]},
      ];
    } else if (permissions.indexOf("owner-users-list") !== -1) {
      if (options.where != undefined) {
        options.where.id = req.user.id;
      } else {
        options.where = { id: req.user.id };
      }
    }
    // const { docs, pages, total } = await this.model.paginate(options);
    let page = req.query.page || 1;
    let limit = parseInt(req.query.show) || 10; // per page record
    let offset = (page - 1) * limit;
    options.limit = limit;
    options.offset = offset;
    options.order = [[sort_field, sort_order]];
    let result = await this.model.findAndCountAll(options);
    let pages = Math.ceil(result.count / limit);

    return {
      result: { data: result.rows, pages, total: result.count },
      fields: this.model.fields,
    };
  }
  //override add function
  async add(req, res) {
    let response = await super.add(req);
    let fields = response.fields;
    let groups = await Group.findAll({ attributes: ["id", "name"] });
    fields.groups.options = groups.map((group) => {
      return {
        key: group.name,
        value: group.id,
        label: group.name,
      };
    });
    return {
      status: true,
      fields,
    };
  }
  //override store function
  async save(req, res) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
    //unique email checking
    let check_email = await this.model.findOne({
      where: { email: req.body.email },
    });
    if (check_email) {
      this.throwCustomError("Email already exist.", 409);
    }
    let response = await super.save(req);
    let new_user = response.result;
    //get company id
    let company_id = req.headers.company_id;
    let user = req.user;
    //update user group
    if (typeof req.body.groups !== "undefined") {
      if (req.body.groups.length > 0) {
        let all_groups = [];
        for (const val of req.body.groups) {
          all_groups.push({
            user_id: new_user.id,
            company_id: company_id,
            group_id: val,
          });
        }
        //bulck create company users
        await CompanyUser.bulkCreate(all_groups);
      }
    }
    const invitation = new InvitationHelper(new_user, req.user);
    const link = invitation.invite();
    return {
      message: response.message,
      result: response.result,
      link,
    };
  }
  //override the edit function
  async edit(req, res) {
    try {
      let model = await this.model.findByPk(req.params.id);
      let fields = this.model.fields;
      //group options
      if (model) {
        let groups = await Group.findAll({ attributes: ["id", "name"] });
        fields.groups.options = groups.map((group) => {
          return {
            key: group.name,
            value: group.id,
            label: group.name,
          };
        });
        let company_id = req.headers.company_id ?? 1;
        let group_ids = await model.getGroups();
        group_ids = group_ids.map((group) => {
          return group.id;
        });
        // model['groups'] = group_ids;
        model.setDataValue("groups", group_ids);
        model.password = "";
        return {
          status: true,
          result: model,
          fields,
          message: "User details",
        };
      } else {
        this.throwCustomError("User not found", 404);
      }
    } catch (error) {
      throw error;
    }
  }

  //override the update function
  async update(req, res) {
    let id = req.params.id;
    let request_data = req.body;
    const { error, value } = this.model.validate(req);
    if (error) {
      let message = error.details.map((err) => err.message).join(", ");
      this.throwCustomError(message, 422);
    }
    if (!req.headers.company_id) {
      this.throwCustomError("Company id is required", 401);
    }
    try {
      let check_email = await this.model.findOne({
        where: { email: req.body.email, id: { [Op.ne]: id } },
      });
      if (check_email) {
        this.throwCustomError("Email already exist.", 409);
      }
      request_data.updated_by = req.user.id;
      /****
       *
       */
      request_data.company_id = req.headers.company_id;
      //unset blank password key
      if (
        typeof request_data.password !== "undefined" &&
        request_data.password == ""
      ) {
        delete request_data.password;
      } else if (
        typeof request_data.password !== "undefined" &&
        request_data.password != ""
      ) {
        const salt = await bcrypt.genSalt(10);
        request_data.password = await bcrypt.hash(request_data.password, salt);
      }

      await this.model.update(request_data, { where: { id } });

      //update user group
      if (typeof request_data.groups !== "undefined") {
        //delete previous record
        await CompanyUser.destroy({
          where: { user_id: id, company_id: request_data.company_id },
        });
        if (request_data.groups.length > 0) {
          let all_groups = [];
          for (const val of request_data.groups) {
            all_groups.push({
              user_id: id,
              company_id: request_data.company_id,
              group_id: val,
            });
          }
          //bulck create company users
          await CompanyUser.bulkCreate(all_groups);
        }
      }
      return {
        message: "Record has been updated successfully",
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserController;
