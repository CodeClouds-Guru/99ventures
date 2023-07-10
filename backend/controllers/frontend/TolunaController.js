const {
    Member,
    SurveyProvider,
    MemberEligibilities
} = require('../../models');
const TolunaHelper = require('../../helpers/Toluna');

class TolunaController {

    constructor() {
        this.registerMember = this.registerMember.bind(this);
        this.surveys = this.surveys.bind(this);
    }

    /**
     * To register a member with profile data
     * @param {*} req 
     * @param {*} res 
     */
    async registerMember(req, res) {
        try {
            const tObj = new TolunaHelper;
            const payload = {
                "PartnerGUID": process.env.PARTNER_GUID,
                "MemberCode": "cc-dev-2",
                "Email": "ccdev2@mailinator.com",
                "BirthDate": "6/21/1992",
                "PostalCode": "71751",
                "RegistrationAnswers": [
                    {
                        "QuestionID": 1001007,
                        "Answers": [{ "AnswerID": 2000247 }]
                    },
                    {
                        "QuestionID": 1001101,
                        "Answers": [{ "AnswerID": 2002275 }]
                    },
                    {
                        "QuestionID": 1001107,
                        "Answers": [{ "AnswerID": 2002330 }]
                    },
                    {
                        "QuestionID": 1001012,
                        "Answers": [{ "AnswerID": 2000270 }]
                    },
                    {
                        "QuestionID": 1005145,
                        "Answers": [{ "AnswerID": 2796316 }]
                    },
                    {
                        "QuestionID": 1001102,
                        "Answers": [{ "AnswerID": 2002280 }]
                    },
                    {
                        "QuestionID": 1012395,
                        "Answers": [{ "AnswerID": 3056609 }]
                    }
                ]
            }
            await tObj.addMemebr(payload);
            res.send('Member Created!');
        } catch (error) {
            res.send(error)
        }
    }

    /**
     * To get the surveys
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async surveys(memberId,params) {
        if(!memberId) {
            return{
                status: false,
                message: 'Unauthorized!'
            }
        }
        // const memberId = req.query.user_id;
        if (!memberId) {
            return {
                status: false,
                message: 'Member id not found!'
            }
        }
        const member = await Member.findOne({
            attributes: ['username', 'id'],
            where: {
                id: memberId
            }
        });

        if (member) {
            const provider = await SurveyProvider.findOne({
                attributes: ['currency_percent'],
                where: {
                    name: 'Toluna'
                }
            });
            const centAmt = provider.currency_percent ? provider.currency_percent : 0;
            const tObj = new TolunaHelper;
            try{
                const surveys = await tObj.getSurveys(member.id);
                var survey_list = []
                if (surveys && surveys.length) {
                    var surveyHtml = '';
                    for (let survey of surveys) {
                        let memberAmount = (centAmt !=0 && survey.PartnerAmount !=0 ) ? (survey.PartnerAmount * centAmt)/100 : 0;
                        let temp_survey = {
                            survey_number: '',
                            name: survey.Name,
                            cpi: parseFloat(memberAmount).toFixed(2),
                            loi: survey.Duration,
                            link: survey.URL
                        }
                        survey_list.push(temp_survey)
                    }
                    return {
                        status: true,
                        message: 'Success',
                        result: {
                            surveys: survey_list,
                            page_count: 1
                        }
                    }
                }
                else {
                    return {
                        staus: false,
                        message: 'Sorry! no surveys have been matched now! Please try again later.'
                    }
                }
            }
            catch(error) {
                return {
                    staus: false,
                    message: 'Unable to get survey now! Please try again later.'
                }
            }
        } else {
            return {
                status: false,
                message: 'Member not found!'
            }
        }
    }
}

module.exports = TolunaController;