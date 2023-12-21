'use strict';
const { Model } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
const Joi = require('joi');
module.exports = (sequelize, DataTypes) => {
  class News extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  News.validate = function (req) {
    const schema = Joi.object({
      subject: Joi.string().required().label('Subject'),
      slug: Joi.string().required().label('Slug'),
      content: Joi.optional().label('Content'),
      content_json: Joi.optional().label('Content JSON'),
      additional_header: Joi.optional().label('Addition Header'),
      status: Joi.string().required().label('Status'),
      image: Joi.optional().label('Image'),
      company_portal_id: Joi.optional().label('Company Portal Id'),
      published_at: Joi.optional().label('Published At'),
    });
    return schema.validate(req.body);
  };
  News.init(
    {
      subject: DataTypes.TEXT,
      slug: DataTypes.STRING,
      content: DataTypes.TEXT,
      content_json: DataTypes.JSON,
      additional_header: DataTypes.TEXT,
      status: DataTypes.ENUM('pending, draft, published, archived'),
      // image: DataTypes.TEXT,
      image: {
        type: DataTypes.TEXT,
        get() {
          let rawValue = this.getDataValue('image') || null;
          if (!rawValue || rawValue === '') {
            const publicURL =
              process.env.CLIENT_API_PUBLIC_URL || 'http://127.0.0.1:4000';
            rawValue = `${publicURL}/images/demo-user.png`;
          } else {
            let check_url = '';
            try {
              new URL(string);
              check_url = true;
            } catch (err) {
              check_url = false;
            }
            if (!check_url)
              rawValue = process.env.S3_BUCKET_OBJECT_URL + rawValue;
          }
          return rawValue;
        },
        set(value) {
          if (value == '' || value == null) this.setDataValue('image', null);
          else this.setDataValue('image', value);
        },
      },
      company_portal_id: DataTypes.TINYINT,
      published_at: 'TIMESTAMP',
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      deleted_at: 'TIMESTAMP',
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: 'News',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'news',
    }
  );

  News.fields = {
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
    subject: {
      field_name: 'subject',
      db_name: 'subject',
      type: 'text',
      placeholder: 'Subject',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    slug: {
      field_name: 'slug',
      db_name: 'slug',
      type: 'text',
      placeholder: 'Slug',
      listing: false,
      show_in_form: true,
      sort: false,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    content: {
      field_name: 'content',
      db_name: 'content',
      type: 'text',
      placeholder: 'content',
      listing: false,
      show_in_form: true,
      sort: false,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    additional_header: {
      field_name: 'additional_header',
      db_name: 'additional_header',
      type: 'text',
      placeholder: 'Additional Header',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    status: {
      field_name: 'status',
      db_name: 'status',
      type: 'select',
      placeholder: 'Status',
      listing: true,
      show_in_form: true,
      sort: false,
      required: true,
      value: '',
      width: '50',
      searchable: false,
      options: [
        { key: 'pending', value: 'Pending', label: 'Pending' },
        { key: 'draft', value: 'Draft', label: 'Draft' },
        { key: 'published', value: 'Published', label: 'Published' },
        { key: 'archived', value: 'Archived', label: 'Archived' },
      ],
    },
  };
  sequelizePaginate.paginate(News);
  return News;
};
