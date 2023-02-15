'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SurveyAnswerPrecodes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SurveyAnswerPrecodes.init(
    {
      option: DataTypes.STRING,
      lucid_precode: DataTypes.STRING,
      purespectrum_precode: DataTypes.STRING,
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      deleted_at: 'TIMESTAMP',
    },
    {
      sequelize,
      modelName: 'SurveyAnswerPrecodes',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'survey_answer_precodes',
    }
  );
  return SurveyAnswerPrecodes;
};
