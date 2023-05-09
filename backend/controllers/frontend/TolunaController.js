const {
    Member,
    MemberEligibilities
} = require('../../models');
const TolunaHelper = require('../../helpers/Toluna');

class TolunaController {

    constructor(){
        this.registerMember = this.registerMember.bind(this);
        this.getSurveys = this.getSurveys.bind(this);
    }

    /**
     * To register a member with profile data
     * @param {*} req 
     * @param {*} res 
     */
    async registerMember(req, res) {
        try{
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
                        "Answers": [{"AnswerID":2000247}]
                    },
                    {
                        "QuestionID": 1001101,
                        "Answers": [{"AnswerID":2002275}]
                    },
                    {
                        "QuestionID": 1001107,
                        "Answers": [{"AnswerID": 2002330}]
                    },
                    {
                        "QuestionID": 1001012,
                        "Answers": [{"AnswerID": 2000270}]
                    },
                    {
                        "QuestionID": 1005145,
                        "Answers": [{"AnswerID": 2796316}]
                    },
                    {
                        "QuestionID": 1001102,
                        "Answers": [{"AnswerID": 2002280}]
                    },
                    {
                        "QuestionID": 1012395,
                        "Answers": [{"AnswerID": 3056609}]
                    }
                ]
            }
            await tObj.addMemebr(payload);
            res.send('Member Created!');
        } catch(error) {
            res.send(error)
        }
    }

    /**
     * To get the surveys
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async getSurveys(req, res) {
        if(!req.session.member) {
            res.status(401).json({
                status: false,
                message: 'Unauthorized!'
            });
            return;
        }
        const memberId = req.query.user_id;
        if (!memberId) {
            res.status(422).json({
                status: false,
                message: 'Member id not found!'
            });
            return;
        }
        const member = await Member.findOne({
            attributes: ['username'],
            where: {
                id: memberId
            }
        });
        
        if(member){
            const tObj = new TolunaHelper;
            const surveys = await tObj.getSurveys(member.username);
            if(surveys && surveys.length) {
                var surveyHtml = '';
                for (let survey of surveys) {
                    surveyHtml += `
                        <div class="col-6 col-sm-4 col-md-3 col-xl-2">
                            <div class="bg-white card mb-2">
                                <div class="card-body position-relative">
                                    <div class="d-flex justify-content-between">
                                        <h6 class="text-primary m-0">${survey.Name}</h6>
                                    </div>
                                    <div class="text-primary small">${survey.Duration} Minutes</div>
                                    <div class="d-grid mt-1">
                                        <a href="${survey.URL}" class="btn btn-primary text-white rounded-1">Earn $${survey.MemberAmount}</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
                }
                res.json({
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
        } else {
            res.json({
                status: false,
                message: 'Member not found!'
            });
        }
    }
}

module.exports = TolunaController;