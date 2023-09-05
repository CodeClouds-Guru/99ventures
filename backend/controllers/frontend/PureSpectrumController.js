const {
  Member,
  Survey,
  SurveyProvider,
  SurveyQuestion,
  SurveyQualification,
  SurveyAnswerPrecodes,
  MemberEligibilities,
} = require('../../models');
const PurespectrumHelper = require('../../helpers/Purespectrum');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
class PureSpectrumController {
  constructor() {
    this.surveys = this.surveys.bind(this);
    this.generateEntryLink = this.generateEntryLink.bind(this);
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
          name: 'Purespectrum',
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
        ps_supplier_respondent_id: member.username,
        ps_supplier_sid: Date.now(),
      };
      const matchingQuestionIds = [];
      const matchingAnswerIds = [];
      eligibilities.forEach((eg) => {
        queryString[eg.survey_provider_question_id] = eg.option
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
            let link = `/purespectrum/entrylink?survey_number=${
              survey.survey_number
            }${generateQueryString ? '&' + generateQueryString : ''}`;
            let cpiValue = (+survey.cpi * +provider.currency_percent)/100;
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
    const psObj = new PurespectrumHelper();
    const queryString = req.query;
    try {
      const survey = await psObj.fetchAndReturnData(
        '/surveys/' + queryString.survey_number
      );
      if (
        survey.apiStatus === 'success' &&
        survey.survey.survey_status === 22
      ) {
        // 22 means live
        if (process.env.DEV_MODE == '1') {
          queryString.bsec = 'a70mx8';
        }
        const data = await psObj.createData(
          `surveys/register/${queryString.survey_number}`
        );
        delete queryString['survey_number'];
        const generateQueryString = new URLSearchParams(queryString).toString();

        if (data.apiStatus === 'success' && data.survey_entry_url) {
          const entryLink = data.survey_entry_url + '&' + generateQueryString;
          res.redirect(entryLink);
          return;
        } else {
          throw { statusCode: 404, message: 'Unable to get entry link' };
        }
      } else {
        throw {
          statusCode: 404,
          message: 'Sorry! this survey has been closed',
        };
      }
    } catch (error) {
      if (
        ('response' in error &&
          error.response.data.statusCode &&
          error.response.data.statusCode === 404) ||
        error.statusCode === 404
      ) {
        await Survey.update(
          {
            status: psObj.getSurveyStatus(44),
            deleted_at: new Date(),
          },
          {
            where: {
              survey_number: queryString.survey_number,
            },
          }
        );
      }
      res.redirect('/survey-notavailable');
    }
  };
}

module.exports = PureSpectrumController;
