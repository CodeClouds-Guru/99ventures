'use strict'
const { Model } = require('sequelize')
const sequelizePaginate = require('sequelize-paginate')
const Joi = require('joi')
const { stringToSlug } = require('../helpers/global')
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Role.belongsToMany(models.Permission, {
        through: 'permission_role',
        timestamps: false,
        foreignKey: 'role_id',
        otherKey: 'permission_id',
      })
      Role.belongsToMany(models.Group, {
        through: 'group_role',
        foreignKey: 'role_id',
        otherKey: 'group_id',
        timestamps: false,
      })
    }
  }
  Role.init(
    {
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: 'Role',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'roles',
      hooks: {
        beforeCreate: (role, options) => {
          role.slug = stringToSlug(role.name)
        },
        beforeUpdate: (role, options) => {
          role.slug = stringToSlug(role.name)
        },
      },
    }
  )
  Role.validate = function (req) {
    const schema = Joi.object({
      name: Joi.string().required(),
    })
    return schema.validate(req.body)
  }
  Role.fields = {
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
    slug: {
      field_name: 'slug',
      db_name: 'slug',
      type: 'text',
      placeholder: 'Slug',
      listing: true,
      show_in_form: false,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    created_at: {
      field_name: 'created_at',
      db_name: 'created_at',
      type: 'text',
      placeholder: 'Created at',
      listing: true,
      show_in_form: false,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
  }
  sequelizePaginate.paginate(Role)
  return Role
}
