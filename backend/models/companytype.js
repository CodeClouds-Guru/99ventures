'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class CompanyType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CompanyType.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'CompanyType',
      timestamps: false,
      tableName: 'company_types',
    }
  )
  return CompanyType
}
