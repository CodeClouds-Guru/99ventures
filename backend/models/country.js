'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Country extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Country.belongsToMany(models.PaymentMethod, {
        as: 'allowed_countries',
        through: 'allowed_country_payment_method',
        foreignKey: 'country_id',
        otherKey: 'payment_method_id',
        timestamps: false,
      });
    }
  }
  Country.init(
    {
      iso: DataTypes.STRING,
      name: DataTypes.STRING,
      nicename: DataTypes.STRING,
      iso3: DataTypes.STRING,
      numcode: DataTypes.TINYINT,
      phonecode: DataTypes.TINYINT,
      sago_language_id: DataTypes.STRING,
      language_code: DataTypes.STRING,
      language_name: DataTypes.STRING,
      lucid_language_id: DataTypes.INTEGER,
      lucid_language_code:DataTypes.STRING,
      toluna_culture_id: DataTypes.INTEGER,
      cint_country_code: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Country',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'countries',
    }
  );

  Country.getAllCountryList = async () => {
    let country_list = await Country.findAll({
      attributes: ['id', ['nicename', 'name'], 'phonecode'],
      order: [
        ['nicename', 'ASC']
      ]
    });
    return country_list;
  };
  return Country;
};
