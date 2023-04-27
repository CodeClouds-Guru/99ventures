const Models = require("../models");
const { Op, Model } = require("sequelize");

class Schlesinger {

    constructor(record) {
        this.record = record;
        this.main = this.main.bind(this);
        this.surveySync = this.surveySync.bind(this);
        this.surveyQualificationSync = this.surveyQualificationSync.bind(this);
    }

    async main() {
        console.log('Main Func');
        const surveyId = await this.surveySync();
        await this.surveyQualificationSync(surveyId);
        return true;
    }

    surveySync = async()=> {
        const params = {
            loi: this.record.LOI,
            cpi: this.record.CPI,
            name: null,
            original_json: this.record,
            updated_at: new Date(),
            survey_number: this.record.SurveyId,
            survey_provider_id: this.record.survey_provider_id
        }

        const checkExists = await Models.Survey.findOne({
            attributes: ['id'],
            where: {
                survey_provider_id: this.record.survey_provider_id,
                survey_number: this.record.SurveyId,
            },
        });
        if(checkExists) { 
            params.id = checkExists.id;
            await checkExists.destroy();
        }
        const survey = await Models.Survey.create(params);
        console.log('surveySync Func');
        return survey.id;
    }

    surveyQualificationSync = async(surveyId) => {
        console.log('surveySync Func');
        if(this.record.qualifications){
            const qualifications = this.record.qualifications;
            if(qualifications.length){
                const qualificationIds = qualifications.map(ql => ql.QualificationId);
                const questionData = await Models.SurveyQuestion.findAll({
                    attributes:['id', 'question_type', 'survey_provider_question_id'],
                    where: {
                        survey_provider_id: this.record.survey_provider_id,
                        survey_provider_question_id: {
                            [Op.in]: qualificationIds
                        }
                    },
                    include: {
                        model: Models.SurveyAnswerPrecodes
                    }
                });
        
                const params = questionData.map(qd => {
                    let params = {
                        survey_id: surveyId,
                        survey_question_id: qd.id,
                        logical_operator: 'OR',
                        created_at: new Date(),
                    }
                    if(qd.SurveyAnswerPrecodes && qd.SurveyAnswerPrecodes.length){
                        const data = qd.SurveyAnswerPrecodes.filter(pr=> qualifications.some(ql=> ql.QualificationId == pr.precode && ql.AnswerIds.includes(pr.option)));
                        if(data && data.length){
                            params.SurveyAnswerPrecodes = data
                        }
                    }
                    return params;
                });

                params.forEach(async el => {
                    const surveyQualification = await Models.SurveyQualification.create(el);
                    await surveyQualification.addSurveyAnswerPrecodes(el.SurveyAnswerPrecodes);
                });
    
            }
        }
        return true;
    }
}

module.exports = Schlesinger;