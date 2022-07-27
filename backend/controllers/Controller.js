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
      fields: this.model.fields,
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
    let request_data = req.body;
    const { error, value } = this.model.validate(req);
    if (error) {
      res.status(401).json({
        status: false,
        errors: error.details.map((err) => err.message),
      })
      return
    }
    try {
      let model = await this.model.create(request_data);
      return {
        message: "Record has been created successfully",
        result: model,
      };
    } catch (error) {
      throw error;
    }
  }

  async show(req, res) {
    try {
      let model = await this.model.findByPk(req.params.id);
      let fields = this.model.fields;
      return { result: model, fields };
    } catch (error) {
      throw error;
    }
  }

  async update(req, res) {
    let id = req.params.id;
    let request_data = req.body;
    try {
      let model = await this.model.update(request_data, { where: { id } });
      return {
        message: "Record has been updated successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  async delete(req, res) {
    try {
      let model = await this.model.findByPk(req.params.id);
      await model.destroy();
      return {
        message: "Record has been deleted successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  async restore(req, res) {
    let id = req.params.id;
    try {
      await this.model.restore({where:{id}});
      return {
        message: "Record has been restored successfully",
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Controller;
