const {
	MemberSurvey,
	MemberTransaction,
	MemberEligibilities,
	Member,
	SurveyProvider,
	Survey,
	SurveyQuestion,
	SurveyQualification,
	SurveyAnswerPrecodes,
} = require('../../models');
const db = require('../../models/index');
const { QueryTypes, Op } = require('sequelize');
const PurespectrumHelper = require('../../helpers/Purespectrum');
const SqsHelper = require('../../helpers/SqsHelper');
const eventBus = require('../../eventBus');

class SurveycallbackController {
	constructor() {
		this.storeSurveyQualifications = this.storeSurveyQualifications.bind(this);
		this.syncSurvey = this.syncSurvey.bind(this);
		this.memberTransaction = this.memberTransaction.bind(this);
		this.memberEligibitityUpdate = this.memberEligibitityUpdate.bind(this);
	}

	async save(req, res) {
		const logger1 = require('../../helpers/Logger')(
			`outcome-${req.params.provider}.log`
		);
		// console.log('===================req', req);
		logger1.info('query: ' + JSON.stringify(req.query));
		logger1.info('body: ' + JSON.stringify(req.body));

		const provider = req.params.provider;
		if (provider === 'cint') {
			return await SurveycallbackController.prototype.cintPostBack(req, res);
		} else if (provider === 'purespectrum') {
			return await SurveycallbackController.prototype.pureSpectrumPostBack(
				req,
				res
			);
		} else if (provider === 'schlesinger') {
			return await SurveycallbackController.prototype.schlesingerPostBack(req, res);
		} else if (provider === 'lucid') {
			return await SurveycallbackController.prototype.lucidPostback(req, res);
		} else if (provider === 'toluna') {
			return await SurveycallbackController.prototype.tolunaPostback(req, res);
		}
		res.send('Provider not found!');
	}

	async syncSurvey(req, res) {
		let survey = req.body;
		try {
			//SQS
			const sqsHelper = new SqsHelper();
			if (survey.length > 0) {
				const provider = req.params.provider;
				//   //get survey provider
				let survey_provider = await SurveyProvider.findOne({
					attributes: ['id'],
					where: { name: provider.charAt(0).toUpperCase() + provider.slice(1) },
				});

				// console.log(survey_provider.id);
				survey.forEach(async (element) => {
					let lucid_data = {
						...element,
						survey_provider_id: survey_provider.id,
						///survey_provider.id,
					};
					// element['survey_provider_id'] = survey_provider.id;
					const send_message = await sqsHelper.sendData(lucid_data);
					// console.log('lucid survey')
					// console.log(send_message);
				});
			}
			//SQS
			// if (survey.length > 0) {
			//   const provider = req.params.provider;
			//   //get survey provider
			//   let survey_provider = await SurveyProvider.findOne({
			//     attributes: ['id'],
			//     where: { name: provider.charAt(0).toUpperCase() + provider.slice(1) },
			//   });
			//   //survey questions
			//   let survey_questions = await SurveyQuestion.findAll({
			//     attributes: ['survey_provider_question_id'],
			//   });
			//   survey.map(async (record) => {
			//     let status = 'draft'
			//     if (record.is_live == true || record.is_live == 'true') {
			//       status = 'active'
			//     }
			//     //create survey
			//     let model = {};
			//     let data = {
			//       survey_provider_id: survey_provider.id,
			//       loi: record.length_of_interview,
			//       cpi: record.cpi,
			//       name: record.survey_name,
			//       survey_number: record.survey_id,
			//       status: status
			//     }
			//     var survey_status = 'created';
			//     var obj = await Survey.findOne({ where: { survey_number: record.survey_id, survey_provider_id: survey_provider.id } })
			//     if (obj) {
			//       survey_status = 'updated'
			//       model = await obj.update(data);
			//     }
			//     else {
			//       model = await Survey.create(data);
			//     }

			//     if ('survey_qualifications' in record && Array.isArray(record.survey_qualifications) && record.survey_qualifications.length > 0) {
			//       let qualification_ids = []
			//       //clear all the previous records if the status is updated
			//       if (survey_status === 'updated') {
			//         //get all qualification
			//         var qualification_ids_rows = await SurveyQualification.findAll({ where: { survey_id: model.id }, attributes: ['id'] })
			//         qualification_ids = qualification_ids_rows.map((qualification_id) => {
			//           return qualification_id.id
			//         })
			//         if (qualification_ids.length > 0) {
			//           //remove qualifications
			//           await SurveyQualification.destroy({
			//             where: {
			//               id: {
			//                 [Op.in]: qualification_ids
			//               }
			//             },
			//             force: true
			//           });
			//           await db.sequelize.query(
			//             "DELETE FROM `survey_answer_precode_survey_qualifications` WHERE `survey_qualification_id` IN (" + qualification_ids.join(',') + ")", { type: QueryTypes.DELETE }
			//           );
			//         }
			//       }
			//       //store survey qualifications
			//       await this.storeSurveyQualifications(record, model, survey_questions, req)
			//     }
			//   });
			// }
		} catch (error) {
			const logger1 = require('../../helpers/Logger')(`lucid-sync-errror.log`);
			logger1.error(error);
		} finally {
			// const logger1 = require('../../helpers/Logger')(
			//   `lucid-${new Date()}.log`
			// );
			// logger1.info(JSON.stringify(req.body));
			res.status(200).json({
				status: true,
				message: 'Data synced.',
			});
		}
	}

	//function to store survey qualifications
	async storeSurveyQualifications(record, model, survey_questions, req) {
		try {
			record.survey_qualifications.map(async (record1) => {
				let obj = survey_questions.find(
					(val) => val.survey_provider_question_id === record1.question_id
				);
				if (obj) {
					let model1 = await SurveyQualification.create(
						{
							survey_id: model.id,
							survey_question_id: record1.question_id,
							logical_operator: record1.logical_operator,
						},
						{ silent: true }
					);

					record1.precodes.map(async (precode) => {
						var answer_precode = await SurveyAnswerPrecodes.findOne({
							where: { lucid_precode: precode },
						});
						if (!answer_precode) {
							answer_precode = await SurveyAnswerPrecodes.create({
								option: '',
								lucid_precode: precode,
							});
						}
						await db.sequelize.query(
							'INSERT INTO survey_answer_precode_survey_qualifications (survey_qualification_id, survey_answer_precode_id) VALUES (?, ?)',
							{
								type: QueryTypes.INSERT,
								replacements: [model1.id, answer_precode.id],
							}
						);
					});
				}
			});
		} catch (error) {
			const logger1 = require('../../helpers/Logger')(`lucid-sync-errror.log`);
			logger1.info(JSON.stringify(req.query));
			logger1.info(JSON.stringify(req.body));
		}
	}

	/**
	 * Cint Callback details sync
	 */
	async cintPostBack(req, res) {
		const username = req.params.ssi;
		const reward = req.params.reward;
		const txnId = req.params.txn_id;

		let member = await Member.findOne({
			attributes: ['id', 'username'],
			where: {
				username: username,
			}
		});
		if (member) {
			const survey = {
				cpi: reward
			}
			await this.memberTransaction( survey, 'Cint', txnId, member, req.params );

			/*const provider = await SurveyProvider.findOne({
				attributes: ['currency_percent', 'id'],
				where: {
					name: 'Cint'
				}
			});

			let amount = reward;
			if (reward != 0 && parseInt(provider.currency_percent) != 0) {
				amount = (reward * 100) / parseInt(provider.currency_percent);
			}

			const note = provider;
			const transaction_obj = {
				transaction_id: 'Cint #'+txnId,
				member_id: member ? member.id : null,
				amount: amount,
				note: note + ' ' + req.params.status,
				type: 'credited',
				amount_action: 'survey',
				created_by: null,
				payload: JSON.stringify(req.query),
			};

			await MemberSurvey.create({
				survey_provider_id: provider.id,
				survey_number: txnId,
				original_json: req.query,
				completed_on: new Date()
			}, { silent: true });

			//   console.log('transaction_obj', transaction_obj);
			let result = await MemberTransaction.updateMemberTransactionAndBalance(
				transaction_obj
			);*/
			//event for shoutbox
			let evntbus = eventBus.emit('happening_now', {
				action: 'survey-and-offer-completions',
				company_portal_id: req.session.company_portal.id,
				company_id: req.session.company_portal.company_id,
				data: {
					members: req.session.member,
					amount: '$' + amount,
					surveys: { name: provider },
				},
			});
			res.send(req.query);
		}
	}

	/**
	 * Pure Spectrum Callback details sync & redirect to page
	 */
	async pureSpectrumPostBack(req, res) {
		const requestParam = req.query;
		if (requestParam.status === 'quota') {
			try {
				const psObj = new PurespectrumHelper();
				const surveyNumber = requestParam.survey_id;
				const surveyData = await psObj.fetchAndReturnData(
					'/surveys/' + surveyNumber
				);
				if (surveyData.apiStatus === 'success' && surveyData.survey) {
					const currentSurveySts = surveyData.survey.survey_status;
					await Survey.update(
						{
							status: psObj.getSurveyStatus(currentSurveySts),
						},
						{
							where: {
								survey_number: requestParam.survey_id,
							},
						}
					);
				} else {
					throw { name: 'error', message: surveyData.msg };
				}
			} catch (error) {
				const logger1 = require('../../helpers/Logger')(
					`purespectrum-postback-errror.log`
				);
				logger1.error(error);
			}
		} else if (
			requestParam.status === 'complete' &&
			requestParam.ps_rstatus == 21
		) {
			// complete
			try {
				const surveyNumber = requestParam.survey_id;
				const survey = await Survey.findOne({
					attributes: ['cpi'],
					where: {
						survey_number: surveyNumber,
					},
				});
				if (survey) {
					const username = requestParam.ps_supplier_respondent_id;
					let member = await Member.findOne({
						attributes: ['id', 'username'],
						where: {
							username: username,
						},
					});
					if (member) {
						await this.memberTransaction( survey, 'Purespectrum', surveyNumber, member, requestParam );
						/*const provider = await SurveyProvider.findOne({
							attributes: ['currency_percent', 'id'],
							where: {
								name: 'Purespectrum'
							}
						});
						const partnerAmount = survey.cpi;
						let amount = survey.cpi;
						if (partnerAmount != 0 && parseInt(provider.currency_percent) != 0) {
							amount = (partnerAmount * 100) / parseInt(provider.currency_percent);
						}
						const transaction_obj = {
							transaction_id: 'Purespectrum #'+surveyNumber,
							member_id: member.id,
							amount: amount,
							note: 'Pure Spectrum survey (#' + surveyNumber + ') completion',
							type: 'credited',
							amount_action: 'survey',
							created_by: null,
							payload: JSON.stringify(req.query),
							survey_provider_id: provider.id,
							survey_number: surveyNumber
						};*/
						// await MemberTransaction.updateMemberTransactionAndBalance(
						// 	transaction_obj
						// );

						await SurveycallbackController.prototype.addMemberTransacrion(transaction_obj);

						//event for shoutbox
						let evntbus = eventBus.emit('happening_now', {
							action: 'survey-and-offer-completions',
							company_portal_id: req.session.company_portal.id,
							company_id: req.session.company_portal.company_id,
							data: {
								members: req.session.member,
								amount: '$' + amount,
								surveys: { name: 'Pure Spectrum' },
							},
						});
					} else {
						const logger1 = require('../../helpers/Logger')(
							`purespectrum-postback-errror.log`
						);
						logger1.error('Unable to find member!');
					}
				} else {
					const logger1 = require('../../helpers/Logger')(
						`purespectrum-postback-errror.log`
					);
					logger1.error('Survey not found!');
				}
			} catch (error) {
				const logger1 = require('../../helpers/Logger')(
					`purespectrum-postback-errror.log`
				);
				logger1.error(error);
			}
		}
		res.redirect('/survey-' + requestParam.status);
		return;
	}

	/**
	 * Schlesinger Callback details integration
	 */
	async schlesingerPostBack(req, res) {
		const queryData = req.query;		
		const tmpVar = queryData.pid.split('-');
		const surveyNumber = tmpVar[1];
		if (queryData.status === 'complete') {
			try {
				const survey = await Survey.findOne({
					attributes: ['cpi'],
					where: {
						survey_number: surveyNumber,
					}
				});
				if (survey) {
					let member = await Member.findOne({
						attributes: ['id', 'username'],
						where: {
							username: queryData.uid,
						}
					});
					if (member) {
						await this.memberTransaction( survey, 'Schlesinger', surveyNumber, member, queryData );
					} else {
						const logger1 = require('../../helpers/Logger')(
							`schlesinger-postback-errror.log`
						);
						logger1.error('Unable to find member!');
					}
				}
			} catch (error) {
				const logger1 = require('../../helpers/Logger')(
					`schlesinger-postback-errror.log`
				);
				logger1.error(error);
			}
			res.json({ message: 'success' });
		}
	}

	/**
	 * Lucid Callback details integration & redirect to page
	 */
	async lucidPostback(req, res) {
		const requestParam = req.query;
		if (requestParam.status === 'complete') {
			try {
				const surveyNumber = requestParam.survey_id;
				const survey = await Survey.findOne({
					attributes: ['cpi'],
					where: {
						survey_number: surveyNumber,
					}
				});
				if (survey) {
					const username = requestParam.pid;
					let member = await Member.findOne({
						attributes: ['id', 'username'],
						where: {
							username: username,
						}
					});
					if (member) {
						await this.memberTransaction( survey, 'Lucid', surveyNumber, member, requestParam );
						await this.memberEligibitityUpdate(requestParam);
						/*const provider = await SurveyProvider.findOne({
							attributes: ['currency_percent'],
							where: {
								name: 'Lucid'
							}
						});
						const partnerAmount = survey.cpi;
						let amount = survey.cpi;
						if (partnerAmount != 0 && parseInt(provider.currency_percent) != 0) {
							amount = (partnerAmount * 100) / parseInt(provider.currency_percent);
						}

						const transaction_obj = {
							transaction_id: 'Lucid #'+surveyNumber,							
							member_id: member.id,
							amount: amount,
							note: 'Lucid survey (#' + surveyNumber + ') completion',
							type: 'credited',
							amount_action: 'survey',
							created_by: null,
							payload: JSON.stringify(req.body),
						};
						await MemberTransaction.updateMemberTransactionAndBalance(
							transaction_obj
						);*/
					} else {
						const logger1 = require('../../helpers/Logger')(
							`lucid-postback-errror.log`
						);
						logger1.error('Unable to find member!');
					}
				} else {
					const logger1 = require('../../helpers/Logger')(
						`lucid-postback-errror.log`
					);
					logger1.error('Survey not found!');
				}
			} catch (error) {
				const logger1 = require('../../helpers/Logger')(
					`lucid-postback-errror.log`
				);
				logger1.error(error);
			}
		}
		res.redirect('/survey-' + requestParam.status);
		return;
	}

	/**
	 * Toluna Callback setup
	 */
	async tolunaPostback(req, res) {
		if (req.query.status === 'complete') {
			const requestBody = req.body;
			const userId = requestBody.UniqueCode;
			const surveyId = requestBody.SurveyId;
			const surveyRef = requestBody.SurveyRef;
			const partnerAmount = requestBody.Revenue;  // the amount already converted to cent
			try {
				let member = await Member.findOne({
					attributes: ['id'],
					where: {
						id: userId,
					},
				});

				if (member) {
					const survey = {
						cpi: (partnerAmount / 100)
					}
					await this.memberTransaction( survey, 'Toluna', surveyId, member, requestBody );
				} else {
					const tolunaLog = require('../../helpers/Logger')(
						`toluna-postback-errror.log`
					);
					tolunaLog.error('Unable to find member!');
				}
			}
			catch (error) {
				const tolunaLog = require('../../helpers/Logger')(
					`toluna-postback-errror.log`
				);
				tolunaLog.error(error);
			}
		}
		res.json({ message: 'success' });
		return;
	}

	/**
	 * Sync Member Transaction & Member Survey
	 */
	async memberTransaction( survey, providerName, surveyNumber, member, payload ) {
		try{
			const provider = await SurveyProvider.findOne({
				attributes: ['currency_percent', 'id'],
				where: {
					name: providerName
				}
			});
			
			const partnerAmount = survey.cpi;
			let amount = survey.cpi;			
			if (partnerAmount != 0 && provider.currency_percent && parseInt(provider.currency_percent) != 0) {
				amount = (partnerAmount * parseInt(provider.currency_percent)) / 100;
			}
			const params = {
				transaction_id: providerName + ' #'+surveyNumber,
				member_id: member.id,
				amount: amount,
				note: providerName + 'survey (#' + surveyNumber + ') completion',
				type: 'credited',
				amount_action: 'survey',
				created_by: null,
				payload: JSON.stringify(payload),
				survey_provider_id: provider.id,
			};			

			const txn = await MemberTransaction.updateMemberTransactionAndBalance(
				params
			);
			
			if(txn.status && txn.transaction_id){
				await MemberSurvey.create({
					member_transaction_id: txn.transaction_id,
					survey_provider_id: params.survey_provider_id,
					survey_number: surveyNumber,
					original_json: payload,
					completed_on: new Date()
				}, { silent: true });
			}
		} catch (error) {
			console.error(error)
		} finally {
			return true;
		}
	}

	/**
	 * Update member's eligibility based on the postback data
	 * @param {query String} queryObj 
	 * @returns 
	 */
	async memberEligibitityUpdate(queryObj){
		try{
			// const queryObj = req.query;

			const queryKeys = Object.keys(queryObj);
			const obj = {}
			for (let key of queryKeys) {
				if(!isNaN(key) && queryObj[key] != '' && queryObj.termed_qualification_id != key){
					obj[key] = queryObj[key];
				}
			}

			const provider = await SurveyProvider.findOne({
				attributes: ['id'],
				where: {
					name: 'Lucid'
				}
			});

			const precodes = Object.keys(obj);
			const surveyQuestions = await SurveyQuestion.findAll({
				attributes: ['id', 'survey_provider_question_id', 'question_type'],
				where: {
					survey_provider_question_id: precodes,
					survey_provider_id: provider
				},
				include: {
					model: SurveyAnswerPrecodes,
					where: {
						option: Object.values(obj)
					}
				}
			});

			const params = [];
			for(let precode of precodes) {
				let matchedQuest = surveyQuestions.find(row => row.survey_provider_question_id === +precode);			
				let answerPrecode = matchedQuest.SurveyAnswerPrecodes.find(r=> +r.option === +obj[precode] && +r.precode === +precode);
				if(matchedQuest && answerPrecode){
					params.push({
						member_id: queryObj.pid,
						survey_question_id: matchedQuest.id,
						survey_answer_precode_id: answerPrecode.id
					});
				}			
			}
			const result = await MemberEligibilities.bulkCreate(params, {
				updateOnDuplicate:['survey_answer_precode_id']
			});

			return result;
		} 
		catch (err) {
			const logger = require('../../helpers/Logger')(
				`lucid-postback-errror.log`
			);
			logger.error(err);
			return {
				status: false,
				message: err.message
			};
		}
	}
}

module.exports = SurveycallbackController;
