// 'use strict'

const { Role, Permission, Group, CompanyUser } = require("../models/index");
const { QueryTypes } = require("sequelize");
const db = require("../models/index");

module.exports = class UserResources {
  constructor(user, company_id = 0) {
    this.user = user;
    this.company_id = company_id;
  }

  async getUserFormattedData() {
    if (!this.user) {
      return this.response;
    }
    var groups = [];
    var permissions = [];
    var company = [];
    var companies = [];
    var roles = [];
    let user = this.user;
    company = await user.getCompanies({ include: ["CompanyPortals"] });

    if (this.company_id !== 0) {
      companies = await CompanyUser.findAll({
        where: { company_id: this.company_id, user_id: user.id },
      });

      if (companies && companies.length > 0) {
        const group = await Group.findOne({
          where: {
            id: companies[0].group_id,
          },
          include: [
            {
              model: Role,
              through: {
                attributes: ["group_id", "role_id"],
              },
              include: [
                {
                  model: Permission,
                  through: {
                    attributes: ["role_id", "permission_id"],
                  },
                },
              ],
            },
          ],
        });
        groups = [group];
        group.Roles.forEach((r) => {
          roles.push({
            id: r.id,
            name: r.name,
            slug: r.slug,
          });
          r.Permissions.forEach((p) => {
            permissions.push(p.slug);
          });
        });
        permissions = [...new Set(permissions)];
      }
      user.setDataValue("roles", roles);
    } else {
      companies = await CompanyUser.findAll();
    }
    // console.log("from user resource", this.company_id, user.id, companies);

    user.setDataValue("permissions", permissions);
    user.setDataValue("groups", groups);
    user.setDataValue("companies", company);
    return user;
  }
};
