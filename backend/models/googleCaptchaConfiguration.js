'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class GoogleCaptchaConfiguration extends Model {
        static associate(models) {
        }
    }
    GoogleCaptchaConfiguration.init({
        company_portal_id: DataTypes.BIGINT,
        site_key: DataTypes.STRING,
        site_token: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'GoogleCaptchaConfiguration',
        timestamps: false,
        tableName: "google_captcha_configurations",
    });
    return GoogleCaptchaConfiguration;
};