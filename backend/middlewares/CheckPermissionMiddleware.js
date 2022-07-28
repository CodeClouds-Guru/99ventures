const { User, Group, Module, Permission } = require('../models')

class CheckPermissionMiddleware {
  constructor() {
    this.handle = this.handle.bind(this)
  }
}

module.exports = CheckPermissionMiddleware
