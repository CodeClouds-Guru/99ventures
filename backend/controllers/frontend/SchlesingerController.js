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
        this.index = this.index.bind(this);
        this.surveys = this.surveys.bind(this);
        this.generateEntryLink = this.generateEntryLink.bind(this);
    }

    index = (req, res) => {
        if(!req.session.member) {
            res.status(401).json({
                status: false,
                message: 'Unauthorized!'
            });
            return;
        }
        const action = req.params.action;
        if(action === 'surveys')
            this.surveys(req, res);
        else if(action === 'entrylink')
            this.generateEntryLink(req, res);
        else 
            throw error('Invalid access!');
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
                    staus: false,
                    message: 'Survey Provider not found!'
                }
            }
            const pageNo = 'pageno' in params ? parseInt(params.pageno) : 1;
            const perPage = 'perpage' in params ? parseInt(params.perpage) : 12;
            const orderBy = 'orderby' in params ? params.orderby : 'id';
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
                const acceptedSurveys = await Member.acceptedSurveys(memberId, provider.id);
                const clause = {};            
                if(acceptedSurveys.length) {
                    const attemptedSurveysNumber = acceptedSurveys.map(r=> r.survey_number);
                    clause = {
                        survey_number: {
                            [Op.notIn]: attemptedSurveysNumber
                        }
                    }
                }
                const surveys = await Survey.findAndCountAll({
                    attributes: ['id', 'survey_provider_id', 'loi', 'cpi', 'name', 'survey_number'],
                    distinct: true,
                    where: {
                        survey_provider_id: provider.id,
                        status: "live",
                        ...clause
                    },
                    include: {
                        model: SurveyQualification,
                        attributes: ['id', 'survey_id', 'survey_question_id'],
                        required: true,                        
                        include: {
                            model: SurveyAnswerPrecodes,
                            attributes: ['id', 'option', 'precode'],
                            where: {
                                id: matchingAnswerIds
                            },
                            required: true,
                            include: [
                                {
                                    model: SurveyQuestion,
                                    attributes: ['id'],
                                    where: {
                                        id: matchingQuestionIds 
                                    }
                                }
                            ],
                        }
                    },
                    order: [[Sequelize.literal(orderBy), order]],
                    limit: perPage,
                    offset: (pageNo - 1) * perPage,
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
                        survey_list.push(temp_survey)
                        // surveyHtml += `
                        //     <div class="col-6 col-sm-4 col-md-3 col-xl-2">
                        //         <div class="bg-white card mb-2">
                        //             <div class="card-body position-relative">
                        //                 <div class="d-flex justify-content-between">
                        //                     <h6 class="text-primary m-0">Exciting New Survey #${survey.survey_number}</h6>
                        //                 </div>
                        //                 <div class="text-primary small">${survey.loi} Minutes</div>
                        //                 <div class="d-grid mt-1">
                        //                     <a href="${link}" class="btn btn-primary text-white rounded-1">Earn $${survey.cpi}</a>
                        //                 </div>
                        //             </div>
                        //         </div>
                        //     </div>
                        // `
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
                    message: 'Member eiligibility not found!'
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
                        res.redirect(entryLink)
                    }
                    else {
                        this.updateSurvey(surveyNumber);
                        req.session.flash = { error: 'No quota exists!', redirect_url: '/schlesigner' };
                        res.redirect('/notice');
                    }                    
                } else {
                    this.updateSurvey(surveyNumber);
                    req.session.flash = { error: 'Survey quota does not exists!', redirect_url: '/schlesigner' };
                    res.redirect('/notice');
                }
            } else {
                req.session.flash = { error: 'Unable to get entry link!', redirect_url: '/schlesigner' };
                res.redirect('/notice');
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
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