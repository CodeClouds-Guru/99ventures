const Controller = require("./Controller");
const { Action, Module, PermissionRole } = require('../../models/index')
class RoleController extends Controller {
  constructor() {
    super('Role');
  }
  //override the edit function
  async edit(req, res) {
    try {
      let response = await super.edit(req)
      //actions
      let all_actions = await Action.findAll({ attributes: ['id', 'name','slug']});
      all_actions = all_actions.map(all_action => {
        return {
          id: all_action.id,
          slug: all_action.slug,
          name: all_action.name,
          minWidth:170,
          align:"left"
        }
      })
      //modules
      let all_modules = await Module.findAll({ attributes: ['id', 'name','slug']});
      all_modules = all_modules.map(all_module => {
        return {
          id: all_module.id,
          slug: all_module.slug,
          name: all_module.name
        }
      })
      //role permissions
      let role_permissions = await response.result.getPermissions({ attributes: ['name','id','slug']});
      role_permissions = role_permissions.map(role_permission => {
        return {
          id: role_permission.id,
          slug: role_permission.slug,
          name: role_permission.name
        }
      })
      return {
        actions: all_actions,
        modules: all_modules,
        role_permissions:role_permissions,
        result:response.result,
        fields:response.fields
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new RoleController();
