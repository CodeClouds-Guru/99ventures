const {
	Member,
	Survey,
	SurveyAttempt,
	SurveyProvider,
	MemberEligibilities,
	CountrySurveyQuestion,
} = require('../../models');

const SchlesingerHelper = require('../../helpers/Schlesinger');
const { Op } = require('sequelize');

class SchlesingerController {
	constructor() {
		this.surveys = this.surveys.bind(this);
		this.generateEntryLink = this.generateEntryLink.bind(this);
		this.fetchSurveyGroups = this.fetchSurveyGroups.bind(this);
		this.insertSurveyGroupsIds = this.insertSurveyGroupsIds.bind(this);
		this.checkSurveyReservation = this.checkSurveyReservation.bind(this);
	}

	surveys = async (memberId, params, req) => {
		try {
			const member = await Member.findOne({
				attributes: ['username', 'country_id'],
				where: {
					id: memberId,
				},
			});

			if (!memberId || member === null) {
				res.json({
					staus: false,
					message: 'Member id not found!',
				});
				return;
			}

			const provider = await SurveyProvider.findOne({
				attributes: ['id', 'currency_percent'],
				where: {
					name: 'Schlesinger',
					status: 1,
				},
			});
			if (!provider || provider == null) {
				return {
					status: false,
					message: 'Survey Provider not found!',
				};
			}
			const pageNo = 'pageno' in params ? parseInt(params.pageno) : 1;
			const perPage = 'perpage' in params ? parseInt(params.perpage) : 12;
			const orderBy = 'orderby' in params ? params.orderby : 'created_at';
			const order = 'order' in params ? params.order : 'desc';

			/**
			 * check and get member's eligibility
			 */
			const eligibilities = await MemberEligibilities.getEligibilities(
				member.country_id,
				provider.id,
				memberId
			);

			if (eligibilities.length < 1) {
				return {
					status: false,
					message: 'Sorry! you are not eligible.',
				};
			}
			/** Query String Formation Start */
			const queryString = {
				uid: member.username,
			};
			const matchingQuestionIds = [];
			const matchingAnswerIds = [];
			eligibilities.forEach((eg) => {
				queryString['Q' + eg.survey_provider_question_id] = eg.option
					? eg.option
					: eg.open_ended_value;
				matchingQuestionIds.push(eg.survey_question_id);
				if (eg.survey_answer_precode_id !== null) {
					matchingAnswerIds.push(+eg.survey_answer_precode_id);
				}
			});
			const generateQueryString = new URLSearchParams(queryString).toString();
			/** End */

			if (matchingAnswerIds.length && matchingQuestionIds.length) {
				const surveys = await Survey.getSurveysAndCount({
					member_id: memberId,
					provider_id: provider.id,
					matching_answer_ids: matchingAnswerIds,
					matching_question_ids: matchingQuestionIds,
					order,
					pageno: pageNo,
					per_page: perPage,
					order_by: orderBy,
					clause: {
						status: 'live',
						country_id: member.country_id,
					},
				});
				if (!surveys.count) {
					return {
						status: false,
						message: 'No matching surveys!',
					};
				}
				var page_count = Math.ceil(surveys.count / perPage);
				var survey_list = [];

				if (surveys.rows && surveys.rows.length) {
					for (let survey of surveys.rows) {
						let link = `/schlesigner/entrylink?survey_number=${survey.survey_number}&${generateQueryString}`;
						let cpiValue = (+survey.cpi * +provider.currency_percent) / 100;
						let temp_survey = {
							survey_number: survey.survey_number,
							name: survey.name,
							cpi: cpiValue.toFixed(2),
							loi: survey.loi,
							link: link,
						};
						survey_list.push(temp_survey);
					}
				}

				return {
					status: true,
					message: 'Success',
					result: {
						surveys: survey_list,
						page_count: page_count,
					},
				};
			} else {
				return {
					status: false,
					message:
						'Sorry! no surveys have been matched now! Please try again later.',
				};
			}
		} catch (error) {
			console.error(error);
			return {
				status: false,
				message: 'Something went wrong!',
			};
		}
	};

	generateEntryLink = async (req, res) => {
		if (!req.session.member) {
			res.redirect('/login');
			return;
		}
		const queryString = req.query;
		const surveyNumber = queryString['survey_number'];
		var redirectURL = '';
		var returnObj = {};
		const schObj = new SchlesingerHelper();
		const surveyGroupIds = await this.fetchSurveyGroups(surveyNumber);

		try {			
			const data = await Survey.findOne({
				attributes: ['original_json'],
				where: {
					survey_number: surveyNumber,
				},
			});

			if (data && data.original_json) {
				// This block of code checks the Survey Group and Attempted by the member
				const recordCount = await SurveyAttempt.count({
					where: {
						member_id: req.session.member.id,
						survey_number: {
							[Op.in]: surveyGroupIds
						}
					}
				});
				if(recordCount != 0 ) {
					req.session.flash = { error: 'You have already attempted to this survey!' };
					res.redirect('back');
					return;
				}

				// This block of code checks the Survey Reservation
				const remaining = this.checkSurveyReservation(surveyNumber);
				if(!remaining) {
					req.session.flash = { error: 'Sorry! survey quota has already full!' };
					res.redirect('back');
					return;
				}

				const result = await schObj.fetchSellerAPI(
					'api/v2/survey/survey-quotas/' + surveyNumber
				);

				if (result.Result.Success === true && result.Result.TotalCount != 0) {
					const surveyQuota = result.SurveyQuotas.filter(
						(sv) => sv.TotalRemaining > 1
					);
					if (surveyQuota.length) {
						delete queryString['survey_number'];
						const params = Object.fromEntries(new URLSearchParams(queryString));
						const liveLink = data.original_json.LiveLink;
						const liveLinkArry = liveLink.split('?');
						const liveLinkParams = Object.fromEntries(
							new URLSearchParams(liveLinkArry[1])
						);
						params.pid = Date.now() + '-' + surveyNumber + '-' +req.session.member.id;
						delete liveLinkParams['zid']; // We dont have any value for zid
						const entryLink = liveLinkArry[0] + '?' + new URLSearchParams({ ...liveLinkParams, ...params }).toString();
						
						//-- Added log to track the entry links
						let infoLog = require('../../helpers/Logger')(`sago-entrylinks.log`);
						infoLog.info(`[${surveyNumber}]: ${entryLink}`);
						//-- End
						
						// res.send(entryLink)
						res.redirect(entryLink);
						//Do Not delete return
						return;	
					} else {
						this.updateSurvey(surveyNumber);
						redirectURL = '/survey-quota';
					}
				} else {
					this.updateSurvey(surveyNumber);
					redirectURL = '/survey-quota';
				}
			} else {
				redirectURL = '/survey-notavailable';
			}
			res.redirect(redirectURL);
		} 
		catch (error) {
			console.error(error);
			redirectURL = '/survey-notavailable';
			res.redirect(redirectURL);
		}
		finally {
			// insert survey groups
			await this.insertSurveyGroupsIds(surveyGroupIds, req.session.member.id);
		}				
	};

	updateSurvey = async (surveyNumber) => {
		await Survey.update(
			{
				status: 'draft',
				deleted_at: new Date(),
			},
			{
				where: {
					survey_number: surveyNumber,
				},
			}
		);
	};

	/**
	 * Survey Reservation Check
	 */
	checkSurveyReservation = async(surveyNumber) => {
		try {
			const lcObj = new SchlesingerHelper();
			const getData = await lcObj.fetchSellerAPI(
				'/api/v2/survey/survey-reservation/' + surveyNumber
			);			
			if (getData.Result.TotalCount != 0 && getData.TotalRemaining > 1) {
				return true;
			} else {
				return false;
			}
		}
		catch (error) {
			const logger = require('../../helpers/Logger')(
				`lucid-errror.log`
			);
			logger.error('[survey reservation error]');
			logger.error(error);
			return false;
		}
	}

	/**
	 * Survey group checking by using survey number.
	 * If survey group not exists then existing survey number will return 
	 */
	fetchSurveyGroups = async (surveyNumber) => {
		try {
			const lcObj = new SchlesingerHelper();
			const getData = await lcObj.fetchSellerAPI(
				'/api/v2/survey/survey-groups/' + surveyNumber
			);
			const groupIds = [];
			if (getData.Result.TotalCount != 0 && getData.SurveyGroups.length) {
				getData.SurveyGroups.forEach(row => {
					groupIds.push(...row.SurveyGroupSurveys);
				});
			} else {
				groupIds.push(surveyNumber);
			}
			return groupIds;
		}
		catch (error) {
			const logger = require('../../helpers/Logger')(
				`lucid-errror.log`
			);
			logger.error('[survey group error]');
			logger.error(error);
			return [surveyNumber];
		}
	}

	insertSurveyGroupsIds = async (groupIds, memberId) => {
		const params = [];
		groupIds.forEach(row => {
			params.push({
				survey_number: row,
				member_id: memberId,
				survey_provider_id: 4
			});
		});
		await SurveyAttempt.bulkCreate(params, {
			ignoreDuplicates: true
		});
	}	
}

module.exports = SchlesingerController;
