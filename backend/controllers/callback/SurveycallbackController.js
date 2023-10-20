const {
  Country,
  MemberSurvey,
  MemberTransaction,
  MemberEligibilities,
  Member,
  SurveyProvider,
  Survey,
  SurveyQuestion,
  SurveyQualification,
  SurveyAnswerPrecodes,
  CountrySurveyQuestion,
  MemberBalance,
} = require('../../models');
const db = require('../../models/index');
const { QueryTypes, Op } = require('sequelize');
const PurespectrumHelper = require('../../helpers/Purespectrum');
const SqsHelper = require('../../helpers/SqsHelper');
const eventBus = require('../../eventBus');
const LucidHelper = require('../../helpers/Lucid');

class SurveycallbackController {
  constructor() {
    this.storeSurveyQualifications = this.storeSurveyQualifications.bind(this);
    this.syncSurvey = this.syncSurvey.bind(this);
    this.memberTransaction = this.memberTransaction.bind(this);
    this.memberEligibitityUpdate = this.memberEligibitityUpdate.bind(this);
    this.getMember = this.getMember.bind(this);
    this.reverseSurvey = this.reverseSurvey.bind(this);
    this.reverseSurveyTransaction = this.reverseSurveyTransaction.bind(this);
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
      return await SurveycallbackController.prototype.schlesingerPostBack(
        req,
        res
      );
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
      const lcObj = new LucidHelper();
      if (survey.length > 0) {
        const provider = req.params.provider;
        //get survey provider
        let survey_provider = await SurveyProvider.findOne({
          attributes: ['id'],
          where: { name: provider.charAt(0).toUpperCase() + provider.slice(1) },
        });
        //country fetch
        let countryData = await Country.findAll({
          attributes: ['id', 'lucid_language_code'],
          where: {
            lucid_language_code: {
              [Op.ne]: null,
            },
          },
        });

        survey.forEach(async (element) => {
          const quota = await lcObj.showQuota(element.survey_id);
          if ('SurveyStillLive' in quota && quota.SurveyStillLive == true) {
            // let quotaObj = quota.SurveyQuotas;
            // let quotaCheck = quotaObj.some(q=>q.NumberOfRespondents < 1);
            // if(quotaCheck === false){
            // Obj create to push in SQS
            let lucid_data = {
              ...element,
              survey_provider_id: survey_provider.id,
            };

            if (countryData.length && element.country_language) {
              let country = countryData.find(
                (row) => row.lucid_language_code === element.country_language
              );
              if (country !== undefined && 'id' in country) {
                lucid_data.country_id = country.id;
                await sqsHelper.sendData(lucid_data);
              }
            }
            // }
          }
        });
      }
    } catch (error) {
      const logger1 = require('../../helpers/Logger')(`lucid-sync-errror.log`);
      logger1.error(error);
    } finally {
      res.status(200).json({
        status: true,
        message: 'Data synced.',
      });
    }
  }

  /*async syncSurvey(req, res) {
		let survey = req.body;
		try {
			//SQS
			const sqsHelper = new SqsHelper();
			const lcObj = new LucidHelper;
			if (survey.length > 0) {
				const provider = req.params.provider;
				//get survey provider
				let survey_provider = await SurveyProvider.findOne({
					attributes: ['id'],
					where: { name: provider.charAt(0).toUpperCase() + provider.slice(1) },
				});

				// console.log(survey_provider.id);
				survey.forEach(async (element) => {
					const quota = await lcObj.showQuota(element.survey_id);
					if('SurveyStillLive' in quota && quota.SurveyStillLive == true) {
						let lucid_data = {
							...element,
							survey_provider_id: survey_provider.id,
							///survey_provider.id,
						};
						// element['survey_provider_id'] = survey_provider.id;
						const send_message = await sqsHelper.sendData(lucid_data);
						// console.log('lucid survey')
						// console.log(send_message);
					}
				});
			}
			
		} catch (error) {
			const logger1 = require('../../helpers/Logger')(`lucid-sync-errror.log`);
			logger1.error(error);
		} finally {
			res.status(200).json({
				status: true,
				message: 'Data synced.',
			});
		}
	}*/

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

  /**************************************************************************
   **					POST BACK RELATED FUNCTIONALITY						**
   ***************************************************************************/

  /**
   * Cint Callback details sync
   */
  async cintPostBack(req, res) {
    try {
      const username = req.query.ssi;
      const reward = req.query.reward;
      const txnId = req.query.txn_id;

      const memberSurveys = await Survey.checkMemberSurvey(username, txnId, 2);
      if (memberSurveys.length < 1) {
        let member = await this.getMember({ username });
        if (member) {
          const survey = {
            cpi: reward,
          };
          await this.memberTransaction(
            survey,
            'Cint',
            txnId,
            member,
            req.query,
            req
          );
        }
      } else {
        const logger = require('../../helpers/Logger')(
          `cint-postback-errror.log`
        );
        logger.error(`Already attempted (#${txnId}) - (${username})`);
      }
    } catch (error) {
      const logger = require('../../helpers/Logger')(
        `cint-postback-errror.log`
      );
      logger.error(error);
    } finally {
      res.send({
        status: true,
        message: 'success',
      });
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
          let member = await this.getMember({
            username: requestParam.ps_supplier_respondent_id,
          });
          if (member) {
            const memberSurveys = await Survey.checkMemberSurvey(
              member.username,
              surveyNumber,
              3
            );
            if (memberSurveys.length < 1) {
              await this.memberTransaction(
                survey,
                'Purespectrum',
                surveyNumber,
                member,
                requestParam,
                req
              );
            } else {
              const logger = require('../../helpers/Logger')(
                `purespectrum-postback-errror.log`
              );
              logger.error(
                `Already attempted (#${surveyNumber}) - (${member.username})`
              );
            }
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
    const username = queryData.uid;
    if (queryData.status === 'complete') {
      try {
        const tmpVar = queryData.pid.split('-');
        const surveyNumber = tmpVar[1];
        const survey = await Survey.findOne({
          attributes: ['cpi'],
          where: {
            survey_number: surveyNumber,
          },
        });
        if (survey) {
          let member = await this.getMember({ username: username });
          if (member) {
            const memberSurveys = await Survey.checkMemberSurvey(
              username,
              surveyNumber,
              4
            );
            if (memberSurveys.length < 1) {
              await this.memberTransaction(
                survey,
                'Schlesinger',
                surveyNumber,
                member,
                queryData,
                req
              );
            } else {
              const logger = require('../../helpers/Logger')(
                `schlesinger-postback-errror.log`
              );
              logger.error(
                `Already attempted (#${surveyNumber}) - (${username})`
              );
            }
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
    } else {
      res.json({ message: 'Unable to process!' });
    }
  }

  /**
   * Lucid Callback details integration & redirect to page
   */
  async lucidPostback(req, res) {
    const requestParam = req.query;
    const member = await this.getMember({ username: requestParam.pid });
    if (member === null) {
      const logger = require('../../helpers/Logger')(
        `lucid-postback-errror.log`
      );
      logger.error(`Unable to find member (${requestParam.pid})!`);
      res.redirect('/survey-' + requestParam.status);
      return;
    }
    try {
      if (requestParam.status === 'complete') {
        const surveyNumber = requestParam.survey_id;
        /*const survey = await Survey.findOne({
          attributes: ['cpi'],
          where: {
            survey_number: surveyNumber,
            survey_provider_id: 1,
          }
        });*/
        const survey = requestParam;
        if (survey) {
          const memberSurveys = await Survey.checkMemberSurvey(
            member.username,
            surveyNumber,
            1
          );
          if (memberSurveys.length < 1) {
            await this.memberTransaction(
              survey,
              'Lucid',
              surveyNumber,
              member,
              requestParam,
              req
            );
          } else {
            const logger = require('../../helpers/Logger')(
              `lucid-postback-errror.log`
            );
            logger.error(
              `Already attempted (#${surveyNumber}) - (${member.username})`
            );
          }
        } else {
          const logger = require('../../helpers/Logger')(
            `lucid-postback-errror.log`
          );
          logger.error(`Survey (#${surveyNumber}) not found!`);
        }
      }
    } catch (error) {
      const logger = require('../../helpers/Logger')(
        `lucid-postback-errror.log`
      );
      logger.error(error);
    } finally {
      await this.memberEligibitityUpdate(requestParam, member);
      res.redirect('/survey-' + requestParam.status);
      return;
    }
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
      const partnerAmount = requestBody.Revenue; // the amount already converted to cent
      try {
        let member = await this.getMember({ id: userId });
        if (member) {
          const survey = {
            cpi: partnerAmount / 100,
          };
          await this.memberTransaction(
            survey,
            'Toluna',
            surveyId,
            member,
            requestBody,
            req
          );
        } else {
          const tolunaLog = require('../../helpers/Logger')(
            `toluna-postback-errror.log`
          );
          tolunaLog.error('Unable to find member!');
        }
      } catch (error) {
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
  async memberTransaction(
    survey,
    providerName,
    surveyNumber,
    member,
    payload,
    req
  ) {
    try {
      const provider = await SurveyProvider.findOne({
        attributes: ['currency_percent', 'id'],
        where: {
          name: providerName,
        },
      });
      var pname = providerName === 'Schlesinger' ? 'SAGO' : providerName;

      const partnerAmount = survey.cpi;
      let amount = survey.cpi;
      if (
        partnerAmount != 0 &&
        provider.currency_percent &&
        parseInt(provider.currency_percent) != 0
      ) {
        amount = (partnerAmount * parseInt(provider.currency_percent)) / 100;
      }
      amount = amount.toFixed(2);
      const params = {
        transaction_id: pname + ' #' + surveyNumber,
        member_id: member.id,
        amount: amount,
        note: pname + ' survey (#' + surveyNumber + ') completion',
        type: 'credited',
        amount_action: 'survey',
        created_by: null,
        payload: JSON.stringify(payload),
        survey_provider_id: provider.id,
        status: 2,
      };

      const txn = await MemberTransaction.updateMemberTransactionAndBalance(
        params
      );

      if (txn.status && txn.transaction_id) {
        await MemberSurvey.create(
          {
            member_transaction_id: txn.transaction_id,
            survey_provider_id: params.survey_provider_id,
            survey_number: surveyNumber,
            original_json: payload,
            completed_on: new Date(),
          },
          { silent: true }
        );

        //event for shoutbox
        eventBus.emit('happening_now', {
          action: 'survey-and-offer-completions',
          company_portal_id: member.company_portal_id,
          company_id: member.company_id,
          data: {
            members: member,
            amount: '$' + amount,
            surveys: { name: pname },
          },
        });

        //event for email
        eventBus.emit('send_email', {
          action: 'Survey Completed',
          data: {
            email: member.email,
            details: {
              members: {
                first_name: member.first_name,
              },
              survey: {
                amount: amount,
                survey_number: surveyNumber,
                provider: pname,
              },
            },
          },
          req: {
            ...req,
            headers: {
              ...req.headers,
              company_id: member.company_id,
              site_id: member.company_portal_id,
            },
            user: member,
          },
        });
      }
    } catch (error) {
      throw error;
    } finally {
      return true;
    }
  }

  /**
   * Update member's eligibility based on the postback data
   * @param {query String} queryObj
   * @returns
   */
  async memberEligibitityUpdate(queryObj, member) {
    try {
      if (queryObj.pid.toLowerCase() === 'test') {
        return true;
      }

      const queryKeys = Object.keys(queryObj);
      const obj = [];
      queryKeys
        .filter(
          (key) =>
            !isNaN(key) &&
            queryObj[key] != '' &&
            !isNaN(queryObj[key]) &&
            queryObj.termed_qualification_id != key
        )
        .forEach((r) => {
          obj.push({
            option: queryObj[r],
            precode: r,
          });
        });

      // const provider = await SurveyProvider.findOne({
      //   attributes: ['id'],
      //   where: {
      //     name: 'Lucid',
      //   },
      // });

      const records = await SurveyAnswerPrecodes.findAll({
        attributes: ['id', 'option', 'precode'],
        where: {
          survey_provider_id: 1,
          country_id: member.country_id,
          [Op.or]: obj,
        },
        include: {
          model: SurveyQuestion,
          attributes: ['id', 'survey_provider_question_id', 'name'],
          where: {
            survey_provider_id: 1,
            question_type: {
              [Op.notIn]: ['Multi Punch'],
            },
          },
          include: {
            model: CountrySurveyQuestion,
            attributes: ['id'],
            where: {
              country_id: member.country_id,
            },
          },
        },
      });

      let member_eligibility = [];
      for (let record of records) {
        member_eligibility.push({
          member_id: member.id,
          country_survey_question_id:
            record.SurveyQuestions[0].CountrySurveyQuestion.id,
          survey_answer_precode_id: record.id,
          text: record.SurveyQuestions[0].name,
          open_ended_value: null,
        });
      }

      await MemberEligibilities.bulkCreate(member_eligibility, {
        updateOnDuplicate: ['survey_answer_precode_id', 'text'],
      });

      return true;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
   * Get Member Data
   */
  async getMember(clause) {
    return await Member.findOne({
      attributes: {
        exclude: [
          'password',
          'created_by',
          'updated_by',
          'deleted_by',
          'deleted_at',
          'updated_at',
          'last_active_on',
          'email_verified_on',
          'profile_completed_on',
          'avatar',
          'dob',
        ],
      },
      where: {
        ...clause,
      },
    });
  }

  /**
   * Api for Survey Reversal
   */
  async reverseSurvey(req, res) {
    const logger1 = require('../helpers/Logger')(
      `${req.params.status}-${req.params.provider}.log`
    );

    logger1.info(JSON.stringify(req.query));
    logger1.info(JSON.stringify(req.body));
    res.send(req.query);
    try {
      var username = '';
      var survey_number = '';
      const provider = req.params.provider;
      if (provider === 'cint') {
        username = req.query.ssi;
        survey_number = req.query.txn_id;
      } else {
        res.send('Provider not found!');
      }
      let resp = await this.reverseSurveyTransaction(survey_number, username);
      if (resp) res.send('Survey Reversed');
      else res.send('Survey not reversed');
    } catch (e) {
      console.log(e);
      this.throwCustomError(e, 404);
    }
  }

  /**
   * Api for Reversal Survey Transaction store
   */
  async reverseSurveyTransaction(survey_number, member_username) {
    try {
      let member = await Member.findOne({
        where: { username: member_username, status: 'member' },
        include: {
          model: MemberBalance,
          as: 'member_amounts',
          where: { amount_type: 'cash' },
        },
      });
      console.log('member', member);
      if (member.length > 0) {
        let transaction = await MemberSurvey.findOne({
          where: { survey_number: survey_number },
          include: {
            model: MemberTransaction,
            where: {
              member_id: member.id,
            },
          },
        });
        console.log('transaction', transaction);
        //current transaction
        await MemberTransaction.reverseTransactionUpdate({
          member_balance_amount: member.member_amounts[0].amount,
          transaction_amount: transaction.MemberTransaction.amount,
          member_id: member.id,
          transaction_id: transaction.member_transaction_id,
        });

        //referral transaction
        let referral_transactions = await MemberTransaction.findOne({
          where: {
            parent_transaction_id: transaction.member_transaction_id,
            amount_action: 'referral',
          },
        });
        console.log('referral_transactions', referral_transactions);
        if (referral_transactions) {
          let referral_member = await Member.findOne({
            where: { id: referral_transactions.member_id },
            include: {
              model: MemberBalance,
              as: 'member_amounts',
              where: { amount_type: 'cash' },
            },
          });

          await MemberTransaction.reverseTransactionUpdate({
            member_balance_amount: referral_member.member_amounts[0].amount,
            transaction_amount: referral_transactions.amount,
            member_id: referral_transactions.member_id,
            transaction_id: referral_transactions.id,
          });
        }
        return {
          status: true,
          message: 'Record Updated',
        };
      } else {
        return {
          status: false,
          message: 'Member not found',
        };
      }
    } catch (e) {
      console.log(e);
      this.throwCustomError(e, 404);
    }
  }
}

module.exports = SurveycallbackController;
