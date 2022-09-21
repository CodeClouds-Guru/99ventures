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

      //actions
      let all_actions = await Action.findAll({
        attributes: ["id", "name", "slug", "parent_action"],
        order: ["parent_action"],
      });

      //get formatted action data
      let actions_in_group = await this.getFormattedChildParentData(
        all_actions,
        [],
        "parent_action",
        []
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
        "parent_module",
        role_permissions
      );
      // console.log("======================modules", modules);

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
    let module_data = req.body.role_permissions || [];
    // let module_data = {
    //   Administrations: [
    //     {
    //       id: 1,
    //       slug: "users",
    //       name: "Users",
    //       action: ["update", "view"],
    //     },
    //     {
    //       id: 2,
    //       slug: "roles",
    //       name: "Roles",
    //       action: ["update"],
    //     },
    //     {
    //       id: 3,
    //       slug: "modules",
    //       name: "Modules",
    //       action: [],
    //     },
    //     {
    //       id: 4,
    //       slug: "actions",
    //       name: "Actions",
    //       action: [],
    //     },
    //     {
    //       id: 5,
    //       slug: "permissions",
    //       name: "Permissions",
    //       action: [],
    //     },
    //     {
    //       id: 6,
    //       slug: "groups",
    //       name: "Groups",
    //       action: [],
    //     },
    //     {
    //       id: 7,
    //       slug: "companies",
    //       name: "Companies",
    //       action: [],
    //     },
    //     {
    //       id: 8,
    //       slug: "portals",
    //       name: "Portals",
    //       action: [],
    //     },
    //     {
    //       id: 14,
    //       slug: "emailtemplates",
    //       name: "Email Templates",
    //       action: [],
    //     },
    //   ],
    //   Configurations: [
    //     {
    //       id: 9,
    //       slug: "emailconfigurations",
    //       name: "Email Configurations",
    //       action: [],
    //     },
    //     {
    //       id: 10,
    //       slug: "ipconfigurations",
    //       name: "Ip Configurations",
    //       action: [],
    //     },
    //     {
    //       id: 11,
    //       slug: "generalconfigurations",
    //       name: "General Configurations",
    //       action: [],
    //     },
    //     {
    //       id: 12,
    //       slug: "paymentconfigurations",
    //       name: "Payment Configurations",
    //       action: [],
    //     },
    //     {
    //       id: 13,
    //       slug: "downtime",
    //       name: "Downtime",
    //       action: [],
    //     },
    //     {
    //       id: 15,
    //       slug: "metatagconfigurations",
    //       name: "Meta Tag Configurations",
    //       action: [],
    //     },
    //     {
    //       id: 16,
    //       slug: "scripts",
    //       name: "Scripts",
    //       action: [],
    //     },
    //   ],
    // };
    const types = ["all", "group", "owner"];

    let all_actions = await Action.findAll({
      attributes: ["id", "name", "slug", "parent_action"],
      order: ["parent_action"],
    });

    //get formatted action data
    let actions_in_group = await this.getFormattedChildParentData(
      all_actions,
      [],
      "parent_action",
      []
    );
    // console.log("================module_data[i]", module_data);
    let keys = Object.keys(module_data);
    let selected_permissions = [];
    keys.map((key) => {
    for (let i = 0; i < module_data[key].length; i++) {
     
      for (let j = 0; j < module_data[key][i].action.length; j++) {
        // Object.entries(module_data[key][i].action[j]).find(([key, value]) => {
          if (module_data[key][i].action.length > 0) {
            let action_key = module_data[key][i].action[j]
            for (let k = 0; k < actions_in_group[action_key].length; k++) {
              for (let l = 0; l < types.length; l++) {
                selected_permissions.push(
                  types[l] +
                    "-" +
                    module_data[key][i].slug +
                    "-" +
                    actions_in_group[action_key][k].slug
                );
              }
            }
          }
        // });
      }
    }
  });
  // console.log("================selected_permissions", selected_permissions);
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
    field_name = "parent_action",
    role_permissions
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
        let actions = [];
        if (role_permissions.length > 0) {
          role_permissions.find((val, index) => {
            if (val.slug.includes("-" + all_action.slug + "-list")) {
              if (!actions.includes("view")) actions.push("view");
            }
            if (val.slug.includes("-" + all_action.slug + "-save")) {
              if (!actions.includes("update")) actions.push("update");
            }
            if (val.slug.includes("-" + all_action.slug + "-delete")) {
              if (!actions.includes("delete")) actions.push("delete");
            }
          });
        }

        // console.log("==============actions====", actions);
        if (curr_parent_data == prev_parent_data) {
          result[prev_parent_data].push({
            id: all_action.id,
            slug: all_action.slug,
            name: all_action.name,
            ...(field_name === "parent_module" && { action: actions }),
          });
        } else {
          prev_parent_data = curr_parent_data;
          result[prev_parent_data] = [
            {
              id: all_action.id,
              slug: all_action.slug,
              name: all_action.name,
              ...(field_name === "parent_module" && {
                action: actions,
              }),
            },
          ];
        }
      });
    }
    return result;
  }
}

module.exports = RoleController;
