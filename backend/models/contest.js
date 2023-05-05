'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Contest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Contest.init({
    contest_name: DataTypes.STRING,
    description: DataTypes.TEXT,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    is_active: DataTypes.TINYINT,
    banner: DataTypes.STRING,
    no_of_participant: DataTypes.INTEGER,
    configuration_json: DataTypes.JSON,
    payment_type: DataTypes.STRING,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    created_by: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'Contest',
  });
  return Contest;
};