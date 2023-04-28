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

    async registerMember(req, res) {
        try{
            const tObj = new TolunaHelper;
            const payload = {
                "PartnerGUID": process.env.PARTNER_GUID,
                "MemberCode": "cc-106",
                "Email": "cc106@mailinator.com",
                "BirthDate": "6/21/1992",
                "PostalCode": "15235",
                "AnsweredQuestions":
                [
                    {"QuestionID":1001007,"AnswerID":2000247},
                    {"QuestionID":1001101,"AnswerID":2002275},
                    {"QuestionID":1001107,"AnswerID":2002330},
                    {"QuestionID":1001012,"AnswerID":2000270},
                    {"QuestionID":1005145,"AnswerID":2796316},
                    {"QuestionID":1001102,"AnswerID":2002280},
                    {"QuestionID":1012395,"AnswerID":3056609}
                ]
            }
            await tObj.addMemebr(payload);
            res.send('Member Created!');
        } catch(error) {
            res.send(error)
        }
    }

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
        const tObj = new TolunaHelper;
        const surveys = await tObj.getSurveys(member.username);
    }
}

module.exports = TolunaController;