'use strict';
const { Model } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
const Joi = require('joi');
const FileHelper = require('../helpers/fileHelper');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(models.Company, {
        through: 'company_user',
        foreignKey: 'user_id',
        otherKey: 'company_id',
      });
      User.belongsToMany(models.Group, {
        through: 'company_user',
        foreignKey: 'user_id',
        otherKey: 'group_id',
      });
      User.belongsToMany(models.Widget, {
        through: 'user_widget',
        foreignKey: 'user_id',
        otherKey: 'widget_id',
        timestamps: false,
      });
    }
  }
  User.validate = function (req) {
    const schema = Joi.object({
      first_name: Joi.string().required().label('First Name'),
      last_name: Joi.string().required().label('Last Name'),
      alias_name: Joi.string().max(250).required().label('Alias'),
      email: Joi.string().email().required().label('Email'),
      username: Joi.string().min(3).max(30).required().label('Username'),
      password: Joi.string().allow('').optional(),
      phone_no: Joi.string().allow('').optional().label('Phone No'),
      groups: Joi.array().min(1),
    });
    return schema.validate(req.body);
  };

  User.init(
    {
      first_name: { type: DataTypes.STRING },
      last_name: DataTypes.STRING,
      username: DataTypes.STRING,
      alias_name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: {
          args: true,
          msg: 'Email address already in use!',
        },
      },
      avatar: {
        type: DataTypes.STRING,
        get() {
          let rawValue = this.getDataValue('avatar');
          const publicURL =
            process.env.CLIENT_API_PUBLIC_URL || 'http://127.0.0.1:4000';
          if (rawValue) {
            rawValue = process.env.S3_BUCKET_OBJECT_URL + rawValue;
          }
          return rawValue ? rawValue : `${publicURL}/images/demo-user.png`;
        },
      },
      password: DataTypes.STRING,
      phone_no: DataTypes.STRING,
      status: DataTypes.TINYINT,
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: 'User',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'users',
    }
  );
  User.extra_fields = ['groups', 'Groups->Roles.name'];
  User.fields = {
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
    first_name: {
      field_name: 'first_name',
      db_name: 'first_name',
      type: 'text',
      placeholder: 'First Name',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    last_name: {
      field_name: 'last_name',
      db_name: 'last_name',
      type: 'text',
      placeholder: 'Last Name',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    email: {
      field_name: 'email',
      db_name: 'email',
      type: 'text',
      placeholder: 'Email',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    '$Groups->Roles.name$': {
      field_name: 'Groups->Roles.name',
      db_name: 'Groups->Roles.name',
      type: 'multi-select',
      placeholder: 'Roles',
      listing: true,
      show_in_form: false,
      sort: false,
      required: false,
      value: '',
      width: '50',
      searchable: true,
    },
    username: {
      field_name: 'username',
      db_name: 'username',
      type: 'text',
      placeholder: 'Username',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    alias_name: {
      field_name: 'alias_name',
      db_name: 'alias_name',
      type: 'text',
      placeholder: 'Alias',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    password: {
      field_name: 'password',
      db_name: 'password',
      type: 'password',
      placeholder: 'Password',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    phone_no: {
      field_name: 'phone_no',
      db_name: 'phone_no',
      type: 'number',
      placeholder: 'Phone No',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
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
    groups: {
      field_name: 'groups',
      db_name: 'groups',
      type: 'multi-select',
      placeholder: 'Groups',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
      options: [],
    },
  };

  sequelizePaginate.paginate(User);
  return User;
};

// Select Field Example
/*
select_field: {
  field_name: 'select_field',
  db_name: 'select_field',
  type: 'select',
  options:[
    {
      key:'OptionKey1',
      value:'Option Value1',
      label:'Option Label'
    },
    {
      key:'OptionKey2',
      value:'Option Value2',
      label:'Option Label2'
    }
  ],
  placeholder: 'Select Field',
  listing: false,
  show_in_form: true,
  sort: true,
  required: true,
  value: '',
  width: '50',
  searchable: true,
},
*/
