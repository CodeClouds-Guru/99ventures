'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Invitation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Invitation.init({
    user_id: DataTypes.BIGINT,
    email: DataTypes.STRING,
    token: DataTypes.STRING,
    expired_at: DataTypes.TIME,
    email_sent_at: DataTypes.TIME,
    accepted_on: DataTypes.TIME,
    created_by: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'Invitation',
    timestamps: true,
    createdAt: 'created_at', // alias createdAt as created_date
    updatedAt: 'updated_at',
  });
  return Invitation;
};