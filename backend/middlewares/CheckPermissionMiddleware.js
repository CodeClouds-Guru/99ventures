/**
 * @description Middleware to check permissions of the user who sent the request. Request without enough privilage will result 403 error
 * @author Sourabh (CodeClouds)
 */
const db = require('../models/index')
const { QueryTypes, Op } = require('sequelize')
const { Group, Role, Permission } = db

function checkPermission(permissions, module, action) {
  for (let permission of permissions) {
    if (
      ['deleteParmanently', 'restore'].indexOf(action) > -1 &&
      checkCombination(module, 'delete', permission)
    ) {
      return true
    } else if (
      ['change'].indexOf(action) > -1 &&
      checkCombination(module, 'update', permission)
    ) {
      return true
    } else if (
      ['fetchDropdownOptions'].indexOf(action) > -1 &&
      checkCombination(module, 'list', permission)
    ) {
      return true
    } else if (checkCombination(module, action, permission)) {
      return true
    }
  }
  return false
}

function checkCombination(module, action, permission) {
  return (
    permission.indexOf(`all-${module}-${action}`) > -1 ||
    permission.indexOf(`group-${module}-${action}`) > -1 ||
    permission.indexOf(`owner-${module}-${action}`) > -1
  )
}

module.exports = async function (req, res, next) {
  const user = req.user
  const company_id = req.headers.company_id ?? 1
  let partial_path = req.originalUrl.replace('api/', '').split('?').shift()
  var [, module, action] = partial_path.split('/')
  if (typeof action === 'undefined' || action.trim().length === 0) {
    action = 'list'
  }
  // console.log('-------------------',module,action)
  const companies = await db.sequelize.query(
    'SELECT * FROM company_user WHERE company_id = ? AND user_id = ?',
    {
      replacements: [company_id, user.id],
      type: QueryTypes.SELECT,
    }
  )
  const group_ids = companies.map((item) => item.group_id)
  // console.log('-------------------',group_ids)

  const group_role_permissions = await Group.findAll({
    where: {
      id: {
        [Op.in]: group_ids,
      },
    },
    include: [
      {
        model: Role,
        through: {
          attributes: ['group_id', 'role_id'],
        },
        include: [
          {
            model: Permission,
            through: {
              attributes: ['role_id', 'permission_id'],
            },
          },
        ],
      },
    ],
  })
  let permissions = []
  const roles = []
  if (group_role_permissions.length > 0) {
    group_role_permissions[0].Roles.forEach((element) => {
      roles.push({
        id: element.id,
        slug: element.slug,
        name: element.name,
      })
      element.Permissions.forEach((perm) => permissions.push(perm.slug))
    })
  }
  permissions = [...new Set(permissions)]
  req.user.roles = roles
  req.user.permissions = permissions
  module = module.replace('-', '').trim()
  if (checkPermission(permissions, module, action)) {
    next()
  } else {
    res.status(403).json({
      status: false,
      errors: 'You are not authorize to access this section',
    })
  }
}
