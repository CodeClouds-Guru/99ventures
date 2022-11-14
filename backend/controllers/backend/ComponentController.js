const Controller = require("./Controller");
const { Op } = require("sequelize");
const { Component } = require("../../models/index");
class ComponentController extends Controller {
  constructor() {
    super("Component");
    this.componentRevisionUpdate = this.componentRevisionUpdate.bind(this);
  }
  //override save function
  async save(req, res) {
    req.body.company_portal_id = req.headers.site_id;

    let response = await super.save(req);
    return {
      status: true,
      message: "Component added.",
      id: response.result.id,
    };
  }
  //override update function
  async update(req, res) {
    req.body.company_portal_id = req.headers.site_id;

    //modification
    let rev_component_id = req.body.rev_component_id || null;
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
    if (rev_component_id !== null) {
      current = await this.model.findByPk(rev_component_id);
    } else {
      current = req.body;
    }
    let response = await this.componentRevisionUpdate(req, current, previous);

    //end of modification

    // let response = await super.update(req);
    return {
      status: true,
      message: "Component updated.",
    };
  }
  //override delete function
  async delete(req, res) {
    let response = await super.delete(req);
    return {
      status: true,
      message: "Component deleted.",
    };
  }

  //override list function
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

  //override edit function
  async edit(req, res) {
    try {
      let company_portal_id = req.headers.site_id;

      let model = await this.model.findByPk(req.params.id);

      const allBackups = await this.model.findAndCountAll({
        attributes: ["id", "name"],
        where: {
          code: {
            [Op.like]: "%" + model.code + "-rev-%",
          },
        },
      });

      let fields = this.model.fields;
      return {
        status: true,
        result: model,
        fields,
        revisions: allBackups,
      };
    } catch (error) {
      throw error;
    }
  }

  //Function for Layout Revision Update
  async componentRevisionUpdate(req, current, previous) {
    let update_data = {
      name: current.name,
      html: current.html,
      component_json: current.component_json,
      updated_by: req.user.id,
    };
    console.log("===========================", update_data);

    let model_update = this.model.update(update_data, {
      where: {
        id: req.params.id,
      },
    });
    // let updateResponse = await super.update(previous);

    let create_data = {
      name: previous.name,
      html: previous.html,
      component_json: previous.component_json,
      code: previous.code + "-rev-" + (parseInt(req.countBackups) + 1),
      company_portal_id: req.headers.site_id,
      created_by: req.user.id,
    };
    console.log("===========================", create_data);
    let model = await Component.create(create_data);
    // let saveResponse = await super.save(createData);
    return true;
  }
}

module.exports = ComponentController;
