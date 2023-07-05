const Controller = require("./Controller");
const { ShoutboxConfiguration } = require("../../models/index");
const { json } = require("body-parser");

class ShoutboxConfigurationController extends Controller {
    constructor() {
      super("ShoutboxConfiguration");
    }
    async list(req,res){
      req.query.where = JSON.stringify({"company_portal_id":req.headers.site_id})
      return await super.list(req);
    }
}
module.exports = ShoutboxConfigurationController;