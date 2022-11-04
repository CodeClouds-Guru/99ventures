const Controller = require("./Controller");
const { Op } = require("sequelize");
const { Layout, Component } = require("../../models/index");
class LayoutController extends Controller {
  constructor() {
    super("Layout");
  }
  //override save function
  async save(req, res) {
    req.body.company_portal_id = req.headers.site_id;
    //unique name checking
    let check_name_unique = await this.model.findOne({
      where: { name: req.body.name },
    });
    
    if (check_name_unique) {
      throw new Error("Name already in use!");
    }
    
    // console.log(req);
    let response = await super.save(req);
    return {
      status: true,
      message: "Layout added.",
      id: response.result.id,
    };
  }
  //override update function
  async update(req, res) {
    req.body.company_portal_id = req.headers.site_id;
    //unique name checking
    let check_name_unique = await this.model.findOne({
      where: { name: req.body.name, id: { [Op.ne]: req.params.id } },
    });
    // console.log('===============',check_name_unique)
    if (check_name_unique) {
      throw new Error("Name already in use.");
    }
    let response = await super.update(req);
    return {
      status: true,
      message: "Layout updated.",
    };
  }

  //override add function
  async add(req, res) {
    let company_portal_id = req.headers.site_id;
    let components = await Component.findAll({
      attributes: ["name", "html", "code", "component_json"],
      where: { company_portal_id: company_portal_id },
    });
    return {
      status: true,
      fields: this.model.fields,
      components,
    };
  }

  //override edit function
  async edit(req, res) {
    try {
      let company_portal_id = req.headers.site_id;
      let components = await Component.findAll({
        attributes: ["name", "html", "code", "component_json"],
        where: { company_portal_id: company_portal_id },
      });
      let model = await this.model.findByPk(req.params.id);
      let fields = this.model.fields;
      return {
        status: true,
        result: model,
        fields,
        components,
      };
    } catch (error) {
      throw error;
    }
  }
  //override delete function
  async delete(req, res) {
    let response = await super.delete(req);
    return {
      status: true,
      message: "Layout deleted.",
    };
  }
}

module.exports = LayoutController;
