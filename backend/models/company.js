'use strict'
const { Model } = require('sequelize')
const sequelizePaginate = require("sequelize-paginate");
const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Company.belongsToMany(models.User, {
        as: 'users',
        through: 'company_user',
        foreignKey: 'company_id',
        otherKey: 'user_id',
        timestamps: false,
      })

      Company.belongsTo(models.CompanyType, {
        foreignKey: 'company_type_id',
      })
    }
  }
  Company.validate = function (req) {
    const schema = Joi.object({
      company_type_id: Joi.number().required(),
      name: Joi.string().required(),
      status: Joi.number()

    });
    return schema.validate(req.body);
  };
  Company.init(
    {
      company_type_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      slug: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      logo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: { type: DataTypes.BOOLEAN, defaultValue: true },
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER,
      deleted_by: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Company',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: "companies",
    }
  )
  return Company
}
