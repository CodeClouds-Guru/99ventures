const {
    Member,
    Survey,
    SurveyProvider,
    SurveyQuestion,
    SurveyQualification,
    SurveyAnswerPrecodes,
    MemberEligibilities
} = require('../../models');
const SchlesingerHelper = require('../../helpers/Schlesinger');

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
            throw error('Invalid access!');
    }

    surveys = async(req, res) => {
        try{
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
                    name: 'Schlesinger'
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
                res.json({
                    status: false,
                    message:'You are not eligible for this survey!'
                });
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
                    res.json({
                        status: false,
                        message: 'No matching surveys!'
                    });
                    return;
                }
                const queryString = {
                    uid: eligibilities[0].Member.username
                };
                eligibilities.map(eg => {
                    queryString['Q' + eg.SurveyQuestion.survey_provider_question_id] = eg.precode_id
                });
                const generateQueryString = new URLSearchParams(queryString).toString();

                var surveyHtml = '';
                for (let survey of surveys) {
                    let link = `/schlesigner/entrylink?survey_number=${survey.survey_number}&${generateQueryString}`;
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
                res.send({
                    status: true,
                    message: 'Success',
                    result: surveyHtml
                });
            } else {
                res.json({
                    status: false,
                    message: 'Member eiligibility not found!'
                });
            }

            return;
        }
        catch(error) {
            console.error(error)
            res.status(500).json({
                status: false,
                message: 'Something went wrong!'
            });
        }
    }

    generateEntryLink = async(req, res) => {
        try{
            const queryString = req.query;
            const data = await Survey.findOne({
                attributes: ['original_json'],
                where: {
                    survey_number: queryString.survey_number
                }
            });

            if (data && data.original_json) {
                const schObj = new SchlesingerHelper;
                const result = await schObj.fetchSellerAPI('api/v2/survey/survey-quotas/' + queryString.survey_number);
                
                if(
                    result.Result.Success === true && 
                    result.Result.TotalCount != 0
                ) {
                    const surveyQuota = result.SurveyQuotas.filter(sv => sv.TotalRemaining > 1);
                    if( surveyQuota.length ){
                        delete queryString['survey_number'];
                        const params = Object.fromEntries(new URLSearchParams(queryString));
                        const liveLink = data.original_json.LiveLink;
                        const liveLinkArry = liveLink.split('?');
                        const liveLinkParams = Object.fromEntries(new URLSearchParams(liveLinkArry[1]))
                        params.pid = Date.now();
                        delete liveLinkParams['zid'];   // We dont have any value for zid
                        const entryLink = liveLinkArry[0] + '?' + new URLSearchParams({...liveLinkParams, ...params}).toString();
                        res.redirect(entryLink)
                    }
                    else {
                        this.updateSurvey(queryString.survey_number);
                        req.session.flash = { error: 'No quota exists!', redirect_url: '/schlesigner' };
                        res.redirect('/notice');
                    }                    
                } else {
                    this.updateSurvey(queryString.survey_number);
                    req.session.flash = { error: 'Survey quota does not exists!', redirect_url: '/schlesigner' };
                    res.redirect('/notice');
                }
            } else {
                req.session.flash = { error: 'Unable to get entry link!', redirect_url: '/schlesigner' };
                res.redirect('/notice');
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    updateSurvey = async(surveyNumber) => {
        await Survey.update({
            status: 'draft',
            deleted_at: new Date()
        }, {
            where: {
                survey_number: surveyNumber
            }
        });
    }
}

module.exports = SchlesingerController;