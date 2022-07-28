const Controller = require("./Controller");
class PermissionController extends Controller {
  constructor() {
    super('Permission');
  }
}

module.exports = new PermissionController();
