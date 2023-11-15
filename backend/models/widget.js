'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Widget extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Widget.init(
    {
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      status: DataTypes.STRING,
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      deleted_at: 'TIMESTAMP',
    },
    {
      sequelize,
      modelName: 'Widget',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'widgets',
    }
  );
  /** To store user widget choices **/
  Widget.createUserWidgetOptions = async (data) => {
    const { sequelize } = require('./index');
    const queryInterface = sequelize.getQueryInterface();

    let user_id = data.user_id;
    let save_data = data.widget_ids.map((widget_id) => {
      return {
        user_id: user_id,
        widget_id: widget_id,
      };
    });
    //delete previous record
    await queryInterface.bulkDelete('user_widget', {
      user_id: user_id,
    });
    console.log('save_data', save_data);
    //update user widget table
    if (data.widget_ids.length > 0)
      await queryInterface.bulkInsert('user_widget', save_data);
    return true;
  };
  return Widget;
};
