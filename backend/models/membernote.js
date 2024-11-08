'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MemberNote extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MemberNote.belongsTo(models.Member, {
        foreignKey: "member_id",
        // as: "username",
      });
      MemberNote.belongsTo(models.User, {
        foreignKey: "user_id",
        // as: "username",
      });
    }
  }
  MemberNote.init({
    user_id: DataTypes.BIGINT,
    member_id: DataTypes.BIGINT,
    previous_status: DataTypes.STRING,
    current_status: DataTypes.STRING,
    note: DataTypes.TEXT,
    created_at: 'TIMESTAMP',
    updated_at: 'TIMESTAMP',
    deleted_at: 'TIMESTAMP'
  }, {
    sequelize,
    modelName: 'MemberNote',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at', // alias createdAt as created_date
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    tableName: 'member_notes',
  });
  return MemberNote;
};