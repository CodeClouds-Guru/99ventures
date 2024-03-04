const {
  sequelize,
  Survey,
  SurveyProvider,
  SurveyQuestion,
  SurveyQualification,
  SurveyAnswerPrecodes,
  Country,
  CountrySurveyQuestion,
} = require('../../models');
const SchlesingerHelper = require('../../helpers/Schlesinger');
const PurespectrumHelper = require('../../helpers/Purespectrum');
const TolunaHelper = require('../../helpers/Toluna');
const { Op, QueryTypes } = require('sequelize');
const { capitalizeFirstLetter } = require('../../helpers/global');
const SqsHelper = require('../../helpers/SqsHelper');
const LucidHelper = require('../../helpers/Lucid');
const { isBuffer } = require('lodash');
const moment = require('moment');

class SurveySyncController {
  constructor() {
    this.pureSpectrumSurveyQuestions =
      this.pureSpectrumSurveyQuestions.bind(this);
    this.schlesingerSurveyQuestions =
      this.schlesingerSurveyQuestions.bind(this);
    this.pureSpectrumSurvey = this.pureSpectrumSurvey.bind(this);
    this.schlesingerSurvey = this.schlesingerSurvey.bind(this);
    this.pureSpectrumQualification = this.pureSpectrumQualification.bind(this);
    this.schlesingerQualification = this.schlesingerQualification.bind(this);
    this.syncSurveyQuestion = this.syncSurveyQuestion.bind(this);
    this.syncSurveyQualification = this.syncSurveyQualification.bind(this);
    this.tolunaSurveyQuestions = this.tolunaSurveyQuestions.bind(this);
    this.lucidSurveyQuestions = this.lucidSurveyQuestions.bind(this);
    this.getProvider = this.getProvider.bind(this);
    this.index = this.index.bind(this);

    this.schlesingerSurveySaveToSQS =
      this.schlesingerSurveySaveToSQS.bind(this);
    this.pureSpectrumSurveySaveToSQS =
      this.pureSpectrumSurveySaveToSQS.bind(this);
    /**
     * "English - United States"
     * language 3
     */
    this.schlesingerLanguageId = 3;
  }

  index(req, res) {
    const action = req.params.action;
    this.getProvider(req, res);
    if (action === 'question') {
      this.syncSurveyQuestion(req, res);
    } else if (action === 'survey') {
      this.syncSurveyQualification(req, res);
    } else {
      res.send('Invalid action argument!');
    }
  }

  async getProvider(req, res) {
    const providerName = req.params.provider;
    const provider = await SurveyProvider.findOne({
      attributes: ['id'],
      where: {
        name: capitalizeFirstLetter(providerName),
      },
    });

    this.providerId = provider.id.toString();
    return provider;
  }

  async syncSurveyQuestion(req, res) {
    const provider = req.params.provider;
    if (provider === 'purespectrum') {
      this.pureSpectrumSurveyQuestions(req, res);
    } else if (provider === 'schlesinger') {
      this.schlesingerSurveyQuestions(req, res);
    } else if (provider === 'toluna') {
      this.tolunaSurveyQuestions(req, res);
    } else if (provider === 'lucid') {
      this.lucidSurveyQuestions(req, res);
    } else {
      res.send('Invalid provider');
    }
  }

  async syncSurveyQualification(req, res) {
    const provider = req.params.provider;
    if (provider === 'purespectrum') {
      this.pureSpectrumQualification(req, res);
    } else if (provider === 'schlesinger') {
      this.schlesingerQualification(req, res);
    } else {
      res.send('Invalid provider');
    }
  }

  /**
   * Pure Spectrum survey
   */
  async pureSpectrumSurvey(req, res) {
    try {
      const psObj = new PurespectrumHelper();
      const allSurveys = await psObj.fetchAndReturnData('/surveys');
      if ('success' === allSurveys.apiStatus && allSurveys.surveys) {
        const surveyData = allSurveys.surveys.filter(
          (sr) => sr.survey_performance.overall.loi < 20 && sr.cpi >= 0.5
        );

        if (!surveyData.length) {
          res.json({
            status: true,
            message: 'No survey found for this language!',
          });
          return;
        }

        //-- Disabled all the previous surveys
        /*const current_datetime = new Date();
                await Survey.update({
                    status: psObj.getSurveyStatus(33),
                    deleted_at: new Date()
                }, {
                    where: {
                        survey_provider_id: this.providerId,
                        status: 'live',
                        created_at: {
                            [Op.lt]: current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate()
                        },
                    }
                });*/
        //----------

        const surveyIds = surveyData.map((sr) => sr.survey_id);
        const existingSurveys = await Survey.findAll({
          attributes: ['id', 'survey_number'],
          where: {
            survey_provider_id: this.providerId,
            survey_number: {
              [Op.in]: surveyIds,
            },
          },
        });

        const insertParams = [];
        for (let sr of surveyData) {
          const country = await Country.findOne({
            attributes: ['id'],
            where: {
              language_code: sr.surveyLocalization,
            },
          });
          if (country && country.id) {
            let data = existingSurveys.find(
              (row) =>
                row.survey_number == sr.survey_id &&
                row.country_id == sr.sr.surveyLocalization
            );
            let params = {
              survey_provider_id: this.providerId,
              loi: sr.survey_performance.overall.loi,
              cpi: sr.cpi,
              name: sr.survey_name,
              survey_number: sr.survey_id,
              status: psObj.getSurveyStatus(sr.survey_status),
              original_json: sr,
              created_at: new Date(),
              country_id: country.id,
            };
            if (data) {
              params.id = data.id;
            }
            insertParams.push(params);
          }
        }

        const result = await Survey.bulkCreate(insertParams, {
          updateOnDuplicate: [
            'loi',
            'cpi',
            'status',
            'name',
            'country_id',
            'original_json',
          ],
        });
        return result;
      } else {
        return [];
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * Schlesinger survey
   */
  async schlesingerSurvey(req, res) {
    try {
      const psObj = new SchlesingerHelper();
      const allSurveys = await psObj.fetchSellerAPI(
        '/api/v2/survey/allocated-surveys'
      );

      if (allSurveys.Result.Success && allSurveys.Result.TotalCount != 0) {
        const surveyData = allSurveys.Surveys.filter(
          (sr) => sr.LOI < 20 && sr.CPI >= 0.5
        );
        // const surveyData = allSurveys.Surveys.filter(sr => sr.LanguageId === this.schlesingerLanguageId && sr.LOI < 20 && sr.CPI >= 0.5);

        if (!surveyData.length) {
          res.json({
            status: true,
            message: 'No survey found for this language!',
          });
          return;
        }

        //-- Disabled all the previous surveys
        /*const current_datetime = new Date();
                await Survey.update({
                    status: 'paused',
                    deleted_at: new Date()
                }, {
                    where: {
                        survey_provider_id: this.providerId,
                        status: 'live',
                        created_at: {
                            [Op.lt]: current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate()
                        },
                    }
                });*/
        //----------

        for (let survey of surveyData) {
          const country = await Country.findOne({
            attributes: ['id'],
            where: {
              language_id: survey.LanguageId,
            },
          });
          if (country && country.id) {
            const checkExists = await Survey.count({
              where: {
                survey_provider_id: this.providerId,
                survey_number: survey.SurveyId,
                country_id: country.id,
              },
            });
            if (!checkExists) {
              await Survey.create({
                survey_provider_id: this.providerId,
                loi: survey.LOI,
                cpi: survey.CPI,
                name: null,
                survey_number: survey.SurveyId,
                status: 'live',
                original_json: survey,
                created_at: new Date(),
                country_id: country.id,
              });
            } else {
              await Survey.update(
                {
                  loi: survey.LOI,
                  cpi: survey.CPI,
                  name: null,
                  original_json: survey,
                  updated_at: new Date(),
                },
                {
                  where: {
                    survey_number: survey.SurveyId,
                  },
                }
              );
            }
          }
        }
        return await Survey.findAll({
          attributes: ['id', 'survey_number', 'loi', 'cpi', 'country_id'],
          where: {
            status: 'live',
            survey_provider_id: this.providerId,
          },
        });
      } else {
        return [];
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * [Pure Spectrum] To Save Survey, Qualifications, Qualification Answer
   */
  async pureSpectrumQualification(req, res) {
    if (req.query.mode && req.query.mode === 'db') {
      try {
        //Save Surveys
        const allSurveys = await this.pureSpectrumSurvey(req, res);
        if (allSurveys.length) {
          const psObj = new PurespectrumHelper();
          for (let survey of allSurveys) {
            const surveyData = await psObj.fetchAndReturnData(
              '/surveys/' + survey.survey_number
            );
            if ('success' === surveyData.apiStatus) {
              const qualifications = surveyData.survey.qualifications;
              if (qualifications.length) {
                for (let qualification of qualifications) {
                  const questionData = await SurveyQuestion.findOne({
                    attributes: [
                      'id',
                      'question_type',
                      'survey_provider_question_id',
                    ],
                    where: {
                      survey_provider_question_id:
                        qualification.qualification_code,
                      survey_provider_id: this.providerId,
                    },
                  });

                  // Qualifications insert || Find
                  if (questionData && questionData.id) {
                    var surveyQualification = await SurveyQualification.findOne(
                      {
                        where: {
                          survey_id: survey.id,
                          survey_question_id: questionData.id,
                        },
                      }
                    );
                    if (surveyQualification == null) {
                      var surveyQualification =
                        await SurveyQualification.create(
                          {
                            survey_id: survey.id,
                            survey_question_id: questionData.id,
                            logical_operator: 'OR',
                            created_at: new Date(),
                          },
                          { silent: true }
                        );
                    }
                    // Survey Precode Check and survey_answer_precode_survey_qualifications save
                    if (surveyQualification && surveyQualification.id) {
                      if (qualification.condition_codes) {
                        const precodeData = await SurveyAnswerPrecodes.findAll({
                          where: {
                            precode: qualification.qualification_code,
                            survey_provider_id: this.providerId,
                            // option: qualification.condition_codes
                            option: {
                              [Op.in]: qualification.condition_codes,
                            },
                          },
                        });
                        if (precodeData && precodeData.length) {
                          await surveyQualification.addSurveyAnswerPrecodes(
                            precodeData
                          );
                        }
                      } else if (qualification.range_sets) {
                        const precodeData = await SurveyAnswerPrecodes.findAll({
                          where: {
                            precode: qualification.qualification_code,
                            survey_provider_id: this.providerId,
                            option: {
                              [Op.between]: [
                                qualification.range_sets[0].from,
                                qualification.range_sets[0].to,
                              ],
                            },
                          },
                        });

                        if (precodeData && precodeData.length) {
                          await surveyQualification.addSurveyAnswerPrecodes(
                            precodeData
                          );
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          res.json({ status: true, message: 'Data updated' });
        } else {
          res.json({ status: true, message: 'No survey found!' });
        }
        return;
      } catch (error) {
        console.error(error);
        throw error;
      }
    } else {
      return this.pureSpectrumSurveySaveToSQS(req, res);
    }
  }

  /**
   * [Schlesinger] To Save Survey, Qualifications, Qualification Answer
   */
  async schlesingerQualification(req, res) {
    if (req.query.mode && req.query.mode === 'db') {
      try {
        const allSurveys = await this.schlesingerSurvey(req, res);
        if (allSurveys.length) {
          const psObj = new SchlesingerHelper();
          for (let survey of allSurveys) {
            const surveyData = await psObj.fetchSellerAPI(
              '/api/v2/survey/survey-qualifications/' + survey.survey_number
            );

            if (
              surveyData.Result.Success &&
              surveyData.Result.TotalCount != 0
            ) {
              const surveyQualifications = surveyData.SurveyQualifications;
              for (let ql of surveyQualifications) {
                const questionData = await SurveyQuestion.findOne({
                  attributes: [
                    'id',
                    'question_type',
                    'survey_provider_question_id',
                  ],
                  where: {
                    survey_provider_question_id: ql.QualificationId,
                    survey_provider_id: this.providerId,
                  },
                });

                if (questionData && questionData.id) {
                  var surveyQualification = await SurveyQualification.findOne({
                    where: {
                      survey_id: survey.id,
                      survey_question_id: questionData.id,
                    },
                  });
                  if (surveyQualification == null) {
                    var surveyQualification = await SurveyQualification.create(
                      {
                        survey_id: survey.id,
                        survey_question_id: questionData.id,
                        logical_operator: 'OR',
                        created_at: new Date(),
                      },
                      { silent: true }
                    );
                  }

                  if (surveyQualification && surveyQualification.id) {
                    if (
                      questionData.question_type == 'range' &&
                      questionData.survey_provider_question_id == 59
                    ) {
                      const start = ql.AnswerIds[0].split('-')[0];
                      const end =
                        ql.AnswerIds[ql.AnswerIds.length - 1].split('-')[1];

                      const precodeData = await SurveyAnswerPrecodes.findAll({
                        where: {
                          precode: ql.QualificationId,
                          survey_provider_id: this.providerId,
                          country_id: survey.country_id,
                          option: {
                            [Op.between]: [start, end],
                          },
                        },
                      });
                      if (precodeData && precodeData.length) {
                        await surveyQualification.addSurveyAnswerPrecodes(
                          precodeData
                        );
                      }
                    } else {
                      const precodeData = await SurveyAnswerPrecodes.findOne({
                        where: {
                          precode: ql.QualificationId,
                          survey_provider_id: this.providerId,
                          country_id: survey.country_id,
                          option: ['open ended'].includes(
                            questionData.question_type
                          )
                            ? null
                            : ql.AnswerIds,
                        },
                      });
                      if (precodeData && precodeData.id) {
                        await surveyQualification.addSurveyAnswerPrecodes(
                          precodeData
                        );
                      }
                    }
                  }
                }
              }
            }
          }
          res.json({ status: true, message: 'Data updated' });
        } else {
          res.json({ status: true, message: 'No survey found!' });
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    } else {
      return this.schlesingerSurveySaveToSQS(req, res);
    }
  }

  /****************************************************
   ******** QUESTIONS & ANSWERS SYNC Functions ********
   ****************************************************/

  /**
   * Pure Spectrum To create all the questions
   * URL: http://localhost:4000/callback/survey/purespectrum/question?country_id=225|226
   */
  async pureSpectrumSurveyQuestions(req, res) {
    try {
      const country = await Country.findOne({
        attributes: ['id', 'language_code'],
        where: {
          id: req.query.country_id,
        },
      });
      if (country === null) {
        res.json({ status: false, message: 'Country not found!' });
        return;
      }
      const psObj = new PurespectrumHelper();
      const allAttributes = await psObj.fetchAndReturnData(
        '/attributes?localization=' + country.language_code + '&format=true'
      );

      if ('success' === allAttributes.apiStatus) {
        const qualAttributes = allAttributes.qual_attributes;
        const qualificationIds = [];
        const questions = [];

        for (let attr of qualAttributes) {
          let params = {
            question_text: attr.text,
            name: attr.desc,
            survey_provider_id: this.providerId,
            survey_provider_question_id: attr.qualification_code,
            question_type: psObj.getQuestionType(attr.type),
            created_at: new Date(),
          };
          const precodes = [];
          if (attr.condition_codes.length) {
            for (let op of attr.condition_codes) {
              precodes.push({
                option: op.id,
                precode: attr.qualification_code,
                country_id: country.id,
                survey_provider_id: this.providerId,
                option_text: op.text ? op.text : op.name,
              });
            }
          } else if (attr.condition_codes.length < 1) {
            const format = attr.format;
            if (format.min !== null && format.max !== null) {
              if (attr.qualification_code == 212) {
                // 212 = AGE
                for (let op = format.min; op <= format.max; op++) {
                  precodes.push({
                    option: op,
                    precode: attr.qualification_code,
                    country_id: country.id,
                    survey_provider_id: this.providerId,
                    option_text: null,
                  });
                }
              } else if (psObj.getQuestionType(attr.type) !== 'open-ended') {
                for (let op = format.min; op <= format.max; op++) {
                  precodes.push({
                    option: op,
                    precode: attr.qualification_code,
                    country_id: country.id,
                    survey_provider_id: this.providerId,
                    option_text: null,
                  });
                }
              }
            } else {
              precodes.push({
                option: '',
                precode: attr.qualification_code,
                country_id: country.id,
                survey_provider_id: this.providerId,
                option_text: null,
              });
            }
          }

          questions.push({ ...params, SurveyAnswerPrecodes: precodes });
          qualificationIds.push(attr.qualification_code);
        }

        // Insert Survey Question & Survey Answer Precode
        const result = await SurveyQuestion.bulkCreate(questions, {
          updateOnDuplicate: ['question_text', 'question_type', 'name'],
          include: [
            {
              model: SurveyAnswerPrecodes,
              ignoreDuplicates: true,
              // updateOnDuplicate: ["option_text"]
            },
          ],
        });

        const allQuestionsId = await SurveyQuestion.findAll({
          attributes: ['id'],
          where: {
            survey_provider_question_id: qualificationIds,
            survey_provider_id: this.providerId,
          },
        });

        const countryParams = allQuestionsId.map((r) => {
          return {
            country_id: country.id,
            survey_question_id: r.id,
          };
        });

        // Insert Country Survey Question
        await CountrySurveyQuestion.bulkCreate(countryParams, {
          ignoreDuplicates: true,
        });

        res.json({
          status: true,
          message: 'Question Updated',
          total: result.length,
          result,
        });
      } else {
        res.json({ status: false, message: 'No record found!' });
      }
      return;
    } catch (error) {
      console.error(error);
      res.json({ status: false, message: 'Something went wrong!' });
    }
  }

  /**
   * Schlesinger To create all the questions
   * URL: http://localhost:4000/callback/survey/schlesinger/question?country_id=225|226
   */
  async schlesingerSurveyQuestions(req, res) {
    try {
      const country = await Country.findOne({
        attributes: ['id', 'sago_language_id'],
        where: {
          id: req.query.country_id,
        },
      });
      if (country === null) {
        res.json({ status: false, message: 'Country not found!' });
        return;
      }

      const schObj = new SchlesingerHelper();
      const qualifications = await schObj.fetchDefinitionAPI(
        '/api/v1/definition/qualification-answers/lanaguge/' +
          country.sago_language_id
      );

      if (
        qualifications.result.success === true &&
        qualifications.result.totalCount != 0
      ) {
        const qualificationData = qualifications.qualifications;
        const qualificationIds = qualificationData.map(
          (r) => r.qualificationId
        );

        const insertParams = [];
        for (let attr of qualificationData) {
          let params = {
            question_text: attr.text,
            name: attr.name,
            survey_provider_id: this.providerId,
            survey_provider_question_id: attr.qualificationId,
            question_type: schObj.getQuestionType(attr.qualificationTypeId),
            created_at: new Date(),
          };

          let ansPrecode = [];
          let qualificationAnswers = attr.qualificationAnswers;
          for (let qa of qualificationAnswers) {
            /*if([3].includes(attr.qualificationTypeId) ){    // Ref to questionType
                            ansPrecode.push({
                                option: null,
                                precode: attr.qualificationId,
                            });
                        } else */
            if (
              [6].includes(attr.qualificationTypeId) &&
              attr.qualificationId == 59
            ) {
              // Age
              for (let i = 15; i <= 99; i++) {
                ansPrecode.push({
                  option: i,
                  precode: attr.qualificationId,
                  country_id: country.id,
                  survey_provider_id: this.providerId,
                  option_text: null,
                });
              }
            } else {
              ansPrecode.push({
                option: qa.answerId,
                precode: attr.qualificationId,
                country_id: country.id,
                survey_provider_id: this.providerId,
                option_text: qa.text,
              });
            }
          }
          insertParams.push({ ...params, SurveyAnswerPrecodes: ansPrecode });
        }

        await SurveyQuestion.bulkCreate(insertParams, {
          updateOnDuplicate: ['question_text', 'question_type', 'name'],
          include: [
            {
              model: SurveyAnswerPrecodes,
              ignoreDuplicates: true,
              // updateOnDuplicate: ["option_text"],
            },
          ],
        });

        const allQuestionsId = await SurveyQuestion.findAll({
          attributes: ['id'],
          where: {
            survey_provider_question_id: qualificationIds,
            survey_provider_id: this.providerId,
          },
        });

        const countryParams = allQuestionsId.map((r) => {
          return {
            country_id: country.id,
            survey_question_id: r.id,
          };
        });

        await CountrySurveyQuestion.bulkCreate(countryParams, {
          ignoreDuplicates: true,
        });

        res.json({ status: true, message: 'Updated' });
      } else {
        res.json(qualifications);
      }
      return;
    } catch (error) {
      // console.error(error);
      throw error;
    }
  }

  /**
   * Lucid Question & Answer Sync
   * URL: http://localhost:4000/callback/survey/lucid/question?type=question|options&country_id=225|226
   */
  async lucidSurveyQuestions(req, res) {
    try {
      const country = await Country.findOne({
        attributes: ['id', 'lucid_language_id'],
        where: {
          id: req.query.country_id,
        },
      });
      if (country === null || country.lucid_language_id == null) {
        res.json({ status: false, message: 'Country not found!' });
        return;
      }
      const lucidHelper = new LucidHelper();
      // START Question Syncing
      if (req.query.type === 'question') {
        const questions = await lucidHelper.fetchAndReturnData(
          'https://api.samplicio.us/Lookup/v1/QuestionLibrary/AllQuestions/' +
            country.lucid_language_id
        );
        let questionsArry = [];
        const qualificationIds = [];
        if (questions && questions.ResultCount && questions.ResultCount > 0) {
          let allQues = questions.Questions;
          let filteredQuestion = allQues.filter(
            (r) => r.QuestionType !== 'Dummy'
          ); // Question Type Dummy will not be accepted.

          for (let element of filteredQuestion) {
            questionsArry.push({
              question_text: element.QuestionText,
              name: element.Name,
              survey_provider_id: 1,
              survey_provider_question_id: element.QuestionID,
              question_type: element.QuestionType,
              created_at: new Date(),
            });
            qualificationIds.push(element.QuestionID);
          }
          const questionData = await SurveyQuestion.bulkCreate(questionsArry, {
            updateOnDuplicate: ['survey_provider_question_id'],
            ignoreDuplicates: true,
          });

          const allQuestionsId = await SurveyQuestion.findAll({
            attributes: ['id'],
            where: {
              survey_provider_question_id: qualificationIds,
              survey_provider_id: 1,
            },
          });
          const countryParams = allQuestionsId.map((r) => {
            return {
              country_id: country.id,
              survey_question_id: r.id,
            };
          });

          await CountrySurveyQuestion.bulkCreate(countryParams, {
            ignoreDuplicates: true,
          });
          res.send({
            message: 'Data Updated!',
            total_record: questionData.length,
            data: questionData,
          });
          return;
        }
      }
      // START Options Syncing
      else if (req.query.type === 'options') {
        let page = req.query.page ? req.query.page : 1;
        let limit = 40;
        let offset = (page - 1) * limit;

        let { count, rows } = await SurveyQuestion.findAndCountAll({
          attributes: ['survey_provider_question_id', 'question_type'],
          where: {
            survey_provider_id: 1,
          },
          include: {
            model: CountrySurveyQuestion,
            attributes: ['country_id'],
            where: {
              country_id: country.id,
            },
          },
          offset: offset,
          limit: limit,
        });

        let optionsArry = [];
        let surveyQuestions = rows;
        if (surveyQuestions.length > 0) {
          const lucidHelper = new LucidHelper();
          for (let question of surveyQuestions) {
            try {
              const quesOptions = await lucidHelper.questionOptions(
                country.lucid_language_id,
                question.survey_provider_question_id
              );

              if (quesOptions.ResultCount > 0 && quesOptions.QuestionOptions) {
                let options = quesOptions.QuestionOptions;
                if (
                  question.question_type == 'Numeric - Open-end' &&
                  question.survey_provider_question_id == 42
                ) {
                  for (let i = 15; i <= 99; i++) {
                    optionsArry.push({
                      option: i,
                      precode: question.survey_provider_question_id,
                      survey_provider_id: 1,
                      country_id: country.id,
                      option_text: null,
                    });
                  }
                } else if (question.question_type == 'Numeric - Open-end') {
                  optionsArry.push({
                    option: null,
                    survey_provider_id: 1,
                    precode: question.survey_provider_question_id,
                    country_id: country.id,
                    option_text: null,
                  });
                } else {
                  for (let opt of options) {
                    optionsArry.push({
                      option: opt.Precode,
                      precode: opt.QuestionID,
                      survey_provider_id: 1,
                      country_id: country.id,
                      option_text: opt.OptionText,
                    });
                  }
                }
              }
            } catch (error) {}
          }
          if (optionsArry.length) {
            const optionsData = await SurveyAnswerPrecodes.bulkCreate(
              optionsArry,
              {
                updateOnDuplicate: ['option', 'option_text'],
              }
            );
            res.send({
              message: 'Data Updated!',
              count,
              next_page: offset + limit >= count ? false : true,
              data: optionsData,
            });
          } else {
            res.send({
              message: 'Nothing to import',
            });
          }

          return;
        } else {
          res.send('No more question available!');
          return;
        }
      }
      res.send('Please add type!');
      return;
    } catch (error) {
      const logger = require('../../helpers/Logger')(`lucid-qna-errror.log`);
      logger.error(error);
      throw error;
    }
  }

  /**
   * Toluna Question & Answer Sync
   * URL: http://localhost:4000/callback/survey/toluna/question?country_id=225|226
   */
  async tolunaSurveyQuestions(req, res) {
    try {
      const country = await Country.findOne({
        attributes: ['id', 'toluna_culture_id'],
        where: {
          id: req.query.country_id,
        },
      });
      if (country === null || country.toluna_culture_id === null) {
        res.json({ status: false, message: 'Country not found!' });
        return;
      }

      const payload = {
        CultureIDs: [country.toluna_culture_id], //country
        CategoryIDs: [2, 3], // 3=personal, 2=Basic
        LastUpdateDate: '',
        IncludeComputed: 'true',
        IncludeRoutables: 'true',
        IncludeDemographics: 'true',
      };
      const tObj = new TolunaHelper();
      const questions = await tObj.getQuestionsAnswer(payload);
      const qualificationIds = [];
      const params = questions.map((qs) => {
        let surveyAnswerPrecodes = qs.TranslatedAnswers.map((ans) => {
          return {
            survey_provider_id: this.providerId,
            precode: qs.TranslatedQuestion.QuestionID,
            option: ans.AnswerID,
            country_id: country.id,
            option_text: ans.AnswerInternalName,
          };
        });

        let params = {
          question_text: qs.TranslatedQuestion.DisplayNameTranslation,
          name: qs.InternalName,
          survey_provider_id: this.providerId,
          survey_provider_question_id: qs.TranslatedQuestion.QuestionID,
          question_type: qs.AnswerType,
          created_at: new Date(),
          SurveyAnswerPrecodes: surveyAnswerPrecodes,
        };
        qualificationIds.push(qs.TranslatedQuestion.QuestionID);
        return params;
      });

      const result = await SurveyQuestion.bulkCreate(params, {
        updateOnDuplicate: ['question_text', 'question_type', 'name'],
        include: [
          {
            model: SurveyAnswerPrecodes,
            updateOnDuplicate: ['option', 'option_text'],
          },
        ],
      });

      const allQuestionsId = await SurveyQuestion.findAll({
        attributes: ['id'],
        where: {
          survey_provider_question_id: qualificationIds,
          survey_provider_id: this.providerId,
        },
      });

      const countryParams = allQuestionsId.map((r) => {
        return {
          country_id: country.id,
          survey_question_id: r.id,
        };
      });
      // Insert Country Survey Question
      if (countryParams.length) {
        await CountrySurveyQuestion.bulkCreate(countryParams, {
          ignoreDuplicates: true,
        });
      }

      res.send({
        message: 'Data Updated!',
        data: result,
      });
      return;
    } catch (error) {
      const logger = require('../../helpers/Logger')(`toluna-qna-errror.log`);
      logger.error(error);
      throw error;
    }
  }

  /****************************************************
   ************* SQS Functions ***********************
   ****************************************************/

  /**
   * Schlesiner Survey Sync through SQS
   */
  async schlesingerSurveySaveToSQS() {
    try {
      const provider = await SurveyProvider.findOne({
        attributes: ['id'],
        where: {
          name: 'Schlesinger',
        },
      });

      if (!provider) {
        return {
          status: false,
          message: 'Invalid provider',
        };
      }
      const providerId = provider.id;
      const psObj = new SchlesingerHelper();
      const allSurveys = await psObj.fetchSellerAPI(
        '/api/v2/survey/allocated-surveys'
      );

      if (allSurveys.Result.Success && allSurveys.Result.TotalCount != 0) {
        const surveyData = allSurveys.Surveys.filter(
          (sr) => sr.LOI < 20 && sr.CPI >= 0.5
        );
        // const surveyData = allSurveys.Surveys.filter(sr => sr.LanguageId === this.schlesingerLanguageId && sr.LOI < 20 && sr.CPI >= 0.5);

        if (!surveyData.length) {
          return {
            status: true,
            message: 'No survey found for this language!',
          };
        }
        const localizationCodes = allSurveys.Surveys.map((r) => r.LanguageId);
        const getCountry = await Country.findAll({
          attributes: ['id', 'sago_language_id'],
          where: {
            sago_language_id: localizationCodes,
          },
        });

        const ids = surveyData.map((r) => r.SurveyId);
        const dbSurveys = await Survey.findAll({
          attributes: ['original_json', 'survey_number'],
          where: {
            survey_provider_id: providerId,
            status: 'live',
            survey_number: ids,
          },
        });
        const ageAnswers = await SurveyAnswerPrecodes.findAll({
          attributes: ['id', 'country_id', 'option', 'precode'],
          where: {
            survey_provider_id: providerId,
            precode: 59,
          },
        });

        const responses = [];
        const sqsHelper = new SqsHelper();
        for (let element of surveyData) {
          var surveyId;
          var body = {};
          const index = dbSurveys.findIndex(
            (row) => +row.survey_number === +element.SurveyId
          );

          if (index != -1) {
            // If matched and index found
            const qualifications = await psObj.fetchSellerAPI(
              '/api/v2/survey/survey-qualifications/' + element.SurveyId
            );
            if (
              qualifications.Result.Success &&
              qualifications.Result.TotalCount != 0
            ) {
              let surveyQl = qualifications.SurveyQualifications;
              for (let ql of surveyQl) {
                let match = dbSurveys[index].original_json.qualifications.some(
                  (r) => r.UpdateTimeStamp === ql.UpdateTimeStamp
                );
                if (!match) {
                  body = {
                    ...element,
                    survey_provider_id: providerId,
                    qualifications: surveyQl,
                  };
                }
              }
            }
          } else {
            surveyId = element.SurveyId;
            const qualifications = await psObj.fetchSellerAPI(
              '/api/v2/survey/survey-qualifications/' + surveyId
            );
            if (
              qualifications.Result.Success &&
              qualifications.Result.TotalCount != 0
            ) {
              body = {
                ...element,
                survey_provider_id: providerId,
                qualifications: qualifications.SurveyQualifications,
              };
            }
          }
          if ('qualifications' in body) {
            let countryData = getCountry.find(
              (r) => +r.sago_language_id === +element.LanguageId
            );
            if (
              countryData !== null &&
              typeof countryData !== 'undefined' &&
              'id' in countryData &&
              countryData.id
            ) {
              body.country_id = countryData.id;
              body.db_qualication_codes = [];

              // This block of codes will check the Age is exists of the qualifications or not. If [yes] then the range calculation checked and find the ids from the DB records and append the ids in the Surveya array.
              // The plan is to reduce the CPU utilization of RDS when checking same things on SQS.
              let checkAgeQualification = body.qualifications.find(
                (q) => q.QualificationId == 59
              );
              if (
                checkAgeQualification &&
                checkAgeQualification.AnswerIds &&
                checkAgeQualification.AnswerIds.length
              ) {
                let range = checkAgeQualification.AnswerIds[0].split('-');
                body.db_qualication_codes.push({
                  qualification_id: checkAgeQualification.QualificationId,
                  answer_ids: ageAnswers
                    .filter(
                      (r) =>
                        +r.country_id === +countryData.id &&
                        +range[0] <= +r.option &&
                        +range[1] >= +r.option
                    )
                    .map((r) => r.id),
                });
              }

              const send_message = await sqsHelper.sendData(body);
              responses.push(send_message);
              // responses.push(body);
            }
          }
        }
        // res.send({
        //     message: 'Sending to SQS',
        //     total: responses.length,
        //     data: responses
        // })
        return {
          message: 'Sending to SQS',
          data: responses,
        };
      } else {
        return {
          message: 'No survey found!',
        };
        // res.send('No survey found!');
      }
    } catch (error) {
      console.error(error);
      const logger = require('../../helpers/Logger')(
        `schlesinger-sync-errror.log`
      );
      logger.error(error);
      // res.send(error);
      return {
        error: error.message,
      };
    }
  }

  /**
   * Pure Spectrum Survey Sync through SQS
   */
  async pureSpectrumSurveySaveToSQS() {
    try {
      const provider = await SurveyProvider.findOne({
        attributes: ['id'],
        where: {
          name: 'Purespectrum',
        },
      });

      if (!provider) {
        return {
          status: false,
          message: 'Invalid provider',
        };
      }
      const providerId = provider.id;
      const psObj = new PurespectrumHelper();
      const allSurveys = await psObj.fetchAndReturnData('/surveys');
      if ('success' === allSurveys.apiStatus && allSurveys.surveys) {
        const surveyIds = allSurveys.surveys
          .filter(
            (sr) =>
              sr.survey_status == 22 &&
              sr.survey_performance.overall.loi < 20 &&
              sr.cpi >= 0.5
          )
          .map((sr) => sr.survey_id);
        const localizationCodes = allSurveys.surveys.map(
          (r) => r.surveyLocalization
        );
        const getCountry = await Country.findAll({
          attributes: ['id', 'language_code'],
          where: {
            language_code: localizationCodes,
          },
        });

        const existingSurveys = await Survey.findAll({
          attributes: ['survey_number'],
          where: {
            survey_provider_id: providerId,
            status: 'live',
            survey_number: surveyIds,
          },
        });

        const allowedIds = existingSurveys.length
          ? surveyIds.filter((id) =>
              existingSurveys.some((r) => +r.survey_number !== +id)
            )
          : surveyIds;
        const ageAnswers = await SurveyAnswerPrecodes.findAll({
          attributes: ['id', 'country_id', 'option', 'precode'],
          where: {
            survey_provider_id: providerId,
            precode: 212,
          },
        });

        const responses = [];
        if (allowedIds.length) {
          const sqsHelper = new SqsHelper();
          for (let survey_id of allowedIds) {
            try {
              let result = await psObj.getSurveyData(survey_id);
              if (result.is_active == true) {
                let body = {
                  ...result.data,
                  survey_provider_id: providerId,
                };

                let countryData = getCountry.find(
                  (r) => r.language_code === result.data.surveyLocalization
                );
                if (
                  countryData !== null &&
                  typeof countryData !== 'undefined' &&
                  'id' in countryData &&
                  countryData.id
                ) {
                  body.country_id = countryData.id;
                  body.db_qualication_codes = [];

                  // This block of codes will check the Age is exists of the qualifications or not. If [yes] then the range calculation checked and find the ids from the DB records and append the ids in the Surveya array.
                  // The plan is to reduce the CPU utilization of RDS when checking same things on SQS.
                  let checkAgeQualification = body.qualifications.find(
                    (q) => q.qualification_code == 212
                  );
                  if (
                    checkAgeQualification &&
                    checkAgeQualification.range_sets &&
                    checkAgeQualification.range_sets.length
                  ) {
                    let range = checkAgeQualification.range_sets[0];
                    body.db_qualication_codes.push({
                      qualification_id:
                        checkAgeQualification.qualification_code,
                      answer_ids: ageAnswers
                        .filter(
                          (r) =>
                            +r.country_id === +countryData.id &&
                            +range.from <= +r.option &&
                            +range.to >= +r.option
                        )
                        .map((r) => r.id),
                    });
                  }

                  let sendMessage = await sqsHelper.sendData(body);
                  responses.push(sendMessage);
                  // responses.push(body);
                }
              }
            } catch (error) {}
          }
        }
        return {
          message: 'Sending to SQS',
          data: responses,
        };
        // res.send({
        //     message: 'Sending to SQS',
        //     data: responses
        // });
      } else {
        // res.send('No survey found!');
        return {
          message: 'No survey found!',
        };
      }
    } catch (error) {
      console.error(error);
      const logger = require('../../helpers/Logger')(
        `purespectrum-sync-errror.log`
      );
      logger.error(error);
      // res.send(error);
      return {
        message: error.message,
      };
    }
  }

  /****************************************************
   ************* CRON Functions ***********************
   ****************************************************/

  /**
   * Pure Spectrum - Old Survey disabled
   */
  async pureSpectrumSurveyUpdate() {
    try {
      const provider = await SurveyProvider.findOne({
        attributes: ['id'],
        where: {
          name: 'Purespectrum',
        },
      });

      if (!provider) {
        return {
          status: false,
          message: 'Invalid provider',
        };
        // res.send({
        //     status: false,
        //     message: 'Invalid provider'
        // });
      }

      const psObj = new PurespectrumHelper();
      const surveys = await Survey.findAll({
        attributes: ['survey_number'],
        where: {
          survey_provider_id: provider.id,
          status: psObj.getSurveyStatus(22),
          updated_at: {
            [Op.lt]: moment().format('YYYY-MM-DD'),
          },
        },
        order: [['id', 'ASC']],
        limit: 20,
      });

      if (surveys.length < 1) {
        // res.send({ status: true, message: 'No more survey exists!' });
        return { status: true, message: 'No more survey exists!' };
      }

      //Survey disabled by adding deleted_at value
      const surveyNumberArry = surveys.map((s) => s.survey_number);
      await Survey.update(
        {
          deleted_at: new Date(),
        },
        {
          where: {
            survey_number: surveyNumberArry,
          },
        }
      );

      const surveyNumber = [];
      for (let survey of surveys) {
        try {
          const surveyData = await psObj.fetchAndReturnData(
            '/surveys/' + survey.survey_number
          );
          if (
            surveyData.apiStatus === 'success' &&
            surveyData.survey.survey_status !== 22
          ) {
            surveyNumber.push(survey.survey_number);
          }
        } catch (error) {
          surveyNumber.push(survey.survey_number);
        }
      }

      if (surveyNumber.length) {
        await Survey.update(
          {
            status: psObj.getSurveyStatus(44),
            // deleted_at: new Date()
          },
          {
            paranoid: false,
            where: {
              survey_number: surveyNumber,
            },
          }
        );
      }

      // Available survey making active by removing the deleted_at value
      const idTobeUpdated = surveyNumberArry.filter(
        (row) => !surveyNumber.includes(row)
      );
      if (idTobeUpdated.length) {
        await Survey.update(
          {
            deleted_at: null,
          },
          {
            paranoid: false,
            where: {
              survey_number: idTobeUpdated,
            },
          }
        );
      }
      return {
        status: true,
        total: surveyNumber.length,
        message: 'Updated',
        survey_number: surveyNumber,
      };
      // res.send({ status: true, total: surveyNumber.length, message: 'Updated', survey_number: surveyNumber });
    } catch (error) {
      const logger = require('../../helpers/Logger')(`cron.log`);
      logger.error(error);
      return {
        error: error.message,
      };
    }
  }

  /**
   * Schlesinger - Old Survey disabled
   */
  async schlesingerSurveyUpdate() {
    try {
      const provider = await SurveyProvider.findOne({
        attributes: ['id'],
        where: {
          name: 'Schlesinger',
        },
      });

      if (!provider) {
        // res.send({
        //     status: false,
        //     message: 'Invalid provider'
        // });
        return {
          status: false,
          message: 'Invalid provider',
        };
      }

      const psObj = new SchlesingerHelper();
      const surveys = await Survey.findAll({
        attributes: ['survey_number', 'updated_at'],
        where: {
          survey_provider_id: provider.id,
          status: 'live',
          updated_at: {
            [Op.lt]: moment().format('YYYY-MM-DD'),
          },
        },
        order: [['id', 'ASC']],
        limit: 20,
      });

      if (surveys.length < 1) {
        // res.send({ status: true, message: 'No more survey exists!' });
        return { status: true, message: 'No more survey exists!' };
      }

      //Survey disabled by adding deleted_at value
      const surveyNumberArry = surveys.map((s) => s.survey_number);
      await Survey.update(
        {
          deleted_at: new Date(),
        },
        {
          where: {
            survey_number: surveyNumberArry,
          },
        }
      );

      const surveyNumber = [];
      for (let survey of surveys) {
        try {
          const surveyData = await psObj.fetchSellerAPI(
            '/api/v2/survey/survey-quotas/' + survey.survey_number
          );
          if (surveyData.SurveyQuotas && surveyData.SurveyQuotas.length < 1) {
            surveyNumber.push(survey.survey_number);
          }
        } catch (error) {
          //console.log(survey.survey_number)
          // surveyNumber.push(survey.survey_number);
        }
      }

      if (surveyNumber.length) {
        await Survey.update(
          {
            status: 'closed',
            // deleted_at: new Date()
          },
          {
            paranoid: false,
            where: {
              survey_number: surveyNumber,
            },
          }
        );
      }

      // Available survey making active by removing the deleted_at value
      const idTobeUpdated = surveyNumberArry.filter(
        (row) => !surveyNumber.includes(row)
      );
      if (idTobeUpdated.length) {
        await Survey.update(
          {
            deleted_at: null,
          },
          {
            paranoid: false,
            where: {
              survey_number: idTobeUpdated,
            },
          }
        );
      }
      // res.send({ status: true, total: surveyNumber.length, message: 'Updated', survey_number: surveyNumber });
      return {
        status: true,
        total: surveyNumber.length,
        message: 'Updated',
        survey_number: surveyNumber,
      };
    } catch (error) {
      const logger = require('../../helpers/Logger')(`cron.log`);
      logger.error(error);
      return {
        message: error.message,
      };
    }
  }

  /**
   * Lucid - Old Survey disabled
   */
  async lucidSurveyUpdate() {
    try {
      const provider = await SurveyProvider.findOne({
        attributes: ['id'],
        where: {
          name: 'Lucid',
        },
      });
      if (!provider) {
        return {
          status: false,
          message: 'Invalid provider',
        };
      }
      const psObj = new LucidHelper();
      const surveys = await Survey.findAll({
        attributes: ['survey_number'],
        where: {
          survey_provider_id: provider.id,
          status: 'active',
          updated_at: { [Op.ne]: new Date() },
        },
        order: [['loi', 'ASC']],
        limit: 15,
      });

      if (surveys.length < 1) {
        // res.send({ status: true, message: 'No more survey exists!' });
        return { status: true, message: 'No more survey exists!' };
      }

      //Survey disabled by adding deleted_at value
      const surveyNumberArry = surveys.map((s) => s.survey_number);
      await Survey.update(
        {
          deleted_at: new Date(),
        },
        {
          where: {
            survey_number: surveyNumberArry,
          },
        }
      );

      const surveyNumber = [];
      for (let survey of surveys) {
        try {
          const quota = await psObj.showQuota(survey.survey_number);
          if (quota.SurveyStillLive == false) {
            surveyNumber.push(survey.survey_number);
          }
        } catch (error) {
          surveyNumber.push(survey.survey_number);
        }
      }

      if (surveyNumber.length) {
        await Survey.update(
          {
            status: 'draft',
            deleted_at: new Date(),
          },
          {
            paranoid: false,
            where: {
              survey_number: surveyNumber,
            },
          }
        );
      }

      // Available survey making active by removing the deleted_at value
      const idTobeUpdated = surveyNumberArry.filter(
        (row) => !surveyNumber.includes(row)
      );
      if (idTobeUpdated.length) {
        await Survey.update(
          {
            deleted_at: null,
          },
          {
            paranoid: false,
            where: {
              survey_number: idTobeUpdated,
            },
          }
        );
      }

      // res.send({ status: true, total: surveyNumber.length, message: 'Updated', survey_number: surveyNumber });
      return {
        status: true,
        total: surveyNumber.length,
        message: 'Updated',
        survey_number: surveyNumber,
      };
    } catch (error) {
      const logger = require('../../helpers/Logger')(`cron.log`);
      logger.error(error);
      return {
        message: error.message,
      };
    }
  }

  /**
   * Delete survey from DB
   */
  async removeSurvey() {
    try {
      const sql = `DELETE
                    surveys,
                    survey_qualifications
                FROM
                    surveys
                JOIN survey_qualifications ON(
                        surveys.id = survey_qualifications.survey_id
                    )
                WHERE
                    surveys.survey_number NOT IN(
                    SELECT
                        survey_number
                    FROM
                        member_surveys
                    WHERE
                        survey_provider_id IN(1, 3, 4)
                ) AND surveys.deleted_at IS NOT NULL AND surveys.status IN (:status);`;

      await sequelize.query(sql, {
        type: QueryTypes.DELETE,
        replacements: { status: ['closed', 'draft'] },
      });
      return { status: true, message: 'Success' };
    } catch (error) {
      const logger = require('../../helpers/Logger')(`cron.log`);
      logger.error(error);
      return {
        status: false,
        message: 'error',
      };
    }
  }
}

module.exports = SurveySyncController;
