const Controller = require("./Controller");
class UserController extends Controller {
  constructor() {
    super('user');
  }
}

module.exports = new UserController();
