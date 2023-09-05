const {
  sequelize,
  Member,
  Survey,
  SurveyProvider,
  SurveyQuestion,
  SurveyQualification,
  SurveyAnswerPrecodes,
  MemberEligibilities,
} = require('../../models');
const { Op, QueryTypes } = require('sequelize');
const LucidHelper = require('../../helpers/Lucid');
const { generateHashForLucid } = require('../../helpers/global');
const Sequelize = require('sequelize');

class LucidController {
  constructor() {
    this.surveys = this.surveys.bind(this);
    this.rebuildEntryLink = this.rebuildEntryLink.bind(this);
    this.addEntryLink = this.addEntryLink.bind(this);
    this.generateQueryString = this.generateQueryString.bind(this);
  }

  /*surveys1 = async (req, res) => {
        const eligibilities = await MemberEligibilities.getEligibilities(226, 1, 160);
        const matchingQuestionIds = [];
        eligibilities.forEach(eg => {
            matchingQuestionIds.push(eg.survey_question_id);
        });

        const surveys = await Survey.findAndCountAll({
            attributes: ['id', 'survey_provider_id', 'loi', 'cpi', 'survey_number', 'created_at', 'name'],
            distinct: true,
            where: {
                survey_provider_id: 1,
                status: "active",
                country_id: 226
            },
            include: {
                model: SurveyQualification,
                attributes: ['id', 'survey_question_id'],
                where: {
                    survey_question_id: matchingQuestionIds //[109011, 109010, 109012, 109013]
                },
                required: true,
                include: {
                    model: SurveyAnswerPrecodes,
                    attributes: ['id', 'option', 'precode'],
                    required: true,
                    // include: [
                    //     {
                    //         model: SurveyQuestion,
                    //         attributes: ['id'],
                    //         where: {
                    //             id: [109011, 109010, 109012]
                    //         }
                    //     }
                    // ],
                }
            },
            order: [[sequelize.literal('created_at'), 'desc']],
            limit: 100,
            offset: (1 - 1) * 10,
        });

        const surveyData = [];

        surveys.rows.forEach((record, index) => {
            let findAnsResult = [];
            record.SurveyQualifications.forEach(r=> {
                let findQs = eligibilities.find(t=> t.survey_question_id == r.survey_question_id);
                if(findQs !== undefined){
                    let findAns = r.SurveyAnswerPrecodes.find(j=> findQs.survey_answer_precode_id == j.id);
                    if(findAns === undefined){
                        findAnsResult = [];
                    } else 
                        findAnsResult.push(findAns);                    
                }                
            });
            // console.log(findAnsResult.length +'==='+ record.SurveyQualifications.length)
            if(findAnsResult.length === record.SurveyQualifications.length){
                surveyData.push(record);
            }
        });
        // for (let survey of surveyData) {
        //     const queryString = {};
        //     for(let qual of survey.SurveyQualifications) {
        //         let findEl = eligibilities.find(el => el.survey_question_id == qual.survey_question_id);
        //         if(findEl !== undefined) {
        //             queryString[findEl.survey_provider_question_id] = findEl.option
        //         }

        //         if(Object.keys(queryString).length == 2) {
        //             break;
        //         }
        //     }

        //     console.log(queryString)
        // }
        res.send(surveyData);
        return;

    }*/

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
          name: 'Lucid',
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
      const queryString = {};
      const matchingQuestionIds = [];
      const matchingAnswerIds = [];
      eligibilities.forEach((eg) => {
        // queryString[eg.survey_provider_question_id] = eg.option ? eg.option : eg.open_ended_value;
        matchingQuestionIds.push(eg.survey_question_id);
        if (eg.survey_answer_precode_id !== null) {
          matchingAnswerIds.push(+eg.survey_answer_precode_id);
        }
        if (eg.open_ended_value) {
          queryString[eg.survey_provider_question_id] = eg.open_ended_value;
        }
      });
      //const generateQueryString = new URLSearchParams(queryString).toString();
      /** End */

      if (matchingAnswerIds.length && matchingQuestionIds.length) {
        const acceptedSurveys = await Member.acceptedSurveys(
          memberId,
          provider.id
        );
        var clause = {};
        if (acceptedSurveys.length) {
          const attemptedSurveysNumber = acceptedSurveys.map(
            (r) => r.survey_number
          );
          clause = {
            survey_number: {
              [Op.notIn]: attemptedSurveysNumber,
            },
          };
        }
        const surveys = await Survey.findAndCountAll({
          attributes: [
            'id',
            'survey_provider_id',
            'loi',
            'cpi',
            'survey_number',
            'created_at',
            'name',
          ],
          distinct: true,
          where: {
            survey_provider_id: provider.id,
            ...clause,
          },
          include: {
            model: SurveyQualification,
            attributes: ['id', 'survey_question_id'],
            required: true,
            where: {
              survey_question_id: matchingQuestionIds,
            },
            include: {
              model: SurveyAnswerPrecodes,
              attributes: ['id', 'option', 'precode'],
              required: true,
            },
          },
          order: [[sequelize.literal(orderBy), order]],
          limit: perPage,
          offset: (pageNo - 1) * perPage,
        });

        if (!surveys.count) {
          return {
            status: false,
            message: 'No matching surveys!',
          };
        }
        const surveyData = [];
        surveys.rows.forEach((record, index) => {
          let findAnsResult = [];
          record.SurveyQualifications.forEach((r) => {
            let findQs = eligibilities.find(
              (t) => t.survey_question_id == r.survey_question_id
            );
            if (findQs !== undefined) {
              let findAns = r.SurveyAnswerPrecodes.find(
                (j) => findQs.survey_answer_precode_id == j.id
              );
              if (findAns === undefined) {
                findAnsResult = [];
              } else findAnsResult.push(findAns);
            }
          });
          if (findAnsResult.length === record.SurveyQualifications.length) {
            surveyData.push(record);
          }
        });

        var page_count = Math.ceil(surveys.count / perPage);
        var survey_list = [];
        if (surveyData && surveyData.length) {
          for (let survey of surveyData) {
            let eligibilityStr = this.generateQueryString(
              queryString,
              survey.SurveyQualifications,
              eligibilities
            );
            let link = `/lucid/entrylink?survey_number=${survey.survey_number}&uid=${member.username}&${eligibilityStr}`;
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
    try {
      const lcObj = new LucidHelper();
      const surveyNumber = req.query.survey_number;
      const quota = await lcObj.showQuota(surveyNumber);

      const queryParams = req.query;
      const params = {
        MID: Date.now(),
        PID: req.query.uid,
        ...queryParams,
      };
      delete params.survey_number;
      delete params.uid;

      if (quota.SurveyStillLive == true || quota.SurveyStillLive == 'true') {
        const survey = await Survey.findOne({
          attributes: ['url'],
          where: {
            survey_number: surveyNumber,
            survey_provider_id: 1,
          },
        });

        var entryLink;
        if (survey && survey.url !== null) {
          entryLink = survey.url;
        } else {
          try {
            //Sometimes the survey entrylink not created and API sending 404 response.
            //That's why making this survey to draft as catch block
            const result = await lcObj.createEntryLink(surveyNumber);
            if (result.data && result.data.SupplierLink) {
              const url =
                process.env.DEV_MODE == '0'
                  ? result.data.SupplierLink.LiveLink
                  : result.data.SupplierLink.TestLink;
              await this.addEntryLink(surveyNumber, url);
              entryLink = url;
            }
          } catch (error) {
            //If entry link already created but unable to find from DB
            //that's why API has been used to get the entry link and again store in DB
            if (error.response.status === 409) {
              const result = await lcObj.getEntryLink(surveyNumber);
              if (result.ResultCount !== null && result.SupplierLink) {
                const url =
                  process.env.DEV_MODE == '0'
                    ? result.SupplierLink.LiveLink
                    : result.SupplierLink.TestLink;
                await this.addEntryLink(surveyNumber, url);
                entryLink = url;
              }
            } else {
              throw {
                survey_number: surveyNumber,
                message: 'Sorry! Survey not found.',
              };
            }
          }
        }
        let URL = this.rebuildEntryLink(entryLink, params);
        console.log('Lucid entry link', URL);
        res.redirect(URL);
        return;
      } else {
        throw {
          survey_number: surveyNumber,
          message: 'Sorry! Survey is not live now.',
        };
      }
    } catch (error) {
      if ('survey_number' in error && error.survey_number) {
        await Survey.update(
          {
            status: 'draft',
            deleted_at: new Date(),
          },
          {
            where: {
              survey_number: error.survey_number,
            },
          }
        );
      }
      res.redirect('/survey-notavailable');
    }
  };

  /**
   * Rebuild the entry link with hash
   * NOTE: When hashing URLs the base string should include the entire URL, up to and including the `&` preceding the hashing parameter.
   */
  rebuildEntryLink = (url, queryParams) => {
    if (process.env.DEV_MODE == '0') {
      // 0 = live
      var url = url.replace('&PID=', '');
      const params = new URLSearchParams(queryParams).toString();
      const urlTobeHashed = url + '&' + params + '&';
      const hash = generateHashForLucid(urlTobeHashed);
      return url + '&' + params + '&hash=' + hash;
    } else {
      delete queryParams.PID;
      const params = new URLSearchParams(queryParams).toString();
      const urlTobeHashed = url + '&' + params + '&';
      const hash = generateHashForLucid(urlTobeHashed);
      return url + '&' + params + '&hash=' + hash;
    }
  };

  addEntryLink = async (surveyNumber, url) => {
    await sequelize.query(
      'UPDATE surveys SET url = :url WHERE survey_number = :survey_number AND survey_provider_id = :provider_id',
      {
        replacements: { url: url, survey_number: surveyNumber, provider_id: 1 },
        type: QueryTypes.UPDATE,
      }
    );
    return true;
  };

  generateQueryString = (queryString, qualifications, eligibilities) => {
    let quesStr = {};
    let limit = 5; // 5 is set because Lucid have a limitation to set the querystring in the URL.
    let countStr = Object.keys(queryString).length;
    for (let qual of qualifications) {
      let findEl = eligibilities.find(
        (el) => el.survey_question_id == qual.survey_question_id
      );
      if (findEl !== undefined) {
        quesStr[findEl.survey_provider_question_id] = findEl.option;
      }

      if (Object.keys(quesStr).length + countStr === limit) {
        break;
      }
    }
    return new URLSearchParams({ ...queryString, ...quesStr }).toString();
  };
}

module.exports = LucidController;
