const Controller = require('./Controller')
class UserController extends Controller {
  constructor() {
    super('User')
  }
}

module.exports = new UserController()
