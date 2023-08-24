const {
    sequelize,
    Member,
    Survey,
    SurveyProvider,
    SurveyQuestion,
    SurveyQualification,
    SurveyAnswerPrecodes,
    MemberEligibilities
} = require('../../models');
const { Op } = require('sequelize')
const LucidHelper = require('../../helpers/Lucid')
const Crypto = require('crypto');
const { generateHashForLucid } = require('../../helpers/global')
const Sequelize = require('sequelize');

class LucidController {

    constructor(){
        this.surveys = this.surveys.bind(this);
        this.rebuildEntryLink =  this.rebuildEntryLink.bind(this);
    }

    surveys = async (memberId, params) => {
        try{
            const member = await Member.findOne({
                attributes: ['username', 'country_id'],
                where: {
                    id: memberId
                }
            });
            
            if (!memberId || member === null) {
                res.json({
                    staus: false,
                    message: 'Member id not found!'
                });
                return;
            }
            
            const provider = await SurveyProvider.findOne({
                attributes: ['id'],
                where: {
                    name: 'Lucid',
                    status: 1
                }
            });
            if (!provider || provider == null) {
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
            const eligibilities = await MemberEligibilities.getEligibilities(member.country_id, provider.id, memberId);
            
            if(eligibilities.length < 1) {
                return {
                    status: false,
                    message: 'Sorry! you are not eligible.'
                }
            }
            /** Query String Formation Start */
            const queryString = {};
            const matchingQuestionIds = [];
            const matchingAnswerIds = [];
            eligibilities.forEach(eg => {
                queryString[eg.survey_provider_question_id] = eg.option ? eg.option : eg.open_ended_value;
                matchingQuestionIds.push(eg.survey_question_id);
                if(eg.survey_answer_precode_id !== null){
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
                        status: "active",
                        country_id: member.country_id
                    }
                });
                if (!surveys.count) {
                    return {
                        status: false,
                        message: 'No matching surveys!'
                    }
                }

                var page_count = Math.ceil(surveys.count / perPage);
                var survey_list = [];                
                if(surveys.rows && surveys.rows.length){
                    for (let survey of surveys.rows) {
                        let link = `/lucid/entrylink?survey_number=${survey.survey_number}&uid=${member.username}&${generateQueryString}`;
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
            return {
                status: false,
                message: 'Something went wrong!'
            }
        }
    }

    surveysOld = async (memberId,params) => {
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
                name: 'Lucid'
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
            attributes: ['survey_question_id', 'survey_answer_precode_id', 'open_ended_value', 'id'],
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

        if(eligibilities) {
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
                include: [{
                    model: SurveyQuestion,
                    attributes: ['id', 'survey_provider_question_id', 'question_type'],
                    where: {
                        survey_provider_id: provider.id
                    }
                }]
            });
            /** end */

            
            const matchingQuestionIds = eligibilities.map(eg => eg.SurveyQuestion.id);
            const matchingAnswerIds = eligibilities.map(eg => eg.survey_answer_precode_id);

            if (matchingAnswerIds.length && matchingQuestionIds.length) {
                const queryString = {};
                eligibilities.forEach(eg => {
                    queryString[eg.SurveyQuestion.survey_provider_question_id] = eg.SurveyAnswerPrecode.option
                });
                if(openEndedData && openEndedData.length) {
                    openEndedData.forEach(eg => {
                        queryString[eg.SurveyQuestion.survey_provider_question_id] = eg.open_ended_value;
                        matchingQuestionIds.push(eg.SurveyQuestion.id);
                    });
                }
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
                        status: "active",
                    }
                });
                
                var page_count = Math.ceil(surveys.count / perPage);
                var survey_list = []
                if(surveys.rows && surveys.rows.length){
                    var surveyHtml = '';
                    var count = 0;
                    for (let survey of surveys.rows) {
                        let link = `/lucid/entrylink?survey_number=${survey.survey_number}&uid=${eligibilities[0].Member.username}&${generateQueryString}`;
                        let temp_survey = {
                                survey_number: survey.survey_number,
                                name: survey.name,
                                cpi: parseFloat(survey.cpi).toFixed(2),
                                loi: survey.loi,
                                link:link
                            }
                        survey_list.push(temp_survey) 
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
            }
            else {                
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
            res.redirect('/login')
            return;
        }
        try{
            const lcObj = new LucidHelper;
            const surveyNumber = req.query.survey_number;    
            const quota = await lcObj.showQuota(surveyNumber);
            
            const queryParams = req.query;
            const params = {
                MID: Date.now(),
                PID: req.query.uid,
                ...queryParams
            }
            delete params.survey_number
            delete params.uid
            
            var entrylink;
            if(quota.SurveyStillLive == true || quota.SurveyStillLive == 'true') {
                const survey = await Survey.findOne({
                    attributes: ['url'],
                    where: {
                        survey_number: surveyNumber
                    }
                });
            
                if(survey && survey.url !== null){
                    entrylink = survey.url;
                    let URL = this.rebuildEntryLink(entrylink, params);
                    console.log('Lucid entry link', URL);
                    res.redirect(URL);
                    return;
                } else {
                    try{
                        //Sometimes the survey entrylink not created and API sending 404 response.
                        //That's why making this survey to draft as catch block
                        const result = await lcObj.createEntryLink(surveyNumber);
                        if(result.data && result.data.SupplierLink) {
                            const url = (process.env.DEV_MODE == '1') ? result.data.SupplierLink.TestLink : result.data.SupplierLink.LiveLink;
                            await Survey.update({
                                url: url
                            }, {
                                where: {
                                    survey_number: surveyNumber
                                }
                            });
                            entrylink = url;
                            let URL = this.rebuildEntryLink(entrylink, params);
                            console.log('Lucid entry link', URL);
                            res.redirect(URL);
                            return;
                        }
                    } catch(error) {
                        throw {survey_number: surveyNumber, message: 'Sorry! Survey not found.'};
                    }
                }                
            } else {
                throw {survey_number: surveyNumber, message: 'Sorry! Survey is not live now.'};
            }
        }
        catch(error) {
            if('survey_number' in error && error.survey_number) {
                await Survey.update({
                    status: 'draft',
                    deleted_at: new Date()
                },{
                    where: {
                        survey_number: error.survey_number
                    }
                });
            }
            res.redirect('/survey-notavailable');
        }
    }

    /**
     * Rebuild the entry link with hash
     * NOTE: When hashing URLs the base string should include the entire URL, up to and including the `&` preceding the hashing parameter.
     */
    rebuildEntryLink = (url, queryParams) => {
        if(process.env.DEV_MODE == '1') {
            delete queryParams.PID;
            const params = new URLSearchParams(queryParams).toString();
            const urlTobeHashed = url+'&'+params+'&';
            const hash = generateHashForLucid(urlTobeHashed);            
            return url +'&'+params+'&hash='+hash;
        } else {
            var url = url.replace('&PID=', '');
            const params = new URLSearchParams(queryParams).toString();
            const urlTobeHashed = url+'&'+params+'&';
            const hash = generateHashForLucid(urlTobeHashed);
            return url +'&'+params+'&hash='+hash;
        }
    }

}

module.exports = LucidController