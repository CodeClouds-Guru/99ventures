const Models = require("../../models");
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

  // This is end point for all fields
  async add(req, res) {
    return {
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
    let extra_fields = this.model.extra_fields || [];
    let attributes = Object.values(fields).filter(
      (attr) => extra_fields.indexOf(attr.db_name) == -1
    ).map(attr => attr.db_name);
    // let searchable_fields = [...attributes].filter((key) => {
    //   if (fields[key] && fields[key]["searchable"]) {
    //     return true;
    //   }
    // });
    let searchable_fields = [];
    for (const key in fields) {
      if (('searchable' in fields[key]) && (fields[key].searchable)) {
        searchable_fields.push(key)
      }
    }

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
    var query_where = req.query.where ? JSON.parse(req.query.where) : null;
    if ("where" in options && query_where) {
      options['where'] = {
        [Op.and]: {
          ...query_where,
          ...options['where']
        }
      }
    } else if (query_where != null) {
      options['where'] = {
        ...query_where
      }
    }
    return options;
  }

  async save(req, res) {
    let request_data = req.body;
    const { error, value } = this.model.validate(req);
    if (error) {
      const errorObj = new Error("Validation failed.");
      errorObj.statusCode = 422;
      errorObj.data = error.details.map((err) => err.message);
      throw errorObj;
    }
    try {
      request_data.created_by = req.user.id;
      let model = await this.model.create(request_data, { silent: true });
      return {
        message: "Record has been created successfully",
        result: model,
      };
    } catch (error) {
      throw error;
    }
  }

  async edit(req, res) {
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
    const { error, value } = this.model.validate(req);
    if (error) {
      const errorObj = new Error("Validation failed.");
      errorObj.statusCode = 422;
      errorObj.data = error.details.map((err) => err.message);
      throw errorObj;
    }
    try {
      request_data.updated_by = req.user.id;
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
      let modelIds = req.body.modelIds ?? [];
      let models = await this.model.findAll({ where: { id: modelIds } });
      await this.model.destroy({ where: { id: modelIds } });
      if (models) {
        models.forEach(async (model) => {
          model.deleted_by = req.user.id;
          await model.save();
        });
      }
      return {
        message: "Record has been deleted successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  async restore(req, res) {
    let modelIds = req.body.orderIds ?? [];
    try {
      await this.model.restore({ where: { id: modelIds } });
      let models = await this.model.findAll({ where: { id: modelIds } });
      if (models) {
        models.forEach(async (model) => {
          model.deleted_by = null;
          await model.save();
        });
      }
      return {
        message: "Record has been restored successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  throwCustomError(message, status = 422) {
    const errorObj = new Error("Request failed.");
    errorObj.statusCode = status;
    errorObj.data = message;
    throw errorObj;
  }
}

module.exports = Controller;
