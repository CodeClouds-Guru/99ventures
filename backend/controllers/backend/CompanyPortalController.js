const Controller = require('./Controller')
class UserController extends Controller {
  constructor() {
    super('CompanyPortal')
  }
}

module.exports = new UserController()
