'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CompanyUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CompanyUser.init({
    company_id: DataTypes.BIGINT,
    user_id: DataTypes.BIGINT,
    group_id: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'CompanyUser',
    timestamps: false,
    paranoid: false,
    tableName: 'company_user'
  });
  return CompanyUser;
};