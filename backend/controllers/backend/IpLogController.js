const Controller = require("./Controller");
const { Op } = require("sequelize");
class IpLogController extends Controller {
  constructor() {
    super("IpLog");
  }
  
}
module.exports = IpLogController;