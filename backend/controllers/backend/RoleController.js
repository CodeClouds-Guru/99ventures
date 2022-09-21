const Controller = require("./Controller");
const {
  Action,
  Module,
  PermissionRole,
  Permission,
  sequelize,
} = require("../../models/index");
const queryInterface = sequelize.getQueryInterface();
class RoleController extends Controller {
  constructor() {
    super("Role");
    this.edit = this.edit.bind(this);
    this.update = this.update.bind(this);
  }
  //override the edit function
  async edit(req, res) {
    try {
      let response = await super.edit(req);
      //actions
      let all_actions = await Action.findAll({
        attributes: ["id", "name", "slug", "parent_action"],
        order: ["parent_action"],
      });

      //get formatted action data
      let actions_in_group = await this.getFormattedChildParentData(
        all_actions,
        [],
        "parent_action"
      );

      let actions = all_actions.map((all_action) => {
        return {
          id: all_action.id,
          slug: all_action.slug,
          name: all_action.name,
          minWidth: 170,
          align: "left",
        };
      });

      //modules
      let all_modules = await Module.findAll({
        attributes: ["id", "name", "slug", "parent_module"],
        order: ["parent_module"],
      });

      const action_keys = Object.keys(actions_in_group);

      //get formatted module data
      let modules = await this.getFormattedChildParentData(
        all_modules,
        action_keys,
        "parent_module"
      );
      // console.log("======================modules", modules);

      //role permissions
      let role_permissions = await response.result.getPermissions({
        attributes: ["name", "id", "slug"],
      });
      role_permissions = role_permissions.map((role_permission) => {
        return {
          id: role_permission.id,
          slug: role_permission.slug,
          name: role_permission.name,
        };
      });
      return {
        actions: actions,
        modules: all_modules,
        role_permissions: role_permissions,
        result: response.result,
        fields: response.fields,
        new_modules: modules,
      };
    } catch (error) {
      throw error;
    }
  }
  //override role update function
  async update(req, res) {
    let role_details = await this.model.findByPk(req.params.id);
    let module_data = [
      {
        id: 1,
        slug: "users",
        name: "Users",
        action: [
          {
            delete: false,
          },
          {
            update: true,
          },
          {
            view: true,
          },
        ],
      },
    ];

    const types = ["all", "group", "owner"];

    //parent modules
    // let parent_modules = await Module.findAll({
    //   attributes: ["parent_module"],
    //   group: ["parent_module"],
    // });

    //search for update value

    let all_actions = await Action.findAll({
      attributes: ["id", "name", "slug", "parent_action"],
      order: ["parent_action"],
    });

    //get formatted action data
    let actions_in_group = await this.getFormattedChildParentData(
      all_actions,
      [],
      "parent_action"
    );

    // //modules
    // let all_modules = await Module.findAll({
    //   attributes: ["id", "name", "slug", "parent_module"],
    //   order: ["parent_module"],
    // });
    let selected_permissions = [];
    for (let i = 0; i < module_data.length; i++) {
      for (let j = 0; j < module_data[i].action.length; j++) {
        Object.entries(module_data[i].action[j]).find(([key, value]) => {
          if (value === true) {
            for (let k = 0; k < actions_in_group[key].length; k++) {
              for (let l = 0; l<types.length; l++) {
                selected_permissions.push(
                  types[l] 
                  +
                    "-" +
                    module_data[i].slug +
                    "-" +
                    actions_in_group[key][k].slug
                );
              }
            }
          }
        });
      }
    }
    console.log("=============selected_permissions", selected_permissions);
    req.body.role_permissions = selected_permissions;
    if (role_details) {
      if (req.body.requestType == "apply-permission") {
        let update_role_permission = await this.updateRolePermission(req);
      } else {
        let response = await super.update(req);
      }
      return {
        message: "Record has been updated successfully",
      };
    } else {
      this.throwCustomError("Role not found", 404);
    }
  }

  //update role and permissions
  async updateRolePermission(req, res) {
    let permission_slugs = req.body.role_permissions;
    //get permossion ids
    if (permission_slugs.length) {
      let permissions = await Permission.findAll({
        attributes: ["id"],
        where: { slug: permission_slugs },
      });
      permissions = permissions.map((permission) => {
        return {
          permission_id: permission.id,
          role_id: req.params.id,
        };
      });
      //delete previous record
      await PermissionRole.destroy({ where: { role_id: req.params.id } });
      //update role permission table
      await queryInterface.bulkInsert("permission_role", permissions);
    }
    return true;
  }

  async getFormattedChildParentData(
    all_data,
    data_in_group = [],
    field_name = "parent_action"
  ) {
    let result = {};
    let prev_parent_data = "";
    if (all_data.length > 0) {
      all_data.map((all_action) => {
        let curr_parent_data = "";
        if (field_name === "parent_action") {
          curr_parent_data = all_action.parent_action;
        } else {
          curr_parent_data = all_action.parent_module;
        }
        if (curr_parent_data == prev_parent_data) {
          result[prev_parent_data].push({
            id: all_action.id,
            slug: all_action.slug,
            name: all_action.name,
            ...(data_in_group.length > 0 && { action: data_in_group }),
          });
        } else {
          prev_parent_data = curr_parent_data;
          result[prev_parent_data] = [
            {
              id: all_action.id,
              slug: all_action.slug,
              name: all_action.name,
              ...(data_in_group.length > 0 && { action: data_in_group }),
            },
          ];
        }
      });
    }
    return result;
  }
}

module.exports = RoleController;
