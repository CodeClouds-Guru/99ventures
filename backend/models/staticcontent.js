'use strict';
const {
    Model
} = require('sequelize');
const Joi = require('joi');

module.exports = (sequelize, DataTypes) => {
    class StaticContent extends Model {
        static associate(models) {
        }
    }
    StaticContent.init({
        name: DataTypes.STRING,
        company_portal_id: DataTypes.BIGINT,
        slug: DataTypes.STRING,
        content: DataTypes.TEXT,
        configuration: DataTypes.JSON,
        created_at: 'TIMESTAMP',
        updated_at: 'TIMESTAMP',
        deleted_at: 'TIMESTAMP'
    }, {
        sequelize,
        modelName: 'StaticContent',
        timestamps: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        tableName: 'static_contents',
    });
    StaticContent.validate = function (req) {
        const schema = Joi.object({
            content: Joi.string().required().label('Content'),
        });
        return schema.validate(req.body);
    };
    return StaticContent;
};