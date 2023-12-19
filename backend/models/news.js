'use strict';
const { Model } = require('sequelize');
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
  News.init(
    {
      subject: DataTypes.TEXT,
      slug: DataTypes.STRING,
      content: DataTypes.TEXT,
      content_json: DataTypes.JSON,
      additional_header: DataTypes.TEXT,
      status: DataTypes.ENUM('pending, draft, published, archived'),
      image: DataTypes.TEXT,
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
  return News;
};
