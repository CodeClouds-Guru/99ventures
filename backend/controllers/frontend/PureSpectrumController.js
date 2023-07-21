const {
    Member,
    Survey,
    SurveyProvider,
    SurveyQuestion,
    SurveyQualification,
    SurveyAnswerPrecodes,
    MemberEligibilities
} = require('../../models');
const PurespectrumHelper = require('../../helpers/Purespectrum')
const { Op } = require('sequelize')
const Sequelize = require('sequelize');
class PureSpectrumController {

    constructor(){
        this.surveys = this.surveys.bind(this);
        this.generateEntryLink = this.generateEntryLink.bind(this);
    }

    surveys = async (memberId,params) => {
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
                name: 'Purespectrum'
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

        if (eligibilities) {
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
            
            const matchingQuestionIds = eligibilities.map(eg => eg.survey_question_id);            
            const matchingAnswerIds = eligibilities.map(eg => eg.survey_answer_precode_id);
            
            if (matchingAnswerIds.length && matchingQuestionIds.length) {
                /** Query String Formation Start */
                const queryString = {
                    ps_supplier_respondent_id: eligibilities[0].Member.username,
                    ps_supplier_sid: Date.now()
                };
                eligibilities.forEach(eg => {
                    queryString[eg.SurveyAnswerPrecode.precode] = eg.SurveyAnswerPrecode.option
                });
                if(openEndedData && openEndedData.length) {
                    openEndedData.forEach(eg => {
                        queryString[eg.SurveyQuestion.survey_provider_question_id] = eg.open_ended_value;
                        matchingQuestionIds.push(eg.SurveyQuestion.id);
                    });
                }

                /** End */
                const generateQueryString = new URLSearchParams(queryString).toString();
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
                if(surveys.rows && surveys.rows.length){
                    var surveyHtml = '';
                    for (let survey of surveys.rows) {
                        let link = `/purespectrum/entrylink?survey_number=${survey.survey_number}${generateQueryString ? '&' + generateQueryString : ''}`;
                        let temp_survey = {
                            survey_number: survey.survey_number,
                            name: survey.name,
                            cpi: parseFloat(survey.cpi).toFixed(2),
                            loi: survey.loi,
                            link:link
                        }
                        survey_list.push(temp_survey);
                    }
                    return {
                        status: true,
                        message: 'Success',
                        result: {
                            surveys:survey_list,
                            page_count:page_count
                        }
                    }
                }
                else {
                    return {
                        status: false,
                        message: 'Surveys not found!'
                    }
                }
            } else {
                return {
                    status: false,
                    message: 'Sorry! no surveys have been matched now! Please try again later.'
                }
            }
        } else {
            return {
                status: false,
                message: 'Member eiligibility not found!'
            }
        }
    }

    generateEntryLink = async (req, res) => {
        if(!req.session.member) {
            res.redirect('/login');
            return;
        }
        var returnObj = {};
        const psObj = new PurespectrumHelper;
        const queryString = req.query;
        // var redirectURL = '';
        try{
            const survey = await psObj.fetchAndReturnData('/surveys/' + queryString.survey_number);            
            if(survey.apiStatus === 'success' && survey.survey.survey_status === 22)   // 22 means live
            {
                if(process.env.DEV_MODE == 1){
                    queryString.bsec = 'a70mx8';
                }
                const data = await psObj.createData(`surveys/register/${queryString.survey_number}`);
                delete queryString['survey_number'];
                const generateQueryString = new URLSearchParams(queryString).toString();
            
                if (data.apiStatus === 'success' && data.survey_entry_url) {
                    const entryLink = data.survey_entry_url + '&' + generateQueryString;
                    res.redirect(entryLink);
                    return;
                } else {
                    // returnObj = {notice: 'Unable to get entry link!', redirect_url: '/purespectrum' };
                    throw {statusCode: 404, message: 'Unable to get entry link'};
                }
            } else {
                throw {statusCode: 404, message: 'Sorry! this survey has been closed'};
            }
        }
        catch (error) {
            if(
               (
                'response' in error && 
                error.response.data.statusCode && 
                error.response.data.statusCode === 404
               ) || (error.statusCode === 404)
            ) {
                await Survey.update({
                    status: psObj.getSurveyStatus(44),
                    deleted_at: new Date()
                }, {
                    where: {
                        survey_number: queryString.survey_number
                    }
                });                
                // returnObj = { notice: 'Sorry! this survey has been closed.', redirect_url: '/purespectrum' };
            } 
            /*else {
                returnObj = { notice: error.message, redirect_url: '/purespectrum' };
            }*/
            // redirectURL = '/survey-notavailable';
            res.redirect('/survey-notavailable');
        }        
        // req.session.flash = returnObj;
        // res.redirect('/notice');
    }
}

module.exports = PureSpectrumController;