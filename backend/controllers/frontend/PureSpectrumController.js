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
class PureSpectrumController {

    constructor(){
        this.surveys = this.surveys.bind(this);
        this.generateEntryLink = this.generateEntryLink.bind(this);
        this.index = this.index.bind(this);
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

    surveys = async (req, res) => {
        const memberId = req.query.user_id;
        if (!memberId) {
            res.status(422).json({
                status: false,
                message: 'Member id not found!'
            });
            return;
        }
        const provider = await SurveyProvider.findOne({
            attributes: ['id'],
            where: {
                name: 'Purespectrum'
            }
        });
        if (!provider) {
            res.json({
                status: false,
                message: 'Survey Provider not found!'
            });
            return;
        }
        /**
         * check and get member's eligibility
         */
        const eligibilities = await MemberEligibilities.findAll({
            attributes: ['survey_question_id', 'precode_id', 'text', 'id'],
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
                attributes: ['survey_question_id', 'precode_id', 'open_ended_value'],
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
            const matchingAnswerIds = eligibilities.map(eg => eg.precode_id);
            
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

                const surveys = await Survey.findAll({
                    attributes: ['id', 'survey_provider_id', 'loi', 'cpi', 'name', 'survey_number'],
                    where: {
                        survey_provider_id: provider.id,
                        status: "live",
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
                    }
                });
                
                if(surveys && surveys.length){
                    var surveyHtml = '';
                    for (let survey of surveys) {
                        let link = `/pure-spectrum/entrylink?survey_number=${survey.survey_number}${generateQueryString ? '&' + generateQueryString : ''}`;
                        surveyHtml += `
                            <div class="col-6 col-sm-4 col-md-3 col-xl-2">
                                <div class="bg-white card mb-2">
                                    <div class="card-body position-relative">
                                        <div class="d-flex justify-content-between">
                                            <h6 class="text-primary m-0">${survey.name}</h6>
                                        </div>
                                        <div class="text-primary small">${survey.loi} Minutes</div>
                                        <div class="d-grid mt-1">
                                            <a href="${link}" class="btn btn-primary text-white rounded-1">Earn $${survey.cpi}</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `
                    }
                    res.send({
                        status: true,
                        message: 'Success',
                        result: surveyHtml
                    });
                }
                else {
                    res.send({
                        status: true,
                        message: 'No survey found!',
                        result: surveyHtml
                    });
                }
            } else {
                res.json({
                    staus: false,
                    message: 'No surveys have been matched!'
                });
            }
        } else {
            res.json({
                status: false,
                message: 'Member eiligibility not found!'
            });
        }
    }

    generateEntryLink = async (req, res) => {
        const queryString = req.query;
        const psObj = new PurespectrumHelper;
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
                res.redirect(entryLink)
            } else {
                req.session.flash = { error: 'Unable to get entry link!', redirect_url: '/purespectrum' };
                res.redirect('/notice');
            }
        }
        else {
            await Survey.update({
                status: psObj.getSurveyStatus(22)
            }, {
                where: {
                    survey_number: queryString.survey_number
                }
            });
            req.session.flash = { error: 'Sorry! this survey has been closed.', redirect_url: '/pure-spectrum' };
            res.redirect('/notice');
        }
    }
}

module.exports = PureSpectrumController;