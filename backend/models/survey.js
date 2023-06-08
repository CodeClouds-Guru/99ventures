'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Survey extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Survey.belongsTo(models.SurveyProvider, {
        foreignKey: 'survey_provider_id',
      })
      Survey.belongsToMany(models.MemberTransaction, {
        through: 'member_surveys',
        timestamps: false,
        foreignKey: 'survey_number',
        otherKey: 'member_transaction_id',
      }),
      Survey.hasMany(models.SurveyQualification, {
        foreignKey: 'survey_id',
      })
      Survey.hasMany(models.MemberSurvey, {
        foreignKey: 'survey_number',
      })
    }
  }
  Survey.init({
    survey_provider_id: DataTypes.BIGINT,
    loi: DataTypes.FLOAT,
    cpi: DataTypes.FLOAT,
    name: DataTypes.STRING,
    survey_number: DataTypes.STRING,
    status: DataTypes.STRING,
    url:{ 
      type: DataTypes.STRING,
      // get(param, context) {
      //   console.log(this.query)
      //   console.log('laddu', context, param);
      // },
    },
    original_json: DataTypes.JSON,
    created_at: 'TIMESTAMP',
    updated_at: 'TIMESTAMP',
    deleted_at: 'TIMESTAMP'
  }, {
    sequelize,
    modelName: 'Survey',
    tableName: 'surveys',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at', // alias createdAt as created_date
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return Survey;
};