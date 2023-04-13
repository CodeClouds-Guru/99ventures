const {
    Member,
    Survey,
    SurveyProvider,
    SurveyQuestion,
    SurveyQualification,
    SurveyAnswerPrecodes,
    MemberEligibilities
} = require('../../models');

const LucidHelper = require('../../helpers/Lucid')
const PurespectrumHelper = require('../../helpers/Purespectrum');
const axios = require('axios');
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
            const payload = JSON.stringify({
                "SupplierLinkTypeCode":"OWS",
                "TrackingTypeCode":"S2S"
            });
            const result = await lcObj.createData('/Supply/v1/SupplierLinks/Create/33396875/6373', payload);
            res.send(result)

            // var data = JSON.stringify({
            //     "SupplierLinkTypeCode": "OWS",
            //     "TrackingTypeCode": "S2S"
            //   });
              
            //   var config = {
            //     method: 'post',
            //     url: 'https://api.samplicio.us/Supply/v1/SupplierLinks/Create/33374569/6373',
            //     headers: { 
            //       'Authorization': '1E1E0F7F-77B6-4732-9ED3-9D2953A7BF3F', 
            //       'Content-Type': 'application/json',
            //     },
            //     data : data
            //   };
              
            //   const response = await axios(config);
            //   res.send(response)
              
            // const payload = {
            //     "SupplierLinkTypeCode":"OWS",
            //     "TrackingTypeCode":"S2S"
            //   };
              
            //   const instance = axios.create({
            //     baseURL: 'https://api.samplicio.us',
            //     timeout: 10000,
            //     headers: {
            //       Authorization: process.env.LUCID_API_KEY,
            //       Accept: 'application/json, text/plain, */*',
            //       'Content-Type': 'application/json',
            //     },
            //     data: JSON.stringify(payload)
            //   });
              
            //   const response = await instance.post('/Supply/v1/SupplierLinks/Create/' + surveyNumber +'/6373');
            //   res.send(response)


        }
        catch(error) {
            
            console.error("Lucid Error: ", error)
            throw error;
        }
    }

}

module.exports = LucidController