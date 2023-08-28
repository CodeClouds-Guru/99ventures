const {
    sequelize,
    Member,
    Survey,
    SurveyProvider,
    MemberEligibilities
} = require('../../models');
const { Op, QueryTypes } = require('sequelize')
const LucidHelper = require('../../helpers/Lucid')
const { generateHashForLucid } = require('../../helpers/global')
const Sequelize = require('sequelize');

class LucidController {

    constructor(){
        this.surveys = this.surveys.bind(this);
        this.rebuildEntryLink =  this.rebuildEntryLink.bind(this);
        this.addEntryLink = this.addEntryLink.bind(this);
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
            
            if(quota.SurveyStillLive == true || quota.SurveyStillLive == 'true') {
                const survey = await Survey.findOne({
                    attributes: ['url'],
                    where: {
                        survey_number: surveyNumber,
                        survey_provider_id: 1
                    }
                });
            
                if(survey && survey.url !== null){
                    let URL = this.rebuildEntryLink(survey.url, params);
                    console.log('Lucid entry link', URL);
                    res.redirect(URL);
                    return;
                } else {
                    try{
                        //Sometimes the survey entrylink not created and API sending 404 response.
                        //That's why making this survey to draft as catch block
                        const result = await lcObj.createEntryLink(surveyNumber);
                        if(result.data && result.data.SupplierLink) {
                            const url = (process.env.DEV_MODE == '0') ? result.data.SupplierLink.LiveLink : result.data.SupplierLink.TestLink;
                            await this.addEntryLink(surveyNumber, url);
                            let URL = this.rebuildEntryLink(url, params);
                            console.log('Lucid entry link', URL);
                            res.redirect(URL);
                        }
                    } catch(error) {
                        //If entry link already created but unable to find from DB
                        //that's why API has been used to get the entry link and again store in DB
                        if(error.response.status === 409) {
                            const result = await lcObj.getEntryLink(surveyNumber);
                            if(result.ResultCount !== null && result.SupplierLink) {
                                const url = (process.env.DEV_MODE == '0') ? result.SupplierLink.LiveLink : result.SupplierLink.TestLink;
                                await this.addEntryLink(surveyNumber, url);
                                let URL = this.rebuildEntryLink(url, params);
                                console.log('Lucid entry link', URL);
                                res.redirect(URL);
                            }
                        } else {
                            throw {survey_number: surveyNumber, message: 'Sorry! Survey not found.'};
                        }
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
        if(process.env.DEV_MODE == '0') {   // 0 = live
            var url = url.replace('&PID=', '');
            const params = new URLSearchParams(queryParams).toString();
            const urlTobeHashed = url+'&'+params+'&';
            const hash = generateHashForLucid(urlTobeHashed);
            return url +'&'+params+'&hash='+hash;
        }
        else {
            delete queryParams.PID;
            const params = new URLSearchParams(queryParams).toString();
            const urlTobeHashed = url+'&'+params+'&';
            const hash = generateHashForLucid(urlTobeHashed);            
            return url +'&'+params+'&hash='+hash;
        }
    }

    addEntryLink = async (surveyNumber, url) => {
        await sequelize.query(
            'UPDATE surveys SET url = :url WHERE survey_number = :survey_number AND survey_provider_id = :provider_id',
            {
              replacements: { url: url, survey_number: surveyNumber, provider_id: 1},
              type: QueryTypes.UPDATE
            }
        );
        return true;
    }

    /*generateEntryLink1 = async (req, res) => {
        try{
        const result = await sequelize.query(
            'UPDATE surveys SET url = :url WHERE survey_number = :survey_number AND survey_provider_id = :provider_id',
            {
              replacements: { url: "https://www.samplicio.us/s/default.aspx?SID=4619aed6-5607-493c-aad0-f20d11542486&PID=", survey_number: 39886004, provider_id: 1},
              type: QueryTypes.UPDATE
            }
        );
        res.send(result);
        }
        catch(error) {
            console.log(error)
            res.send(error)
        }
    }*/
}

module.exports = LucidController