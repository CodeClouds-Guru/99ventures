'use strict';
const {
	Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class SurveyAttempt extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			
		}
	}
	SurveyAttempt.init({
		survey_provider_id: DataTypes.BIGINT,
		member_id: DataTypes.FLOAT,
		survey_number: DataTypes.STRING,
		created_at: 'TIMESTAMP',
		updated_at: 'TIMESTAMP'
	}, {
		sequelize,
		modelName: 'SurveyAttempt',
		tableName: 'survey_attempts',
		timestamps: true,
		paranoid: false,
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	});


	return SurveyAttempt;
};