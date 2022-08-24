const Controller = require('./Controller')
const {
  Action,
  Module,
  PermissionRole,
  Permission,
  sequelize,
} = require('../../models/index')
const queryInterface = sequelize.getQueryInterface()
class RoleController extends Controller {
  constructor() {
    super('Role')
  }
  //override the edit function
  async edit(req, res) {
    try {
      let response = await super.edit(req)
      //actions
      let all_actions = await Action.findAll({
        attributes: ['id', 'name', 'slug'],
      })
      all_actions = all_actions.map((all_action) => {
        return {
          id: all_action.id,
          slug: all_action.slug,
          name: all_action.name,
          minWidth: 170,
          align: 'left',
        }
      })
      //modules
      let all_modules = await Module.findAll({
        attributes: ['id', 'name', 'slug'],
      })
      all_modules = all_modules.map((all_module) => {
        return {
          id: all_module.id,
          slug: all_module.slug,
          name: all_module.name,
        }
      })
      //role permissions
      let role_permissions = await response.result.getPermissions({
        attributes: ['name', 'id', 'slug'],
      })
      role_permissions = role_permissions.map((role_permission) => {
        return {
          id: role_permission.id,
          slug: role_permission.slug,
          name: role_permission.name,
        }
      })
      return {
        actions: all_actions,
        modules: all_modules,
        role_permissions: role_permissions,
        result: response.result,
        fields: response.fields,
      }
    } catch (error) {
      throw error
    }
  }
  //override role update function
  async update(req, res) {
    let role_details = await this.model.findByPk(req.params.id)
    if (role_details) {
      if (req.body.requestType == 'apply-permission') {
        let update_role_permission = await this.updateRolePermission(req)
      } else {
        let response = await super.update(req)
      }
      return {
        message: 'Record has been updated successfully',
      }
    } else {
      this.throwCustomError('Role not found', 404)
    }
  }

  //update role and permissions
  async updateRolePermission(req, res) {
    let permission_slugs = req.body.role_permissions
    //get permossion ids
    if (permission_slugs.length) {
      let permissions = await Permission.findAll({
        attributes: ['id'],
        where: { slug: permission_slugs },
      })
      permissions = permissions.map((permission) => {
        return {
          permission_id: permission.id,
          role_id: req.params.id,
        }
      })
      //delete previous record
      await PermissionRole.destroy({ where: { role_id: req.params.id } })
      //update role permission table
      await queryInterface.bulkInsert('permission_role', permissions)
    }
    return true
  }
}

module.exports = RoleController
