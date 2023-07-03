'use strict';
const {
	Op,
	Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class Survey extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			Survey.belongsTo(models.SurveyProvider, {
				foreignKey: 'survey_provider_id',
			})
			Survey.belongsToMany(models.MemberTransaction, {
				through: 'member_surveys',
				timestamps: false,
				foreignKey: 'survey_number',
				otherKey: 'member_transaction_id',
			}),
				Survey.hasMany(models.SurveyQualification, {
					foreignKey: 'survey_id',
				})
			Survey.belongsTo(models.MemberSurvey, {
				foreignKey: 'survey_number',
			})
		}
	}
	Survey.init({
		survey_provider_id: DataTypes.BIGINT,
		loi: DataTypes.FLOAT,
		cpi: DataTypes.FLOAT,
		name: DataTypes.STRING,
		survey_number: DataTypes.STRING,
		status: DataTypes.STRING,
		url: {
			type: DataTypes.STRING,
			// get(param, context) {
			//   console.log(this.query)
			//   console.log('laddu', context, param);
			// },
		},
		original_json: DataTypes.JSON,
		created_at: 'TIMESTAMP',
		updated_at: 'TIMESTAMP',
		deleted_at: 'TIMESTAMP'
	}, {
		sequelize,
		modelName: 'Survey',
		tableName: 'surveys',
		timestamps: true,
		paranoid: true,
		createdAt: 'created_at', // alias createdAt as created_date
		updatedAt: 'updated_at',
		deletedAt: 'deleted_at',
	});

	// Get Matching surveys
	Survey.getSurveysAndCount = async (params) => {
		const { 
			Member, 
			SurveyQuestion,
			SurveyQualification,
			SurveyAnswerPrecodes
		} = require('../models/index');

		const acceptedSurveys = await Member.acceptedSurveys(params.member_id, params.provider_id);
		if (acceptedSurveys.length) {
			const attemptedSurveysNumber = acceptedSurveys.map(r => r.survey_number);
			params.clause = {
				...params.clause,
				survey_number: {
					[Op.notIn]: attemptedSurveysNumber
				}
			}
		}
		const surveys = await Survey.findAndCountAll({
			attributes: ['id', 'survey_provider_id', 'loi', 'cpi', 'name', 'survey_number'],
			distinct: true,
			where: {
				survey_provider_id: params.provider_id,
				...params.clause
			},
			include: {
				model: SurveyQualification,
				attributes: ['id', 'survey_id', 'survey_question_id'],
				required: true,
				include: {
					model: SurveyAnswerPrecodes,
					attributes: ['id', 'option', 'precode'],
					where: {
						id: params.matching_answer_ids
					},
					required: true,
					include: [
						{
							model: SurveyQuestion,
							attributes: ['id'],
							where: {
								id: params.matching_question_ids
							}
						}
					],
				}
			},
			order: [[sequelize.literal(params.order_by), params.order]],
			limit: params.per_page,
			offset: (params.pageno - 1) * params.per_page,
		});

		return surveys;
	}

	return Survey;
};