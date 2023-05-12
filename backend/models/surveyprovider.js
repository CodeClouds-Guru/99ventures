'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SurveyProvider extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SurveyProvider.init({
    name: DataTypes.STRING,
    logo: DataTypes.STRING,
    status: DataTypes.STRING,
    currency_percent: DataTypes.FLOAT,
    created_by: DataTypes.BIGINT,
    updated_by: DataTypes.BIGINT,
    deleted_by: DataTypes.BIGINT,
    created_at: 'TIMESTAMP',
    updated_at: 'TIMESTAMP',
    deleted_at: 'TIMESTAMP',
    white_logo: {
      type: DataTypes.VIRTUAL,
      get() {
        let logo = this.logo || null;
        if (logo) {
          let url = logo.substring(0, logo.lastIndexOf("/") + 1);
          logo = logo.replace(url, 'white');
          return url + logo;
        } else {
          return '';
        }
      },
      set(value) {
        throw new Error('Do not try to set the `white_logo` value!');
      }
    },
  }, {
    sequelize,
    modelName: 'SurveyProvider',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at', // alias createdAt as created_date
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    tableName: 'survey_providers',
  });
  return SurveyProvider;
};