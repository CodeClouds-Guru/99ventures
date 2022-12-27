'use strict';
const {
  Model
} = require('sequelize');
const sequelizePaginate = require('sequelize-paginate')
module.exports = (sequelize, DataTypes) => {
  class MemberReferral extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MemberReferral.belongsTo(models.Member, {
        foreignKey: 'referral_id',
      })
    }
  }
  MemberReferral.init({
    member_id: DataTypes.BIGINT,
    referral_id: DataTypes.BIGINT,
    geo_location: DataTypes.STRING,
    ip: DataTypes.STRING,
    join_date: "TIMESTAMP",
    activity_date: "TIMESTAMP",
    amount: DataTypes.DECIMAL(10, 2),
    created_by: DataTypes.BIGINT,
    updated_by: DataTypes.BIGINT,
    deleted_by: DataTypes.BIGINT,
    created_at: "TIMESTAMP",
    updated_at: "TIMESTAMP",
    deleted_at: "TIMESTAMP",
  }, {
    sequelize,
    modelName: 'MemberReferral',
    timestamps: true,
    paranoid: true,
    createdAt: "created_at", // alias createdAt as created_date
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    tableName: "member_referrals",
  });
  MemberReferral.fields = {
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
      placeholder: 'Member Id',
      listing: false,
      show_in_form: false,
      sort: false,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    referral_id: {
      field_name: 'referral_id',
      db_name: 'referral_id',
      type: 'text',
      placeholder: 'Referral Id',
      listing: false,
      show_in_form: false,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    referral_email: {
      field_name: 'referral_email',
      db_name: 'referral_email',
      type: 'text',
      placeholder: 'Referral Email',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
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
    join_date: {
      field_name: 'join_date',
      db_name: 'join_date',
      type: 'text',
      placeholder: 'Join Date',
      listing: true,
      show_in_form: true,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: true,
    },
    activity_date: {
      field_name: 'activity_date',
      db_name: 'activity_date',
      type: 'text',
      placeholder: 'Activity Date',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    amount: {
      field_name: 'amount',
      db_name: 'amount',
      type: 'text',
      placeholder: 'Cash',
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
      placeholder: 'Created At',
      listing: true,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: true,
    },
  }
  sequelizePaginate.paginate(MemberReferral)
  return MemberReferral;
};