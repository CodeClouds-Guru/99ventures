"use strict";
const { Model } = require("sequelize");
const sequelizePaginate = require("sequelize-paginate");
const Joi = require('joi')
module.exports = (sequelize, DataTypes) => {
  class CampaignMember extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CampaignMember.belongsTo(models.Member, {
        foreignKey: "member_id",
        otherKey: 'campaign_id',
      });
      
    }
  }
  CampaignMember.init(
    {
      member_id: DataTypes.BIGINT,
      campaign_id: DataTypes.BIGINT,
      track_id: DataTypes.BIGINT,
      is_condition_met: DataTypes.TINYINT,
      is_postback_triggered: DataTypes.TINYINT,
      is_reversed: DataTypes.TINYINT,
    },
    {
      sequelize,
      modelName: "CampaignMember",
      timestamps: false,
      paranoid: false,
      // createdAt: "created_at", // alias createdAt as
      // updatedAt: "updated_at",
      // deletedAt: "deleted_at",
      tableName: "campaign_member",
    }
  );
 //validation function
  CampaignMember.fields = {
    member_id: {
      field_name: "member_id",
      db_name: "member_id",
      type: "text",
      placeholder: "Member Id",
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: "",
      width: "50",
      searchable: false,
    },
    campaign_id: {
      field_name: "campaign_id",
      db_name: "campaign_id",
      type: "text",
      placeholder: "Campaign_id",
      listing: true,
      show_in_form: false,
      sort: false,
      required: false,
      value: "",
      width: "50",
      searchable: false,
    },
    track_id: {
      field_name: "track_id",
      db_name: "track_id",
      type: "text",
      placeholder: "Track Id",
      listing: true,
      show_in_form: false,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: true,
    },
    is_condition_met: {
      field_name: "is_condition_met",
      db_name: "is_condition_met",
      type: "text",
      placeholder: "Condition Met",
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: true,
    },
    is_postback_triggered: {
      field_name: "is_postback_triggered",
      db_name: "is_postback_triggered",
      type: "text",
      placeholder: "Postback Trigger",
      listing: true,
      show_in_form: true,
      sort: true,
      required: false,
      value: "",
      width: "50",
      searchable: true,
    },
    is_reversed: {
      field_name: "is_reversed",
      db_name: "is_reversed",
      type: "text",
      placeholder: "Reversed",
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: true,
    },
  };
  sequelizePaginate.paginate(CampaignMember);
  return CampaignMember;
};
