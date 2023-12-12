'use strict';
const { Model } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
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
      slug: DataTypes.STRING,
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
      code: Joi.string().required().max(12).label('Code'),
      slug: Joi.string().required().label('Slug'),
      max_uses: Joi.required().label('Max Uses'),
      cash: Joi.string().label('Cash'),
      point: Joi.string().label('Point'),
      note: Joi.string().optional().label('Note'),
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
      listing: true,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: true,
    },
    cash: {
      field_name: 'cash',
      db_name: 'cash m',
      type: 'text',
      placeholder: 'Amount',
      listing: true,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: true,
    },
  };
  sequelizePaginate.paginate(PromoCode);
  return PromoCode;
};
