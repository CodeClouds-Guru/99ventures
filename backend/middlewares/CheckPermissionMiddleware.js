/**
 * @description Middleware to check permissions of the user who sent the request. Request without enough privilage will result 403 error
 * @author Sourabh (CodeClouds)
 */

// const rules = require("../config/acl");
const extraActionsThatRequiresSamePermission = {
  deleteParmanently: 'delete',
  restore: 'delete',
  change: 'update',
  fetchDropdownOptions: 'list',
}

function checkPermission(permissions, module, action) {
  for (let permission of permissions) {
    if (
      ['deleteParmanently', 'restore'].indexOf(action) > -1 &&
      permission.indexOf(`${module}-delete`) > -1
    ) {
      return true
    } else if (
      ['change'].indexOf(action) > -1 &&
      permission.indexOf(`${module}-update`) > -1
    ) {
      return true
    } else if (
      ['fetchDropdownOptions'].indexOf(action) > -1 &&
      permission.indexOf(`${module}-list`) > -1
    ) {
      return true
    } else if (permission.indexOf(`${module}-${action}`) > -1) {
      return true
    }
  }
  return false
}

module.exports = function (req, res, next) {
  const user = req.user
  const company_id = 1
  let partial_path = req.originalUrl.replace('api/', '').split('?').shift()
  var [, module, action] = partial_path.split('/')
  if (typeof action === 'undefined') {
    action = 'list'
  }
  const companies = user.getCompanies({
    where: {
      company_id,
    },
  })
  res.send(companies)
}
