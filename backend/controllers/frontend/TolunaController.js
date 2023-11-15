const { Member, SurveyProvider, CompanyPortal, Survey } = require('../../models');
const TolunaHelper = require('../../helpers/Toluna');

class TolunaController {
	constructor() {
		this.surveys = this.surveys.bind(this);
	}

	/**
	 * To get the surveys
	 * @param {*} req
	 * @param {*} res
	 * @returns
	 */
	async surveys(memberId, params, req) {
		if (!memberId) {
			return {
				status: false,
				message: 'Unauthorized!',
			};
		}
		const member = await Member.findOne({
			attributes: ['username', 'id', 'country_id'],
			where: {
				id: memberId,
			},
			include: {
				model: CompanyPortal,
				attributes: ['domain', 'name'],
			}
		});

		if (member) {
			const provider = await SurveyProvider.findOne({
				attributes: ['id', 'currency_percent'],
				where: {
					name: 'Toluna',
				}
			});
			const centAmt = provider.currency_percent ? provider.currency_percent : 0;
			const tObj = new TolunaHelper();
			try {
				var envType = '_';
				if (process.env.DEV_MODE == "0")
					envType = '_live_';
				else if (process.env.DEV_MODE == "1")
					envType = '_development_';
				else if (process.env.DEV_MODE == "2")
					envType = '_staging_';

				const surveys = await tObj.getSurveys(
					member.CompanyPortal.name + envType + member.id,
					member.country_id
				);
				var survey_list = [];

				// Type checking added because Toluna send string response if there are no any surveys.
				if (surveys && (typeof surveys === 'object' || typeof surveys === 'array')) {
					if (surveys.length > 1) {
						survey_list = TolunaController.prototype.getSurveyList(surveys, centAmt);
						return {
							status: true,
							message: 'Success',
							result: {
								surveys: survey_list,
								page_count: 1,
							},
						};
					} else {
						// We have to check if the member has attempted the survey or not.
						const surveyId = surveys[0].SurveyID
						const memberSurveys = await Survey.checkMemberSurvey(
							member.username,
							surveyId,
							provider.id
						);
						if (memberSurveys.length < 1) {
							survey_list = TolunaController.prototype.getSurveyList(surveys, centAmt);
							return {
								status: true,
								message: 'Success',
								result: {
									surveys: survey_list,
									page_count: 1,
								}
							};
						} else {
							return {
								status: false,
								message: 'You have successfully completed Toluna’s quality survey therefore no more surveys will appear. MoreSurveys will announce when Toluna’s full survey inventory is available. Please ensure that your email marketing preferences are switched on.',
							};
						}
					}
				} else {
					// This block of code will be removed later when quality survey attemption completed.
					const surveyAttempted = await Survey.checkSurveyAttemption(
						member.username,
						provider.id
					);
					if (surveyAttempted.length !== 0) {
						return {
							status: false,
							message: 'You have successfully completed Toluna’s quality survey therefore no more surveys will appear. MoreSurveys will announce when Toluna’s full survey inventory is available. Please ensure that your email marketing preferences are switched on.',
						};
					}
					//****************** */
					return {
						status: false,
						message: 'Sorry! There are no more surveys right now.',
					};
				}
			} catch (error) {
				console.error(error)
				return {
					status: false,
					message: 'Unable to get survey now! Please try again later.',
				};
			}
		} else {
			return {
				status: false,
				message: 'Member not found!',
			};
		}
	}

	getSurveyList(surveys, centAmt) {
		const surveyList = [];
		for (let survey of surveys) {
			let memberAmount = (centAmt != 0 && survey.PartnerAmount != 0) ? (survey.PartnerAmount * centAmt) / 100 : 0;
			surveyList.push({
				survey_number: '',
				name: survey.Name,
				cpi: parseFloat(memberAmount).toFixed(2),
				loi: survey.Duration,
				link: survey.URL,
			});
		}
		return surveyList;
	}

	/**
	 * To register a member with profile data
	 * @param {*} req
	 * @param {*} res
	 *
	async registerMember(req, res) {
	  try {
		const tObj = new TolunaHelper();
		const payload = {
		  PartnerGUID: process.env.PARTNER_GUID,
		  MemberCode: 'cc-dev-2',
		  Email: 'ccdev2@mailinator.com',
		  BirthDate: '6/21/1992',
		  PostalCode: '71751',
		  RegistrationAnswers: [
			{
			  QuestionID: 1001007,
			  Answers: [{ AnswerID: 2000247 }],
			},
			{
			  QuestionID: 1001101,
			  Answers: [{ AnswerID: 2002275 }],
			},
			{
			  QuestionID: 1001107,
			  Answers: [{ AnswerID: 2002330 }],
			},
			{
			  QuestionID: 1001012,
			  Answers: [{ AnswerID: 2000270 }],
			},
			{
			  QuestionID: 1005145,
			  Answers: [{ AnswerID: 2796316 }],
			},
			{
			  QuestionID: 1001102,
			  Answers: [{ AnswerID: 2002280 }],
			},
			{
			  QuestionID: 1012395,
			  Answers: [{ AnswerID: 3056609 }],
			},
		  ],
		};
		await tObj.addMemebr(payload);
		res.send('Member Created!');
	  } catch (error) {
		res.send(error);
	  }
	}*/
}

module.exports = TolunaController;
