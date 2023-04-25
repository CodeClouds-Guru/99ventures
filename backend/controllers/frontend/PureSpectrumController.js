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
            attributes: ['survey_question_id', 'precode_id', 'text'],
            where: {
                member_id: memberId
            },
            include: [{
                model: SurveyQuestion,
                attributes: ['id', 'survey_provider_question_id', 'question_type'],
                where: {
                    survey_provider_id: provider.id
                }
            }, {
                model: Member,
                attributes: ['username']
            }]
        });

        if (eligibilities) {
            const matchingQuestionCodes = eligibilities.map(eg => eg.SurveyQuestion.id);
            const matchingAnswerCodes = eligibilities
                .filter(eg => eg.SurveyQuestion.question_type !== 'open-ended') // Removed open ended question. We will not get the value from survey_answer_precodes
                .map(eg => eg.precode_id);

            if (matchingAnswerCodes.length && matchingQuestionCodes.length) {
                const queryString = {
                    ps_supplier_respondent_id: eligibilities[0].Member.username,
                    ps_supplier_sid: Date.now()
                };
                eligibilities.map(eg => {
                    queryString[eg.SurveyQuestion.survey_provider_question_id] = eg.precode_id
                });
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
                                option: matchingAnswerCodes // [111, 30]
                            },
                            required: true,
                            include: [
                                {
                                    model: SurveyQuestion,
                                    attributes: ['id', 'survey_provider_question_id'],
                                    where: {
                                        id: matchingQuestionCodes // ['Age', 'Gender', 'Zipcode']
                                        // name: matchingQuestionCodes // ['Age', 'Gender', 'Zipcode']
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
                                        <div class="text-primary small">5 Minutes</div>
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
        queryString.bsec = 'a70mx8';
        const psObj = new PurespectrumHelper;
        const data = await psObj.createData(`surveys/register/${queryString.survey_number}`);
        delete queryString['survey_number'];
        const generateQueryString = new URLSearchParams(queryString).toString();
    
        if (data.apiStatus === 'success' && data.survey_entry_url) {
            const entryLink = data.survey_entry_url + '&' + generateQueryString;
            res.redirect(entryLink)
        } else {
            res.send('Unable to get entry link!')
        }
    }
}

module.exports = PureSpectrumController;