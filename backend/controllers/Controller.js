const Models = require("../models");
const { Op } = Models.Sequelize;
class Controller {
  constructor(modelName) {
    // this.list = this.list.bind(this);
    this.model = Models[modelName];
  }

  async list(req, res) {
    const options = this.getQueryOptions(req);
    const { docs, pages, total } = await this.model.paginate(options);
    return {
      result: { data: docs, pages, total },
      fields: this.model.fields
    };
  }

  getQueryOptions(req) {
    let page = req.query.page || 1;
    let show = parseInt(req.query.show) || 10; // per page record
    var search = req.query.search || "";
    let sort_field = req.query.sort || "id";
    let sort_order = req.query.sort_order || "desc";
    let fields = this.model.fields;
    let attributes = Object.keys(fields);
    let searchable_fields = [...attributes].filter((key) => {
      if (fields[key] && fields[key]["searchable"]) {
        return true;
      }
    });
    let options = {
      attributes,
      page,
      paginate: show,
      order: [[sort_field, sort_order]],
    };
    if (search != "") {
      options["where"] = {
        [Op.or]: searchable_fields.map((key) => {
          let obj = {};
          obj[key] = { [Op.like]: `%${search}%` };
          return obj;
        }),
      };
    }

    return options;
  }

  async store(req, res) {
    return {};
  }

  async show(req, res) {
    let model = await this.model.findByPk(req.params.id);
    return model;
  }

  async update(req, res) {
    return {};
  }

  async delete(req, res) {
    return {};
  }
}

module.exports = Controller;
