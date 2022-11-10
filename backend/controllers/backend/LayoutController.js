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
    let previous = await this.model.findByPk(req.params.id);
    const countBackups = await this.model.count({
      where: {
        code: {
          [Op.like]: "%" + previous.code + "-del-%",
        },
      },
    });

    let updateData = {
      name: req.body.name,
      html: req.body.html,
      layout_json: req.body.layout_json,
      updated_by: req.user.id,
    };
    
    this.model.update(updateData, {
      where: {
        id: req.params.id,
      },
    });
    // let updateResponse = await super.update(previous);

    let createData = {
      name: previous.name,
      html: previous.html,
      layout_json: previous.layout_json,
      code: previous.code + "-del-" + (parseInt(countBackups) + 1),
      company_portal_id: req.headers.site_id,
      created_by: req.user.id,
    };
    let model = await Layout.create(createData);
    // let saveResponse = await super.save(createData);

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

      const allBackups = await this.model.findAndCountAll({
        where: {
          code: {
            [Op.like]: "%" + model.code + "-del-%",
          },
        },
      });

      let fields = this.model.fields;
      return {
        status: true,
        result: model,
        fields,
        components,
        revisions: allBackups,
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

  async list(req, res) {
    var options = super.getQueryOptions(req);
    options.where = {
      code: {
        [Op.notLike]: "%-del-%",
      },
    };

    const { docs, pages, total } = await this.model.paginate(options);

    return {
      result: { data: docs, pages, total },
      fields: this.model.fields,
    };
  }
}

module.exports = LayoutController;
