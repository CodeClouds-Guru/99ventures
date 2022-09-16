'use strict';
const {
  Model
} = require('sequelize');
const sequelizePaginate = require('sequelize-paginate')
const Joi = require('joi')
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
    expired_at: 'TIMESTAMP',
    email_sent_at: 'TIMESTAMP',
    accepted_on: 'TIMESTAMP',
    created_by: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'Invitation',
    timestamps: true,
    createdAt: 'created_at', // alias createdAt as created_date
    updatedAt: 'updated_at',
    tableName: "invitations",
  });
  Invitation.validate = function (req) {
    const schema = Joi.object({
      email: Joi.string().email().required(),
    })
    return schema.validate(req.body)
  }
  return Invitation;
};