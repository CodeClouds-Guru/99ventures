'use strict'
const { Model } = require('sequelize')
const sequelizePaginate = require('sequelize-paginate')
const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Group.belongsToMany(models.Role, {
        as: 'roles',
        through: 'group_role',
        foreignKey: 'group_id',
        otherKey: 'role_id',
      })
    }
  }
  Group.validate = function (req) {
    const schema = Joi.object({
                        name: Joi.string().required()

    });
    return schema.validate(req.body);
  };
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
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'groups',
    }
  )
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
