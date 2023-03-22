const {
    Member,
    Survey,
    SurveyProvider,
    SurveyQuestion,
    SurveyQualification,
    SurveyAnswerPrecodes,
    MemberEligibilities
} = require('../../models')

class SchlesingerController {

    constructor() {
        this.index = this.index.bind(this);
        this.surveys = this.surveys.bind(this);
        this.generateEntryLink = this.generateEntryLink.bind(this);
    }

    index = (req, res) => {
        const action = req.params.action;
        if(action === 'surveys')
            this.surveys(req, res);
        else if(action === 'entrylink')
            this.generateEntryLink(req, res);
        else 
            res.send('<p>Something went wrong!</p>');
    }

    surveys = async(req, res) => {
        const memberId = req.query.user_id;
        if (!memberId) {
            res.send('<p>Member id not found!</p>');
            return;
        }
        const provider = await SurveyProvider.findOne({
            attributes: ['id'],
            where: {
                name: 'Schlesinger'
            }
        });
        if (!provider) {
            res.send('<p>Survey Provider not found!</p>');
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
                attributes: ['name', 'survey_provider_question_id', 'question_type', 'id'],
                where: {
                    survey_provider_id: provider.id
                }
            }, {
                model: Member,
                attributes: ['username']
            }]
        });
        if (!eligibilities) {
            res.send('<p>You are not eligible for this survey!</p>');
            return;
        }

        const matchingQuestionCodes = eligibilities.map(eg => eg.SurveyQuestion.id);
        const matchingAnswerCodes = eligibilities
            .filter(eg => eg.SurveyQuestion.question_type !== "open ended") // Removed open ended question. We will not get the value from survey_answer_precodes
            .map(eg => eg.precode_id);

        if (matchingAnswerCodes.length && matchingQuestionCodes.length) {
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
                            option: matchingAnswerCodes // [genderCode, age]
                        },
                        required: true,
                        include: [
                            {
                                model: SurveyQuestion,
                                attributes: ['id', 'name', 'survey_provider_question_id'],
                                where: {
                                    id: matchingQuestionCodes // ['Age', 'Gender', 'Zipcode']
                                    // id: [17365, 59, 60] // ['Age', 'Gender', 'Zipcode']
                                }
                            }
                        ],
                    }
                }
            });
            if (!surveys.length) {
                res.send('<p>No matching surveys!</p>');
                return;
            }
            const queryString = {
                UID: eligibilities[0].Member.username
            };
            eligibilities.map(eg => {
                queryString['Q' + eg.SurveyQuestion.survey_provider_question_id] = eg.precode_id
            });
            const generateQueryString = new URLSearchParams(queryString).toString();

            var surveyHtml = '';
            for (let survey of surveys) {
                let link = `/schlesigner/entry-link?survey_number=${survey.survey_number}&${generateQueryString}`;
                surveyHtml += `
                    <div class="col-6 col-sm-4 col-md-3 col-xl-2">
                        <div class="bg-white card mb-2">
                            <div class="card-body position-relative">
                                <div class="d-flex justify-content-between">
                                    <h6 class="text-primary m-0">Exciting New Survey #${survey.survey_number}</h6>
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
            res.send(surveyHtml);
        } else {
            res.send('<p>Member eiligibility not found!</p>');
        }

        return;
    }

    generateEntryLink = async(req, res) => {
        const queryString = req.query;
        const data = await Survey.findOne({
            attributes: ['original_json'],
            where: {
                survey_number: queryString.survey_number
            }
        });
        delete queryString['survey_number'];
        const generateQueryString = new URLSearchParams(queryString).toString();

        if (data && data.original_json) {
            const liveLink = data.original_json.LiveLink;
            const updatedLiveLink = liveLink.replace('[#scid#]', Date.now())
            const entryLink = updatedLiveLink + '&' + generateQueryString;
            res.send(entryLink)
        } else {
            res.send(data)
        }
    }
}

module.exports = SchlesingerController;