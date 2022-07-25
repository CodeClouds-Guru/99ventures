const Controller = require("./Controller");
class PermissionController extends Controller {
  constructor() {
    super('permission');
  }
}

module.exports = new PermissionController();
