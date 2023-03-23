'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmailAlert extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      EmailAlert.belongsToMany(models.Member, {
        as: 'MemberEmailAlerts',
        through: 'email_alert_member',
        foreignKey: 'email_alert_id',
        otherKey: 'member_id',
        timestamps: false,
      });
    }
  }
  EmailAlert.init(
    {
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'EmailAlert',
      timestamps: false,
      paranoid: false,
      tableName: 'email_alerts',
      createdAt: false,
      updatedAt: false,
    }
  );
  EmailAlert.getEmailAlertList = async (member_id = '') => {
    const { Member } = require('../models/index');
    let options = {};
    options.attributes = ['id', 'name'];
    if (member_id !== '') {
      options.include = {
        model: Member,
        as: 'MemberEmailAlerts',
        where: { id: member_id },
        required: false,
        attributes: ['id'],
      };
    }

    console.log(options);
    return await EmailAlert.findAll(options);
  };

  return EmailAlert;
};
