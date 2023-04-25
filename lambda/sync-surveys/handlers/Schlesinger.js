const Models = require("../models");
const { Op, Model } = require("sequelize");


class Schlesinger {

    constructor(record) {
        this.record = record;
        this.main = this.main.bind(this);
        this.surveySync = this.surveySync.bind(this);
        this.surveyQualificationSync = this.surveyQualificationSync.bind(this);
    }

    /**
     * 
     */
    async main() {
        const surveyId = this.surveySync();
        this.surveyQualificationSync(surveyId);
        return true;
    }

    surveySync = async()=> {
        const checkExists = await Models.Survey.findOne({
            attributes: ['id'],
            where: {
                survey_provider_id: this.record.survey_provider_id,
                survey_number: this.record.SurveyId,
            },
        });
        var surveyId = checkExists.id;
        if(checkExists) {
            await Models.Survey.update({
                loi: this.record.survey.LOI,
                cpi: this.record.survey.CPI,
                name: null,
                original_json: this.record,
                updated_at: new Date()
            }, {
                where: {
                    survey_number: this.record.SurveyId,
                }
            });
        } else {
            const survey = await Models.Survey.create({
                survey_provider_id: this.record.survey_provider_id,
                loi: this.record.survey.LOI,
                cpi: this.record.survey.CPI,
                name: null,
                survey_number: this.record.SurveyId,
                status: 'live',
                original_json: this.record,
                created_at: new Date()
            });
            surveyId = survey.id;
        }

        return surveyId;
    }

    surveyQualificationSync = async(surveyId) => {
        const qualifications = this.record.qualifications;
        for(let ql of qualifications){
            const questionData = await Model.SurveyQuestion.findOne({
                attributes:['id', 'question_type', 'survey_provider_question_id'],
                where: {
                    survey_provider_question_id: ql.QualificationId,
                    survey_provider_id: this.record.survey_provider_id
                }
            });

            if(questionData && questionData.id) {
                var surveyQualification = await Model.SurveyQualification.findOne({
                    where: {
                        survey_id: surveyId,
                        survey_question_id: questionData.id,
                    },
                });
                if (surveyQualification == null) {
                    var surveyQualification = await Model.SurveyQualification.create({
                        survey_id: surveyId,
                        survey_question_id: questionData.id,
                        logical_operator: 'OR',
                        created_at: new Date()
                    }, { silent: true });
                }


                if(surveyQualification && surveyQualification.id) {
                    if(questionData.question_type == 'range' && questionData.survey_provider_question_id == 59){
                        const start = ql.AnswerIds[0].split('-')[0];
                        const end = ql.AnswerIds[ql.AnswerIds.length - 1].split('-')[1];
                        
                        const precodeData = await Model.SurveyAnswerPrecodes.findAll({
                            where: {
                                precode: ql.QualificationId,
                                survey_provider_id: this.providerId,
                                option: {
                                    [Op.between]: [start, end]
                                }
                            }
                        });
                        if(precodeData && precodeData.length) {
                            await Model.surveyQualification.addSurveyAnswerPrecodes(precodeData);
                        }
                    } else {
                        const precodeData = await Model.SurveyAnswerPrecodes.findOne({
                            where: {
                                precode: ql.QualificationId,
                                survey_provider_id: this.providerId,
                                option: (['open ended'].includes(questionData.question_type)) ? null : ql.AnswerIds
                            }
                        });
                        if(precodeData && precodeData.id) {
                            await Model.surveyQualification.addSurveyAnswerPrecodes(precodeData);
                        }
                    }
                    
                }
            }
        }
        return true;
    }
}

module.exports = Schlesinger;