const {
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

class LucidController {

    constructor(){
        this.index = this.index.bind(this);
        this.surveys = this.surveys.bind(this);
    }

    index = (req, res) => {
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
            res.json({
                status: false,
                message: 'Member id not found!'
            });
            return;
        }

        const provider = await SurveyProvider.findOne({
            attributes: ['id'],
            where: {
                name: 'Lucid'
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

        if(eligibilities) {
            const matchingQuestionCodes = eligibilities.map(eg => eg.SurveyQuestion.id);
            const matchingAnswerCodes = eligibilities
                .filter(eg => eg.SurveyQuestion.question_type !== 'Numeric - Open-end') // Removed open ended question. We will not get the value from survey_answer_precodes
                .map(eg => eg.precode_id);

            if (matchingAnswerCodes.length && matchingQuestionCodes.length) {
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
                if(surveys.length){
                    var surveyHtml = '';
                    for (let survey of surveys) {
                        let link = `/lucid/entrylink?survey_number=${survey.survey_number}`;
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
                    res.json({
                        staus: false,
                        message: 'Surveys not found!'
                    });
                }
            }
            else {
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
        try{
            const lcObj = new LucidHelper;
            const surveyNumber = req.query.survey_number;          
            const survey = await Survey.findOne({
                attributes: ['url'],
                where: {
                    survey_number: surveyNumber
                }
            });
            if(survey && survey.url){
                res.redirect(survey.url);
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
                    })
                    res.send(url);
                }
            }
        }
        catch(error) {            
            console.error(error);
            req.session.flash = { error: error.message, redirect_url: '/lucid' };
            res.redirect('/notice');
        }
    }

}

module.exports = LucidController