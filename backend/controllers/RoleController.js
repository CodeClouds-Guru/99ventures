const Controller = require("./Controller");
class RoleController extends Controller {
  constructor() {
    super('role');
  }
}

module.exports = new RoleController();
