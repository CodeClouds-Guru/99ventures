const Controller = require("./Controller");
const { Op } = require("sequelize");
class MemberTransactionController extends Controller {
  constructor() {
    super("MemberTransaction");
  }
  //override save function
  // async list(req, res) {

  // }
}
module.exports = MemberTransactionController;