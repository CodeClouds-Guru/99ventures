'use strict';
const { Model } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
const Joi = require('joi');
const { response } = require('express');
module.exports = (sequelize, DataTypes) => {
  class PromoCode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PromoCode.init(
    {
      code: DataTypes.STRING,
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      max_uses: DataTypes.TINYINT,
      cash: DataTypes.FLOAT,
      point: DataTypes.TINYINT,
      used: DataTypes.TINYINT,
      note: DataTypes.TEXT,
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      deleted_at: 'TIMESTAMP',
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
      status: DataTypes.ENUM('active', 'expired'),
      company_portal_id: DataTypes.TINYINT,
    },
    {
      sequelize,
      modelName: 'PromoCode',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'promo_codes',
    }
  );
  PromoCode.validate = function (req) {
    const schema = Joi.object({
      code: Joi.string()
        .regex(/^[a-zA-Z0-9]*$/)
        .required()
        .max(12)
        .label('Code'),
      name: Joi.string().required().label('name'),
      max_uses: Joi.required().label('Max Uses'),
      description: Joi.optional().label('Description'),
      cash: Joi.optional().label('Cash'),
      point: Joi.optional().label('Point'),
      note: Joi.optional().label('Note'),
      company_portal_id: Joi.number().optional().label('Company Portal'),
      type: Joi.string().optional().label('Type'),
    });
    return schema.validate(req.body);
  };

  PromoCode.fields = {
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
    code: {
      field_name: 'code',
      db_name: 'code',
      type: 'text',
      placeholder: 'Code',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    name: {
      field_name: 'name',
      db_name: 'name',
      type: 'text',
      placeholder: 'Name',
      listing: false,
      show_in_form: true,
      sort: false,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    description: {
      field_name: 'description',
      db_name: 'description',
      type: 'text',
      placeholder: 'Description',
      listing: false,
      show_in_form: true,
      sort: false,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    created_at: {
      field_name: 'created_at',
      db_name: 'created_at',
      type: 'text',
      placeholder: 'Created',
      listing: true,
      show_in_form: false,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    used: {
      field_name: 'used',
      db_name: 'used',
      type: 'text',
      placeholder: 'Uses',
      listing: false,
      show_in_form: false,
      sort: false,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    max_uses: {
      field_name: 'max_uses',
      db_name: 'max_uses',
      type: 'text',
      placeholder: 'Uses',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    cash: {
      field_name: 'cash',
      db_name: 'cash',
      type: 'text',
      placeholder: 'Amount',
      listing: true,
      show_in_form: true,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: true,
    },
    point: {
      field_name: 'point',
      db_name: 'point',
      type: 'text',
      placeholder: 'Point',
      listing: false,
      show_in_form: true,
      sort: false,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    note: {
      field_name: 'note',
      db_name: 'note',
      type: 'text',
      placeholder: 'Note',
      listing: false,
      show_in_form: true,
      sort: false,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
  };
  sequelizePaginate.paginate(PromoCode);
  PromoCode.redeemPromoValidation = async (data) => {
    const { MemberBalance, MemberNotification } = require('../models/index');
    let resp = { resp_status: true, resp_message: '' };
    let promo_code_details = await PromoCode.findOne({
      where: {
        slug: { [Op.like]: data.promo_code },
        company_portal_id: data.company_portal_id,
      },
    });
    console.log('promo_code', promo_code_details);
    if (promo_code_details) {
      if (promo_code_details.used == promo_code_details.max_uses) {
        resp.resp_status = false;
        resp.resp_message = 'Promo Code expired';
      } else {
        let checkIfAlreadyUsed = await db.sequelize.query(
          'SELECT * FROM member_promo_codes WHERE member_id = ? AND promo_code_id = ?',
          {
            replacements: [data.member_id, promo_code_details.id],
            type: QueryTypes.SELECT,
          }
        );
        console.log('checkIfAlreadyUsed', checkIfAlreadyUsed);
        if (checkIfAlreadyUsed.length > 0) {
          resp.resp_status = false;
          resp.resp_message = 'Promo Code already used';
        }
      }
    } else {
      resp.resp_status = false;
      resp.resp_message = 'Promo Code does not exist!';
    }
    return resp;
  };
  return PromoCode;
};
