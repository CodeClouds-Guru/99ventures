const {
  Member,
  Survey,
  SurveyProvider,
  MemberEligibilities,
  CountrySurveyQuestion,
} = require('../../models');

const SchlesingerHelper = require('../../helpers/Schlesinger');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
class SchlesingerController {
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
    var redirectURL = '';
    var returnObj = {};
    try {
      const queryString = req.query;
      const surveyNumber = queryString['survey_number'];
      const data = await Survey.findOne({
        attributes: ['original_json'],
        where: {
          survey_number: surveyNumber,
        },
      });

      if (data && data.original_json) {
        const schObj = new SchlesingerHelper();
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
            params.pid = Date.now() + '-' + surveyNumber;
            delete liveLinkParams['zid']; // We dont have any value for zid
            const entryLink =
              liveLinkArry[0] +
              '?' +
              new URLSearchParams({ ...liveLinkParams, ...params }).toString();
            // res.send(entryLink)
            res.redirect(entryLink);
            return;
          } else {
            this.updateSurvey(surveyNumber);
            // returnObj = { notice: 'No quota exists!', redirect_url: '/schlesinger' };
            redirectURL = '/survey-quota';
          }
        } else {
          this.updateSurvey(surveyNumber);
          // returnObj = { notice: 'Survey quota does not exists!', redirect_url: '/schlesinger' };
          redirectURL = '/survey-quota';
        }
      } else {
        // returnObj = { notice: 'Unable to get entry link!', redirect_url: '/schlesinger' };
        redirectURL = '/survey-notavailable';
      }
    } catch (error) {
      console.error(error);
      // returnObj = { notice: error.message, redirect_url: '/schlesinger' };
      redirectURL = '/survey-notavailable';
    }

    res.redirect(redirectURL);
    // req.session.flash = returnObj;
    // res.redirect('/notice');
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
}

module.exports = SchlesingerController;
