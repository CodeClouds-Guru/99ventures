'use strict';
const { Model } = require('sequelize');
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const moment = require('moment');
module.exports = (sequelize, DataTypes) => {
  class MemberActivityLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MemberActivityLog.init(
    {
      member_id: DataTypes.BIGINT,
      action: DataTypes.STRING,
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      deleted_at: 'TIMESTAMP',
    },
    {
      sequelize,
      modelName: 'MemberActivityLog',
      timestamps: true,
      paranoid: false,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'member_activity_logs',
      hooks: {
        beforeCreate: async (member_activity_logs, options) => {
          let check_activity = await MemberActivityLog.destroy({
            where: {
              created_at: {
                [Op.like]:
                  moment(member_activity_logs.created_at).format('YYYY-MM-DD') +
                  '%',
              },
            },
          });
        },
      },
    }
  );
  MemberActivityLog.addMemberActivity = async (data) => {
    let transaction = await MemberActivityLog.create({
      member_id: data.member_id,
      action: data.action,
      created_by: data.member_id,
    });
  };
  return MemberActivityLog;
};
