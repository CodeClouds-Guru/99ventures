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
        this.index = this.index.bind(this);
        this.surveys = this.surveys.bind(this);
        this.rebuildEntryLink =  this.rebuildEntryLink.bind(this)
    }

    index = (req, res) => {
        // if(!req.session.member) {
        //     res.status(401).json({
        //         status: false,
        //         message: 'Unauthorized!'
        //     });
        //     return;
        // }
        const action = req.params.action;
        if(action === 'surveys')
            this.surveys(req, res);
        else if(action === 'entrylink')
            this.generateEntryLink(req, res);
        else 
            throw error('Invalid access!');
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
        const orderBy = 'orderby' in params ? params.orderby : 'id';
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
                
                const surveys = await Survey.findAll({
                    attributes: ['id', 'survey_provider_id', 'loi', 'cpi', 'name', 'survey_number'],
                    where: {
                        survey_provider_id: provider.id,
                        status: "active",
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
                                    attributes: ['id', 'survey_provider_question_id'],
                                    where: {
                                        id: matchingQuestionIds
                                    }
                                }
                            ],
                        }
                    },
                    //limit: 200
                    order: [[Sequelize.literal(orderBy), order]],
                    limit: perPage,
                    offset: (pageNo - 1) * perPage,
                });
                var data_count = await Survey.findAndCountAll({
                    attributes: ['id'],
                    where: {
                        survey_provider_id: provider.id,
                        status: "active",
                    }
                });
                var page_count = Math.ceil(data_count.count / perPage);

                // res.send(surveys);
                // return;
                var survey_list = []
                if(surveys.length){
                    var surveyHtml = '';
                    var count = 0;
                    for (let survey of surveys) {
                        let link = `/lucid/entrylink?survey_number=${survey.survey_number}&uid=${eligibilities[0].Member.username}&${generateQueryString}`;
                        let temp_survey = survey
                        temp_survey.link = link
                        console.log(temp_survey)
                        survey_list.push(temp_survey)
                        // surveyHtml += `
                        //     <div class="col-6 col-sm-4 col-md-3 col-xl-2">
                        //         <div class="bg-white card mb-2">
                        //             <div class="card-body position-relative">
                        //                 <div class="d-flex justify-content-between">
                        //                     <h6 class="text-primary m-0">${survey.name}</h6>
                        //                 </div>
                        //                 <div class="text-primary small">5 Minutes</div>
                        //                 <div class="d-grid mt-1">
                        //                     <a href="${link}" class="btn btn-primary text-white rounded-1">Earn $${survey.cpi}</a>
                        //                 </div>
                        //             </div>
                        //         </div>
                        //     </div>
                        // `

                    }
                    
                    // res.send({
                    //     status: true,
                    //     message: 'Success',
                    //     result: surveyHtml
                    // });
                    return {
                        status: true,
                        message: 'Success',
                        result: {
                            surveys:survey_list,
                            page_count
                        }
                    }
                }
                else {
                    return {
                        staus: false,
                        message: 'Surveys not found!'
                    }
                }
            }
            else {
                
                return {
                    staus: false,
                    message: 'No surveys have been matched!'
                }
            }

        } else {
            // res.json({
            //     status: false,
            //     message: 'Member eiligibility not found!'
            // });
            return {
                staus: false,
                message: 'Member eiligibility not found!'
            }
        }


    }

    generateEntryLink = async (req, res) => {
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
            if(quota.SurveyStillLive == true) {
                const survey = await Survey.findOne({
                    attributes: ['url'],
                    where: {
                        survey_number: surveyNumber
                    }
                });
                if(survey && survey.url){
                    entrylink = survey.url;
                } else {                    
                    const result = await lcObj.createEntryLink(surveyNumber);
                    if(result.data && result.data.SupplierLink) {
                        const url = (process.env.DEV_MODE == 1) ? result.data.SupplierLink.TestLink : result.data.SupplierLink.LiveLink;
                        await Survey.update({
                            url: url
                        }, {
                            where: {
                                survey_number: surveyNumber
                            }
                        });
                        entrylink = url;
                    }
                }
                
                const URL = this.rebuildEntryLink(entrylink, params);
                res.send(URL)
                // res.redirect(URL);
            } else {
                await Survey.update({
                    status: 'draft',
                    deleted_at: new Date()
                },{
                    where: {
                        survey_number: surveyNumber
                    }
                });
                req.session.flash = { error: 'Survey is not live now!', redirect_url: '/lucid' };
                res.redirect('/notice');
            }
        }
        catch(error) {
            console.error(error);
            req.session.flash = { error: error.message, redirect_url: '/lucid' };
            res.redirect('/notice');
        }
    }

    /**
     * Rebuild the entry link with hash
     * NOTE: When hashing URLs the base string should include the entire URL, up to and including the `&` preceding the hashing parameter.
     */
    rebuildEntryLink = (url, queryParams) => {
        if(process.env.DEV_MODE == 1) {
            delete queryParams.PID;
            const params = new URLSearchParams(queryParams).toString();
            const urlTobeHashed = url+'&'+params+'&';
            const hash = generateHashForLucid(urlTobeHashed);            
            return url +'&'+params+'&hash='+hash;
        } else {
            const params = new URLSearchParams(queryParams).toString();
            const urlTobeHashed = url+'&PID='+queryParams.PID+'&'+params+'&';
            const hash = generateHashForLucid(urlTobeHashed);
            return url +'&'+params+'&hash='+hash;
        }
    }

}

module.exports = LucidController