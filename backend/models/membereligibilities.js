'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MemberEligibilities extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MemberEligibilities.belongsTo(models.SurveyQuestion, {
        foreignKey: 'survey_question_id'
      })
    }
  }
  MemberEligibilities.init(
    {
      member_id: DataTypes.BIGINT,
      survey_question_id: DataTypes.BIGINT,
      precode_id: DataTypes.BIGINT,
      text: DataTypes.TEXT,
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      deleted_at: 'TIMESTAMP',
    },
    {
      sequelize,
      modelName: 'MemberEligibilities',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'member_eligibilities',
    }
  );
  return MemberEligibilities;
};
