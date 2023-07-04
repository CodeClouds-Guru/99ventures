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
    options.attributes = ['id', 'name', 'slug'];
    if (member_id !== '') {
      options.include = {
        model: Member,
        as: 'MemberEmailAlerts',
        where: { id: member_id },
        required: false,
        attributes: ['id'],
      };
    }
    return await EmailAlert.findAll(options);
  };

  EmailAlert.saveEmailAlerts = async (member_id, email_alerts) => {
    // if (email_alerts) {
    const { sequelize } = require('../models/index');
    const queryInterface = sequelize.getQueryInterface();
    const db = require('../models/index');
    const { QueryTypes } = require('sequelize');
    let resp = true;
    try {
      //remove existing data
      let alert_del = await db.sequelize.query(
        `DELETE FROM email_alert_member WHERE member_id=?`,
        {
          replacements: [member_id],
          type: QueryTypes.DELETE,
        }
      );
      if (email_alerts) {
        if (
          email_alerts &&
          Array.isArray(email_alerts) &&
          email_alerts.length > 0
        ) {
          email_alerts = email_alerts.map((alert) => {
            return { email_alert_id: alert, member_id: member_id };
          });
          //bulck create member email alert
          await queryInterface.bulkInsert('email_alert_member', email_alerts);
        } else {
          await queryInterface.bulkInsert('email_alert_member', [
            {
              email_alert_id: email_alerts,
              member_id: member_id,
            },
          ]);
        }

        resp = true;
      }
    } catch (error) {
      console.error(error);
      resp = false;
    } finally {
      return resp;
    }
    // }
  };
  return EmailAlert;
};
