const Controller = require("./Controller");
const { Op } = require("sequelize");
const { Layout, Component } = require("../../models/index");
class LayoutController extends Controller {
  constructor() {
    super("Layout");
    this.layoutRevisionUpdate = this.layoutRevisionUpdate.bind(this);
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
    let rev_layout_id = req.body.rev_layout_id || null;
    let previous = await this.model.findByPk(req.params.id);
    const countBackups = await this.model.count({
      where: {
        code: {
          [Op.like]: "%" + previous.code + "-rev-%",
        },
      },
    });
    req.countBackups = countBackups;
    let current = {};
    if (rev_layout_id !== null) {
      current = await this.model.findByPk(rev_layout_id);
    } else {
      current = req.body;
    }
    let response = await this.layoutRevisionUpdate(req, current, previous);

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
      where: {
        company_portal_id: company_portal_id,
        code: {
          [Op.notLike]: "%-rev-%",
        },
      },
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
        attributes: ["id", "name", "updated_at"],
        where: {
          code: {
            [Op.like]: "%" + model.code + "-rev-%",
          },
        },
        order: [["updated_at", "DESC"]],
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
        [Op.notLike]: "%-rev-%",
      },
    };

    const { docs, pages, total } = await this.model.paginate(options);

    return {
      result: { data: docs, pages, total },
      fields: this.model.fields,
    };
  }

  //Function for Layout Revision Update
  async layoutRevisionUpdate(req, current, previous) {
    let update_data = {
      name: current.name,
      html: current.html,
      layout_json: current.layout_json,
      updated_by: req.user.id,
    };

    let model_update = this.model.update(update_data, {
      where: {
        id: req.params.id,
      },
    });
    console.log("==================", req);
    let rev_layout_id = req.body.rev_layout_id || null;
    // let updateResponse = await super.update(previous);
    if (rev_layout_id === null) {
      let create_data = {
        name: previous.name,
        html: previous.html,
        layout_json: previous.layout_json,
        code: previous.code + "-rev-" + (parseInt(req.countBackups) + 1),
        company_portal_id: req.headers.site_id,
        created_by: req.user.id,
      };
      let model = await Layout.create(create_data);
      // let saveResponse = await super.save(createData);
    }

    return true;
  }
}

module.exports = LayoutController;
