'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Member.hasMany(models.MemberNote, {
        foreignKey: 'member_id',
      })
    }
  }
  Member.init({
    company_portal_id: DataTypes.BIGINT,
    company_id: DataTypes.BIGINT,
    membership_tier_id: DataTypes.BIGINT,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    status: DataTypes.STRING,
    phone_no: DataTypes.STRING,
    country_code: DataTypes.STRING,
    dob: DataTypes.DATE,
    referer: DataTypes.STRING,
    password: DataTypes.STRING,
    last_active_on: 'TIMESTAMP',
    created_by: DataTypes.BIGINT,
    updated_by: DataTypes.BIGINT,
    deleted_by: DataTypes.BIGINT,
    created_at: 'TIMESTAMP',
    updated_at: 'TIMESTAMP',
    deleted_at: 'TIMESTAMP'
  }, {
    sequelize,
    modelName: 'Member',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at', // alias createdAt as created_date
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    tableName: 'members',
  });
  return Member;
};