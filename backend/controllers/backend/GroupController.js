const Controller = require("./Controller");
class GroupController extends Controller {
  constructor() {
    super('Group');
  }
}

module.exports = new GroupController();