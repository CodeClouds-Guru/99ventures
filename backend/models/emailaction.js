'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmailAction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      EmailAction.belongsToMany(models.EmailTemplate, {
        through: 'email_action_email_template',
        foreignKey: 'email_action_id',
        otherKey: 'email_template_id',
        timestamps: false,
      })
    }
  }
  EmailAction.init({
    action: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'EmailAction',
    timestamps: false,
    paranoid: false,
    tableName: 'email_actions',
  });
  return EmailAction;
};