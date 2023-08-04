const {
    Member,
    Survey,
    SurveyProvider,
    SurveyQuestion,
    SurveyQualification,
    SurveyAnswerPrecodes,
    MemberEligibilities,
    CountrySurveyQuestion
} = require('../../models');

const SchlesingerHelper = require('../../helpers/Schlesinger');
const { Op } = require('sequelize')
const Sequelize = require('sequelize');
class SchlesingerController {

    constructor() {
        this.surveys = this.surveys.bind(this);
        this.generateEntryLink = this.generateEntryLink.bind(this);
    }

    // surveys = async(memberId,params) => {
    surveys = async(req, res) => {
        try{
            const member = req.session.member;
            const memberId = req.query.user_id;
            
            if (!memberId ) {
                res.json({
                    staus: false,
                    message: 'Member id not found!'
                });
                return;
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
            const params = {};
            const pageNo = 'pageno' in params ? parseInt(params.pageno) : 1;
            const perPage = 'perpage' in params ? parseInt(params.perpage) : 12;
            const orderBy = 'orderby' in params ? params.orderby : 'created_at';
            const order = 'order' in params ? params.order : 'desc';
            /**
             * check and get member's eligibility
             */
            const eligibilities = await MemberEligibilities.findAll({
                attributes: ['country_survey_question_id', 'survey_answer_precode_id', 'text', 'id'],
                where: {
                    member_id: memberId
                },
                include: [
                    {
                        model: CountrySurveyQuestion,
                        attributes: ['country_id', 'survey_question_id', 'id'],
                        where: {
                            // country_id: member.country_id
                            country_id: 225
                        },
                        include: {
                            model: SurveyQuestion,
                            attributes: ['name', 'survey_provider_question_id', 'question_type', 'id'],
                        }
                    },
                    // {
                    //     model: SurveyQuestion,
                    //     attributes: ['name', 'survey_provider_question_id', 'question_type', 'id'],
                    //     where: {
                    //         survey_provider_id: provider.id
                    //     }
                    // },
                    {
                        model: Member,
                        attributes: ['username']
                    },
                    {
                        model: SurveyAnswerPrecodes,
                        attributes: ['id', 'option', 'precode'],
                        where: {
                            survey_provider_id: provider.id,
                            // country_id: member.country_id
                            country_id: 225
                        }
                    }
                ]
            });
            if (!eligibilities || eligibilities === null || eligibilities.length < 1) {
                res.json({
                    status: false,
                    message:'You are not eligible for this survey!'
                });
                return;
            }
            
            // res.json(eligibilities);
            // return;


            const matchingQuestionIds = eligibilities.map(eg => eg.CountrySurveyQuestion.survey_question_id);
            const matchingAnswerIds = eligibilities.map(eg => eg.survey_answer_precode_id);


            // res.json(matchingAnswerIds);
            // return;

            /** Get Open Ended QnA Start */
            const eligibilityIds = eligibilities.map(eg => eg.id);
            const openEndedData =  await MemberEligibilities.findAll({
                attributes: ['country_survey_question_id', 'open_ended_value'],
                where: {
                    member_id: memberId,
                    id: {
                        [Op.notIn]: eligibilityIds
                    }
                },
                include: {
                    model: CountrySurveyQuestion,
                    attributes: ['country_id', 'survey_question_id', 'id'],
                    where: {
                        // country_id: member.country_id
                        country_id: 225
                    },
                    include: {
                        model: SurveyQuestion,
                        attributes: ['name', 'survey_provider_question_id', 'question_type', 'id'],
                    }
                }
                // include: {
                //     model: SurveyQuestion,
                //     attributes: ['id', 'survey_provider_question_id', 'question_type'],
                //     where: {
                //         survey_provider_id: provider.id
                //     }
                // }
            });
            /** end */


            // res.json(openEndedData);
            // return;


            /** Query String Formation Start */
            const queryString = {
                uid: eligibilities[0].Member.username
            };
            eligibilities.forEach(eg => {
                queryString['Q' + eg.CountrySurveyQuestion.SurveyQuestion.survey_provider_question_id] = eg.SurveyAnswerPrecode.option;
            });
            if(openEndedData && openEndedData.length) {
                openEndedData.forEach(eg => {
                    queryString['Q' + eg.CountrySurveyQuestion.SurveyQuestion.survey_provider_question_id] = eg.open_ended_value;
                    matchingQuestionIds.push(eg.CountrySurveyQuestion.survey_question_id);
                });
            }

            console.log(matchingQuestionIds)
            console.log('--------')
            console.log(matchingAnswerIds)

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

                res.send(surveys);
                return;

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
           res.send({
                status: false,
                message: 'Something went wrong!'
            })
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