'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MemberNotification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MemberNotification.init(
    {
      member_id: DataTypes.BIGINT,
      verbose: DataTypes.STRING,
      action: DataTypes.STRING,
      is_read: {
        type: DataTypes.ENUM(0, 1),
        get() {
          if (!isNaN(this.is_read)) {
            return parseInt(this.is_read, 10);
          }
          return this.is_read;
        },
      },
      read_on: 'TIMESTAMP',
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      deleted_at: 'TIMESTAMP',
      header_text: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.action.replaceAll('_', ' ').toUpperCase()
        },
        set(value) {
          throw new Error('Do not try to set `header` value!');
        }
      },
      logo: {
        type: DataTypes.VIRTUAL,
        get() {
          switch (this.action) {
            case 'survey_completed':
              return 'https://99-ventures-bucket.s3.us-east-2.amazonaws.com/CodeClouds/1/file-manager/images/notificationprizeicon.png';
            case 'achievement_complete':
              return 'https://99-ventures-bucket.s3.us-east-2.amazonaws.com/CodeClouds/1/file-manager/images/notificationbadgeicon.png';
            case 'message_received':
              return 'https://99-ventures-bucket.s3.us-east-2.amazonaws.com/CodeClouds/1/file-manager/images/notificationfileicon.png';
            default:
              return 'https://99-ventures-bucket.s3.us-east-2.amazonaws.com/CodeClouds/1/file-manager/images/notificationfileicon.png';
          }
        },
        set(value) {
          throw new Error('Do not try to set `logo` value!');
        }
      }
    },
    {
      sequelize,
      modelName: 'MemberNotification',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'member_notifications',
    }
  );
  return MemberNotification;
};
