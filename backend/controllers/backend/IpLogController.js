const Controller = require("./Controller");
const { Op } = require("sequelize");
class IpLogController extends Controller {
  constructor() {
    super("IpLog");
  }
  //get list
  async list(req, res) {
    const options = this.getQueryOptions(req);
    options.paranoid = false
    const { docs, pages, total } = await this.model.paginate(options);
    return {
      result: { data: docs, pages, total },
      fields: this.model.fields,
    };
  }
}
module.exports = IpLogController;