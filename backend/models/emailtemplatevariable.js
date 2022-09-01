'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmailTemplateVariable extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EmailTemplateVariable.init({
    name: DataTypes.STRING,
    code: DataTypes.STRING,
    module: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'EmailTemplateVariable',
    timestamps: false,
    paranoid: false,
    tableName: 'email_template_variables',
  });
  return EmailTemplateVariable;
};