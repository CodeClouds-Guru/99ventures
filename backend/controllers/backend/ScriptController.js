const Controller = require("./Controller");
const { stringToSlug } = require("../../helpers/global");
const { Script } = require("../../models/index");

class ScriptController extends Controller {
  constructor() {
    super("Script");
  }

  async list(req, res) {
    const options = this.getQueryOptions(req);
    options.where = { company_portal_id: req.headers.site_id };

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

  //override save function
  async save(req, res) {
    req.body.company_portal_id = req.headers.site_id;
    try {
      const script_name = req.body.name || "";
      // req.body.code = stringToSlug(script_name) + '-'+new Date().getTime();
      req.body.code =
        script_name
          .split(" ")
          .reduce((response, word) => (response += word.slice(0, 1)), "") +
        "-" +
        new Date().getTime();
      req.body.script_json = JSON.stringify(req.body.script_json) || {};

      req.body.script_json = JSON.parse(req.body.script_json) || {};
      console.log("-----------------------", req.body);
      let model = await super.save(req);
      return {
        status: true,
        message: "Record has been created successfully",
        result: model.result,
      };
    } catch (error) {
      throw error;
    }
  }

  async update(req, res) {
    let request_data = req.body;
    let id = req.params.id;
    try {
      let prev_data = await this.model.findOne({ where: { id: id } });

      if (prev_data.length > 0) {
        req.body.updated_by = req.user.id;
        const script_name = req.body.name || "";
        req.body.code =
          script_name
            .split(" ")
            .reduce((response, word) => (response += word.slice(0, 1)), "") +
          "-" +
          new Date().getTime();
        const result = super.update(req, {
          where: {
            id: id,
          },
        });
        // await super.save(request_data);
        return {
          status: true,
          message: "Record has been created successfully",
          result: result,
        };
      } else {
        return {
          status: false,
          message: "No record found",
          result: result,
        };
      }
    } catch (error) {
      throw error;
    }
  }
}
module.exports = ScriptController;
