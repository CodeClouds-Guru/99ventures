const {
    Member,
    Survey,
    SurveyProvider,
    SurveyQuestion,
    SurveyQualification,
    SurveyAnswerPrecodes,
    MemberEligibilities
} = require('../../models');
const SchlesingerHelper = require('../../helpers/Schlesinger');
const { Op } = require('sequelize')
const Sequelize = require('sequelize');
class SchlesingerController {

    constructor() {
        this.surveys = this.surveys.bind(this);
        this.generateEntryLink = this.generateEntryLink.bind(this);
    }

    surveys = async(memberId,params) => {
        try{
            // const memberId = req.query.user_id;
            if (!memberId) {
                return {
                    staus: false,
                    message: 'Member id not found!'
                }
            }
            const provider = await SurveyProvider.findOne({
                attributes: ['id'],
                where: {
                    name: 'Schlesinger'
                }
            });
            if (!provider) {
                return {
                    status: false,
                    message: 'Survey Provider not found!'
                }
            }
            const pageNo = 'pageno' in params ? parseInt(params.pageno) : 1;
            const perPage = 'perpage' in params ? parseInt(params.perpage) : 12;
            const orderBy = 'orderby' in params ? params.orderby : 'created_at';
            const order = 'order' in params ? params.order : 'desc';
            /**
             * check and get member's eligibility
             */
            const eligibilities = await MemberEligibilities.findAll({
                attributes: ['survey_question_id', 'survey_answer_precode_id', 'text', 'id'],
                where: {
                    member_id: memberId
                },
                include: [
                    {
                        model: SurveyQuestion,
                        attributes: ['name', 'survey_provider_question_id', 'question_type', 'id'],
                        where: {
                            survey_provider_id: provider.id
                        }
                    },
                    {
                        model: Member,
                        attributes: ['username']
                    },
                    {
                        model: SurveyAnswerPrecodes,
                        attributes: ['id', 'option', 'precode'],
                        where: {
                            survey_provider_id: provider.id
                        }
                    }
                ]
            });
            if (!eligibilities) {
                res.json({
                    status: false,
                    message:'You are not eligible for this survey!'
                });
                return;
            }

            const matchingQuestionIds = eligibilities.map(eg => eg.SurveyQuestion.id);
            const matchingAnswerIds = eligibilities.map(eg => eg.survey_answer_precode_id);

            /** Get Open Ended QnA Start */
            const eligibilityIds = eligibilities.map(eg => eg.id);
            const openEndedData =  await MemberEligibilities.findAll({
                attributes: ['survey_question_id', 'open_ended_value'],
                where: {
                    member_id: memberId,
                    id: {
                        [Op.notIn]: eligibilityIds
                    }
                },
                include: {
                    model: SurveyQuestion,
                    attributes: ['id', 'survey_provider_question_id', 'question_type'],
                    where: {
                        survey_provider_id: provider.id
                    }
                }
            });
            /** end */

            /** Query String Formation Start */
            const queryString = {
                uid: eligibilities[0].Member.username
            };
            eligibilities.forEach(eg => {
                queryString['Q' + eg.SurveyQuestion.survey_provider_question_id] = eg.SurveyAnswerPrecode.option;
            });
            if(openEndedData && openEndedData.length) {
                openEndedData.forEach(eg => {
                    queryString['Q' + eg.SurveyQuestion.survey_provider_question_id] = eg.open_ended_value;
                    matchingQuestionIds.push(eg.SurveyQuestion.id);
                });
            }
            /** End */
            const generateQueryString = new URLSearchParams(queryString).toString();
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
                        status: "live",
                    }
                });

                var page_count = Math.ceil(surveys.count / perPage);
                var survey_list = []
                if (!surveys.count) {
                    return{
                        status: false,
                        message: 'No matching surveys!'
                    }
                }
                var surveyHtml = '';
                if(surveys.rows && surveys.rows.length){
                    for (let survey of surveys.rows) {
                        let link = `/schlesigner/entrylink?survey_number=${survey.survey_number}&${generateQueryString}`;
                        let temp_survey = {
                            survey_number: survey.survey_number,
                            name: survey.name,
                            cpi: parseFloat(survey.cpi).toFixed(2),
                            loi: survey.loi,
                            link:link
                        }
                        survey_list.push(temp_survey);            
                    }
                }
                return {
                    status: true,
                    message: 'Success',
                    result: {
                        surveys:survey_list,
                        page_count:page_count
                    }
                }
            } else {
                return{
                    status: false,
                    message: 'Sorry! no surveys have been matched now! Please try again later.'
                }
            }
        }
        catch(error) {
            console.error(error)
           return{
                status: false,
                message: 'Something went wrong!'
            }
        }
    }

    generateEntryLink = async(req, res) => {
        if(!req.session.member) {
            res.redirect('/login')
            return;
        }
        var redirectURL = '';
        var returnObj = {};
        try{
            const queryString = req.query;
            const surveyNumber = queryString['survey_number'];
            const data = await Survey.findOne({
                attributes: ['original_json'],
                where: {
                    survey_number: surveyNumber
                }
            });
            
            if (data && data.original_json) {
                const schObj = new SchlesingerHelper;
                const result = await schObj.fetchSellerAPI('api/v2/survey/survey-quotas/' + surveyNumber);
                
                if(
                    result.Result.Success === true && 
                    result.Result.TotalCount != 0
                ) {
                    const surveyQuota = result.SurveyQuotas.filter(sv => sv.TotalRemaining > 1);
                    if( surveyQuota.length ){
                        delete queryString['survey_number'];
                        const params = Object.fromEntries(new URLSearchParams(queryString));
                        const liveLink = data.original_json.LiveLink;
                        const liveLinkArry = liveLink.split('?');
                        const liveLinkParams = Object.fromEntries(new URLSearchParams(liveLinkArry[1]))
                        params.pid = Date.now()+'-'+surveyNumber;
                        delete liveLinkParams['zid'];   // We dont have any value for zid
                        const entryLink = liveLinkArry[0] + '?' + new URLSearchParams({...liveLinkParams, ...params}).toString();
                        // res.send(entryLink)
                        res.redirect(entryLink);
                        return;
                    }
                    else {
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
    }

    updateSurvey = async(surveyNumber) => {
        await Survey.update({
            status: 'draft',
            deleted_at: new Date()
        }, {
            where: {
                survey_number: surveyNumber
            }
        });
    }
}

module.exports = SchlesingerController;