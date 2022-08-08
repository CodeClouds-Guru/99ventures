'use strict'
const { Model } = require('sequelize')
const sequelizePaginate = require('sequelize-paginate')
const Joi = require('joi')
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    static associate(models) {
      Group.belongsToMany(models.Role, {
        through: 'group_role',
        timestamps: false,
        foreignKey: 'group_id',
        otherKey: 'role_id',
      })
      Group.belongsToMany(models.User, {
        as: 'users',
        through: 'company_user',
        foreignKey: 'group_id',
        otherKey: 'user_id',
        timestamps: false,
      })
    }
  }
  Group.validate = function (req) {
    const schema = Joi.object({
      name: Joi.string().required(),
    })
    return schema.validate(req.body)
  }
  Group.init(
    {
      name: DataTypes.STRING,
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
      deleted_at: DataTypes.TIME,
    },
    {
      sequelize,
      modelName: 'Group',
      timestamps: true,
      paranoid: true,
      // createdAt: 'created_at', // alias createdAt as created_date
      // updatedAt: 'updated_at',
      // deletedAt: 'deleted_at',
      underscored: true,
      tableName: 'groups',
    }
  )
  Group.extra_fields = ['roles']

  Group.fields = {
    id: {
      field_name: 'id',
      db_name: 'id',
      type: 'text',
      placeholder: 'Id',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    name: {
      field_name: 'name',
      db_name: 'name',
      type: 'text',
      placeholder: 'Name',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    roles: {
      field_name: 'roles',
      db_name: 'roles',
      type: 'multi-select',
      placeholder: 'Roles',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
      options: [],
    },
    created_at: {
      field_name: 'created_at',
      db_name: 'created_at',
      type: 'text',
      placeholder: 'Created At',
      listing: true,
      show_in_form: false,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
  }
  sequelizePaginate.paginate(Group)

  return Group
}
