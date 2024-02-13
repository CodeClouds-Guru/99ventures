'use strict';
const {
	Op,
	Model,
	QueryTypes
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
		url: DataTypes.TEXT,
		/*{
			type: DataTypes.STRING,
			// get(param, context) {
			//   console.log(this.query)
			//   console.log('laddu', context, param);
			// },
		},*/
		country_id:  DataTypes.BIGINT,
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
			attributes: ['id', 'survey_provider_id', 'loi', 'cpi', 'survey_number', 'created_at', 'name' /*, [sequelize.json('original_json.LanguageId'), 'alias']*/],
			distinct: true,
			where: {
				survey_provider_id: params.provider_id,
				...params.clause
			},
			include: {
				model: SurveyQualification,
				attributes: ['id', 'survey_question_id'],
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

	//For Lucid Provider
	Survey.getAndCountLucidSurveys = async(params) => {
		var rawSql = `
          SELECT
            s.survey_number,
            s.cpi,
            s.loi,
            s.name,
            COUNT(sq.survey_id) AS qual_count,
            sq.survey_id
          FROM
              survey_qualifications AS sq
          JOIN survey_answer_precode_survey_qualifications AS ap
          ON (sq.id = ap.survey_qualification_id)
          JOIN surveys as s ON (s.id = sq.survey_id)
          WHERE
              sq.survey_question_id IN(:survey_question_ids) AND sq.deleted_at IS NULL 
              AND ap.survey_answer_precode_id IN(:answer_precode_ids)
              AND s.deleted_at IS NULL AND s.survey_provider_id = 1
              AND s.status = :status
              AND s.country_id = :country_id
              AND s.survey_number NOT IN (
                SELECT survey_number FROM member_surveys AS ms JOIN member_transactions AS mt 
				ON (ms.member_transaction_id = mt.id) 
				WHERE mt.member_id = :member_id
              )
			  AND s.survey_number NOT IN (
				SELECT survey_number FROM survey_attempts WHERE member_id = :member_id AND survey_provider_id = 1
			  )
          GROUP BY
              sq.survey_id
          HAVING
              qual_count =(
              SELECT
                  COUNT(survey_id)
              FROM
                survey_qualifications
              WHERE
                survey_qualifications.survey_id = sq.survey_id AND 
                survey_qualifications.survey_question_id IN(:survey_question_ids) AND 
                survey_qualifications.deleted_at IS NULL
          ) ORDER BY s.${params.orderBy} ${params.order}`;

		const allSurveys = await sequelize.query(`${rawSql} LIMIT ${params.offset}, ${params.limit}`, {
            type: QueryTypes.SELECT, 
            replacements: {
				member_id: params.member_id,
				country_id: params.country_id,
				status: params.status,
				survey_question_ids: params.survey_question_ids,
				answer_precode_ids: params.answer_precode_ids
            }
		});
		const countSurveys = await sequelize.query(rawSql, {
            type: QueryTypes.SELECT, 
            replacements: {
				member_id: params.member_id,
				country_id: params.country_id,
				status: params.status,
				survey_question_ids: params.survey_question_ids,
				answer_precode_ids: params.answer_precode_ids
            }
		});
		return {
			count_survey: countSurveys.length,
			survey_rows: allSurveys
		};
	}

	// Check a particular Survey Attempted or Not
	Survey.checkMemberSurvey =  async(username, surveyNumber, surveyProviderId) => {
		const sqlQuery = `SELECT survey_number FROM member_surveys AS ms JOIN member_transactions AS mt ON 
		(ms.member_transaction_id = mt.id) JOIN members AS m ON (m.id = mt.member_id) WHERE m.username = :username AND ms.survey_number = :survey_number AND ms.survey_provider_id = :survey_provider_id`;
		const memberSurveys = await sequelize.query(sqlQuery, {
			type: QueryTypes.SELECT,
			replacements: { 
				username,
				survey_number: surveyNumber,
				survey_provider_id: surveyProviderId
			},
		});

		return memberSurveys;
	}

	Survey.checkMemberSurveyByMemberId = async(memberId, surveyNumber, providerId)=> {
		const sqlQuery = `SELECT COUNT(survey_number) AS total_attempted FROM member_surveys AS ms JOIN member_transactions AS mt ON 
		(ms.member_transaction_id = mt.id) WHERE mt.member_id = :memberId AND ms.survey_number = :survey_number AND ms.survey_provider_id = :survey_provider_id`;
		const result = await sequelize.query(sqlQuery, {
			type: QueryTypes.SELECT,
			replacements: { 
				memberId,
				survey_number: surveyNumber,
				survey_provider_id: providerId
			},
		});
		return result.length ? result[0].total_attempted : 0;
	}

	// Check a particular Survey Attempted or Not From survey_attempt table
	Survey.surveyAttemptedByUser = async(membeId, surveyNumber, surveyProviderId) => {
		const sqlQuery = `SELECT id FROM survey_attempts WHERE survey_provider_id = :survey_provider_id AND member_id = :member_id AND survey_number = :survey_number;`;
		const result = await sequelize.query(sqlQuery, {
			type: QueryTypes.SELECT,
			replacements: { 
				member_id: membeId,
				survey_number: surveyNumber,
				survey_provider_id: surveyProviderId
			}
		});
		return result;
	}

	// Check Survey Attempted or Not
	Survey.checkSurveyAttemption =  async(username, surveyProviderId) => {
		const sqlQuery = `SELECT survey_number FROM member_surveys AS ms JOIN member_transactions AS mt ON 
		(ms.member_transaction_id = mt.id) JOIN members AS m ON (m.id = mt.member_id) WHERE m.username = :username AND ms.survey_provider_id = :survey_provider_id`;
		const memberSurveys = await sequelize.query(sqlQuery, {
			type: QueryTypes.SELECT,
			replacements: { 
				username,
				survey_provider_id: surveyProviderId
			},
		});

		return memberSurveys;
	}


	return Survey;
};