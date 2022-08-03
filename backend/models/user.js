'use strict'
const { Model } = require('sequelize')
const sequelizePaginate = require('sequelize-paginate')
const Joi = require('joi')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(models.Company, {
        through: 'company_user',
        foreignKey: 'user_id',
        otherKey: 'company_id',
      })
    }
  }
  User.validate = function (req) {
    const schema = Joi.object({
      first_name: Joi.string().required().label('First Name'),
      last_name: Joi.string().required().label('Last Name'),
      email: Joi.string().email().required().label('Email'),
      username: Joi.string().alphanum().min(3).max(30).required().label('Username'),
      password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),
      phone_no: Joi.string().required().label('Phone No'),
    })
    return schema.validate(req.body)
  }

  User.init(
    {
      first_name: { type: DataTypes.STRING },
      last_name: DataTypes.STRING,
      username: DataTypes.STRING,
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
          const rawValue = this.getDataValue('avatar');
          const publicURL = process.env.CLIENT_API_PUBLIC_URL || 'http://127.0.0.1:4000'
          return rawValue ? rawValue : `${publicURL}/images/demo-user.png`;
        }
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
  )

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
      type: 'text',
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
  }

  sequelizePaginate.paginate(User)
  return User
}
