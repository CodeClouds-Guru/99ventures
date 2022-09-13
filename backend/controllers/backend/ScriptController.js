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
      req.body.status = 0;
      console.log("-----------------------", req.body);
      let model = await super.save(req);
      return {
        message: "Record has been created successfully",
        result: model,
      };
    } catch (error) {
      throw error;
    }
  }

  async update(req, res) {
    let request_data = req.body;
    let id = req.params.id;
    try {
      request_data.updated_by = req.user.id;
      // let model = await this.model.create(request_data, { silent: true });
      const result = Script.update(request_data, {
        where: {
          id: id,
        },
      });
      // await super.save(request_data);
      return {
        message: "Record has been created successfully",
        result: result,
      };
    } catch (error) {
      throw error;
    }
  }
}
module.exports = ScriptController;
