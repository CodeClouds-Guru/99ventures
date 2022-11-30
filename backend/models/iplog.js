'use strict';
const {
  Model
} = require('sequelize');
const sequelizePaginate = require('sequelize-paginate')
const Joi = require('joi')
module.exports = (sequelize, DataTypes) => {
  class IpLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  IpLog.init({
    member_id: DataTypes.BIGINT,
    geo_location: DataTypes.STRING,
    latitude: DataTypes.STRING,
    longitude: DataTypes.STRING,
    ip: DataTypes.STRING,
    isp: DataTypes.STRING,
    browser: DataTypes.STRING,
    browser_language: DataTypes.STRING,
    created_by: DataTypes.BIGINT,
    updated_by: DataTypes.BIGINT,
    deleted_by: DataTypes.BIGINT,
    created_at: "TIMESTAMP",
    updated_at: "TIMESTAMP",
    deleted_at: "TIMESTAMP",
  }, {
    sequelize,
    modelName: 'IpLog',
    timestamps: true,
    paranoid: true,
    createdAt: "created_at", // alias createdAt as created_date
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    tableName: "ip_logs",
  });

  //fields
  IpLog.fields = {
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
    member_id: {
      field_name: 'member_id',
      db_name: 'member_id',
      type: 'text',
      placeholder: 'Member ID',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    geo_location: {
      field_name: 'geo_location',
      db_name: 'geo_location',
      type: 'text',
      placeholder: 'Geo Location',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    latitude: {
      field_name: 'latitude',
      db_name: 'latitude',
      type: 'text',
      placeholder: 'Latitude',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    longitude: {
      field_name: 'longitude',
      db_name: 'longitude',
      type: 'text',
      placeholder: 'Longitude',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    ip: {
      field_name: 'ip',
      db_name: 'ip',
      type: 'text',
      placeholder: 'IP',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    isp: {
      field_name: 'isp',
      db_name: 'isp',
      type: 'text',
      placeholder: 'ISP',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    browser: {
      field_name: 'browser',
      db_name: 'browser',
      type: 'text',
      placeholder: 'Browser',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    browser_language: {
      field_name: 'browser_language',
      db_name: 'browser_language',
      type: 'text',
      placeholder: 'Browser Language',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    created_at: {
      field_name: 'created_at',
      db_name: 'created_at',
      type: 'text',
      placeholder: 'Created at',
      listing: true,
      show_in_form: false,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    updated_at: {
      field_name: 'updated_at',
      db_name: 'updated_at',
      type: 'text',
      placeholder: 'Updated at',
      listing: true,
      show_in_form: false,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    }
  }
  sequelizePaginate.paginate(IpLog)
  return IpLog;
};