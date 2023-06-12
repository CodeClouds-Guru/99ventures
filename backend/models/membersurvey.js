'use strict';
const {
  Model
} = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
const Joi = require('joi')

module.exports = (sequelize, DataTypes) => {
  class MemberSurvey extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MemberSurvey.belongsTo(models.Survey, {
        foreignKey: 'survey_number'
      })
    }
  }
  MemberSurvey.init({
    survey_number: DataTypes.STRING,
    survey_provider_id: DataTypes.BIGINT,
    original_json: DataTypes.JSON,
    completed_on: 'TIMESTAMP'
  }, {
    sequelize,
    modelName: 'MemberSurvey',
    timestamps: false,
    paranoid: false,
    tableName: 'member_surveys'
  });
  MemberSurvey.fields = {
    id: {
      field_name: 'id',
      db_name: 'id',
      type: 'text',
      placeholder: 'Id',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    survey_number: {
      field_name: 'survey_number',
      db_name: 'survey_number',
      type: 'text',
      placeholder: 'survey_number',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    survey_provider_id: {
      field_name: 'survey_provider_id',
      db_name: 'survey_provider_id',
      type: 'text',
      placeholder: 'survey_provider_id',
      listing: false,
      show_in_form: true,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    original_json: {
      field_name: 'original_json',
      db_name: 'original_json',
      type: 'switch',
      placeholder: 'original_json',
      listing: false,
      show_in_form: true,
      sort: true,
      required: false,
      value: false,
      width: '50',
      searchable: false,
    },
    completed_on: {
      field_name: 'completed_on',
      db_name: 'completed_on',
      type: 'text',
      placeholder: 'completed_on',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    }
  };
  sequelizePaginate.paginate(MemberSurvey);
  return MemberSurvey;
};