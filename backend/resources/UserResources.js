// 'use strict'

const {
    Role,
    Permission,
    Group,
} = require('../models/index')
const { QueryTypes } = require('sequelize')
const db = require('../models/index')


module.exports = class UserResources {
    constructor(user, company_id = 0) {
        this.user = user
        this.company_id = company_id
    }
    //for testing
    async getUserFormattedData() {
        if (!this.user) {
            return this.response;
        }
        var groups = []
        var roles = ['admin']
        var permissions = []
        var company = []
        var companies = []
        let user = this.user
        return user
        // console.log('======================',this.company_id)
        if (this.company_id !== 0) {
            // company = await Company.findByPk(this.company_id, {
            //     include: ['CompanyPortals'],
            // })

            company = await user.getCompanies({ include: ['CompanyPortals'], })
            companies = await db.sequelize.query(
                'SELECT * FROM company_user WHERE company_id = ? AND user_id = ? LIMIT 1',
                {
                    replacements: [this.company_id, user.id],
                    type: QueryTypes.SELECT,
                }
            )
            if (companies && companies.length > 0) {

                const group = await Group.findOne({
                    where: {
                        id: companies[0].group_id,
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
                // console.log('======================',JSON.stringify(group.Roles))

                groups = [group]
                // console.log(groups)
                group.Roles.forEach((r) => {
                    roles.push({
                        id: r.id,
                        name: r.name,
                        slug: r.slug,
                    })
                    r.Permissions.forEach((p) => {
                        permissions.push(p.slug)
                    })
                })
                permissions = [...new Set(permissions)]
            }
        } else {
            // company = JSON.stringify(await Company.findAll({ include: ['CompanyPortals'] }))
            company = await user.getCompanies({ include: ['CompanyPortals'], })
            companies = await db.sequelize.query(
                'SELECT * FROM company_user WHERE 1',
                {
                    type: QueryTypes.SELECT,
                }
            )
        }


        user.setDataValue('permissions', permissions)
        user.setDataValue('roles', roles)
        user.setDataValue('groups', groups)
        user.setDataValue('companies', company)
        // console.log('---------------', company)
        return user
    }

}

// module.exports = UserResources;