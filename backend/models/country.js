'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Country extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Country.init({
    iso: DataTypes.STRING,
    name: DataTypes.STRING,
    nicename: DataTypes.STRING,
    iso3: DataTypes.STRING,
    numcode: DataTypes.TINYINT,
    phonecode: DataTypes.TINYINT
  }, {
    sequelize,
    modelName: 'Country',
    timestamps: true,
    paranoid: true,
    createdAt: "created_at", // alias createdAt as created_date
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    tableName: "countries",
  });
  return Country;
};