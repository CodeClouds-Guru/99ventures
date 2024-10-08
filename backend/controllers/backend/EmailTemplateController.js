const Controller = require("./Controller");
const {
  EmailAction,
  EmailTemplateVariable,
  EmailActionEmailTemplate,
  EmailTemplate,
  Company,
  User,
  CompanyPortal,
  sequelize,
} = require("../../models/index");
const db = require("../../models/index");
const queryInterface = sequelize.getQueryInterface();
const { QueryTypes, Op } = require("sequelize");
const EmailHelper = require("../../helpers/EmailHelper");

class EmailTemplateController extends Controller {
  constructor() {
    super("EmailTemplate");
  }
  //override list function
  async list(req, res) {
    // var emailHelper = new EmailHelper(req)
    // var send_mail = await emailHelper.sendMail('<b>hello</b>','sourabh.das@codeclouds.in');
    // return send_mail
    const options = this.getQueryOptions(req);
    let company_id = req.headers.company_id;
    options.include = [
      {
        model: EmailAction,
        attributes: ["id", "action"],
      },
    ];
    let page = req.query.page || 1;
    let limit = parseInt(req.query.show) || 10; // per page record
    let offset = (page - 1) * limit;
    options.limit = limit;
    options.offset = offset;
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
    // let email_actions = await EmailAction.findAll()
    let email_actions = await db.sequelize.query(
      "SELECT * FROM `email_actions` as ea WHERE NOT EXISTS (SELECT * FROM `email_action_email_template` as eaet WHERE eaet.email_action_id = ea.id)",
      {
        type: QueryTypes.SELECT,
      }
    );
    let email_template_variables = await EmailTemplateVariable.findAll();
    fields.email_actions.options = email_actions;
    fields.email_template_variables.options = email_template_variables;
    return {
      status: true,
      fields,
    };
  }
  //override save function
  async save(req, res) {
    req.body.company_portal_id = req.headers.site_id;
    let response = await super.save(req);
    //update email action
    await queryInterface.bulkInsert("email_action_email_template", [
      {
        email_action_id: req.body.email_actions,
        email_template_id: response.result.id,
      },
    ]);
    // EmailActionEmailTemplate.create({
    //   email_action_id: req.body.email_actions,
    //   email_template_id: response.result.id
    // })

    return {
      status: true,
      message: "Email template added.",
      id: response.result.id,
    };
  }
  //update email template
  async update(req, res) {
    let id = req.params.id;
    req.body.company_portal_id = req.headers.site_id;
    let response = await super.update(req);
    //update email action
    EmailActionEmailTemplate.update(
      {
        email_action_id: req.body.email_actions,
      },
      {
        where: {
          email_template_id: id,
        },
      }
    );

    return {
      status: true,
      message: "Email template updated.",
    };
  }
  //override delete function
  async delete(req, res) {
    let modelIds = req.body.modelIds ?? [];
    let response = await super.delete(req);

    //delete email action
    EmailActionEmailTemplate.destroy({
      where: { email_template_id: modelIds },
    });
    return {
      status: true,
      message: "Email template deleted.",
    };
  }
  //get a single email template by id
  async edit(req, res) {
    try {
      let response = await super.edit(req);
      let fields = response.fields;
      if (response.result) {
        let email_actions = await response.result.getEmailActions();
        // let email_actions = await db.sequelize.query(
        //   "SELECT * FROM `email_actions` as ea WHERE NOT EXISTS (SELECT * FROM `email_action_email_template` as eaet WHERE eaet.email_action_id = ea.id AND eaet.email_template_id !=? )",
        //   {
        //     type: QueryTypes.SELECT,
        //     replacements: [req.params.id],
        //   }
        // );
        // fields.email_actions.options = email_actions;
        // console.log('=============================',email_actions)
        response.result.setDataValue("EmailActions", email_actions);
        return response;
      } else {
        this.throwCustomError("Email template not found.", 409);
      }
    } catch (error) {
      throw error;
    }
  }
  //email parsing
  async parse(req, res) {
    const emailHelper = new EmailHelper(req);
    let email_body = await emailHelper.parse();
    return {
      body: email_body,
    };
  }
}

module.exports = EmailTemplateController;
