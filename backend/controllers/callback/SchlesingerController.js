const { Survey, SurveyProvider, SurveyQuestion, SurveyQualification, SurveyAnswerPrecodes } = require('../../models');
const SchlesingerHelper = require('../../helpers/Schlesinger');
const { Op } = require("sequelize");

class SchlesingerController {
    static questionType = {
        1: 'singlepunch',
        2: 'multipunch',
        3: 'open-ended',
        4: 'dummy',
        5: 'calculated-dummy',
        6: 'range',
        7: 'emailType',
        8: 'info',
        9: 'compound',
        10: 'calendar',
        11: 'single-punch-image',
        12: 'multi-punch-image',
        14: 'videoType'
    }
    /**
     * "English - United States"
     * language 3
     */
    static languageId = 3;

    constructor() {
        this.getProvider = this.getProvider.bind(this);
        this.saveSurveyQuestionsAndAnswer = this.saveSurveyQuestionsAndAnswer.bind(this);
        this.syncServeyAndQualification = this.syncServeyAndQualification.bind(this);
        this.getSurveyFromAPI = this.getSurveyFromAPI.bind(this);
        if(!this.providerId){
            this.getProvider();
        }
        
    }

    async getProvider(){
        const provider = await SurveyProvider.findOne({
            attributes: ['id'],
            where: {
                name: 'Schlesinger'
            }
        });
        
        this.providerId = (provider.id).toString()
        return provider;
    }

             
    /**
     * To create all the questions
     */
    async saveSurveyQuestionsAndAnswer(req, res) {
        try{
            const schObj = new SchlesingerHelper;
            const qualifications = await schObj.fetchAndReturnData('/definition-api/api/v1/definition/qualification-answers/lanaguge/' + SchlesingerController.languageId);
            if (qualifications.result.success === true && qualifications.result.totalCount != 0) {
                const qualificationData = qualifications.qualifications; 
                const ansPrecode = [];               
                for(let attr of qualificationData) {
                    var question = await SurveyQuestion.findOne({
                        where: {
                            survey_provider_id: this.providerId,
                            survey_provider_question_id: attr.qualificationId,
                        },
                    });
                    if(question === null) {
                        var question = await SurveyQuestion.create({
                            question_text: attr.text,
                            name: attr.name,
                            survey_provider_id: this.providerId,
                            survey_provider_question_id: attr.qualificationId,
                            question_type: SchlesingerController.questionType[attr.qualificationTypeId],
                            created_at: new Date()
                        })
                    }
                    if(question && question.survey_provider_question_id) {
                        const qualificationAnswers = attr.qualificationAnswers;
                        for(let qa of qualificationAnswers){
                            if([3].includes(attr.qualificationTypeId) ){    // Ref to questionType
                                await SurveyAnswerPrecodes.findOrCreate({
                                    where: {
                                        option: null,
                                        precode: attr.qualificationId,
                                        survey_provider_id: this.providerId
                                    }
                                });
                            } if([6].includes(attr.qualificationTypeId) && attr.qualificationId == 59){ // Age
                                for(let i = 15; i<=99; i++){
                                    await SurveyAnswerPrecodes.findOrCreate({
                                        where: {
                                            option: i,
                                            precode: attr.qualificationId,
                                            survey_provider_id: this.providerId
                                        }
                                    });
                                }
                            } else {
                                await SurveyAnswerPrecodes.findOrCreate({
                                    where: {
                                        option: qa.answerId,
                                        precode: attr.qualificationId,
                                        survey_provider_id: this.providerId
                                    }
                                });
                            }    
                                   
                        }
                    }
                }
                if(ansPrecode.length) {
                    await SurveyAnswerPrecodes.bulkCreate(ansPrecode);
                }
                res.json({ status: true, message: 'Updated' });
            } else {
                res.json(qualifications);
            }
            return;
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }  


    async syncServeyAndQualification(req, res) {
        try{
            const allSurveys = await this.getSurveyFromAPI();
            // res.send(allSurveys)
            if(allSurveys.length) {
                const psObj = new SchlesingerHelper;
                for(let survey of allSurveys) {
                    const surveyData = await psObj.fetchAndReturnData('/supply-api-v2/api/v2/survey/survey-qualifications/' + survey.survey_number);
                    if (surveyData.Result.Success && surveyData.Result.TotalCount !=0) {
                        const surveyQualifications = surveyData.SurveyQualifications;
                        for(let ql of surveyQualifications){
                            const questionData = await SurveyQuestion.findOne({
                                attributes:['id', 'question_type', 'survey_provider_question_id'],
                                where: {
                                    survey_provider_question_id: ql.QualificationId,
                                    survey_provider_id: this.providerId
                                }
                            });

                            if(questionData && questionData.id) {
                                var surveyQualification = await SurveyQualification.findOne({
                                    where: {
                                        survey_id: survey.id,
                                        survey_question_id: questionData.id,
                                    },
                                });
                                if (surveyQualification == null) {
                                    var surveyQualification = await SurveyQualification.create({
                                        survey_id: survey.id,
                                        survey_question_id: questionData.id,
                                        logical_operator: 'OR',
                                        created_at: new Date()
                                    }, { silent: true });
                                }


                                if(surveyQualification && surveyQualification.id) {
                                    if(questionData.question_type == 'range' && questionData.survey_provider_question_id == 59){
                                        const start = ql.AnswerIds[0].split('-')[0];
                                        const end = ql.AnswerIds[ql.AnswerIds.length - 1].split('-')[1];
                                        
                                        const precodeData = await SurveyAnswerPrecodes.findAll({
                                            where: {
                                                precode: ql.QualificationId,
                                                survey_provider_id: this.providerId,
                                                option: {
                                                    [Op.between]: [start, end]
                                                }
                                            }
                                        });
                                        if(precodeData && precodeData.length) {
                                            await surveyQualification.addSurveyAnswerPrecodes(precodeData);
                                        }
                                    } else {
                                        const precodeData = await SurveyAnswerPrecodes.findOne({
                                            where: {
                                                precode: ql.QualificationId,
                                                survey_provider_id: this.providerId,
                                                option: (['open ended'].includes(questionData.question_type)) ? null : ql.AnswerIds
                                            }
                                        });
                                        if(precodeData && precodeData.id) {
                                            await surveyQualification.addSurveyAnswerPrecodes(precodeData);
                                        }
                                    }
                                    
                                }
                            }
                        }
                    }
                }
                res.json({ status: true, message: 'Data updated'});
            } else {
                res.json({ status: true, message: 'No survey found!' });
            }
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * To save the survey
     */
    async getSurveyFromAPI(req, res) {
        try{
            const psObj = new SchlesignerHelper();
            const allSurveys = await psObj.fetchAndReturnData('/supply-api-v2/api/v2/survey/allocated-surveys');            
            if (allSurveys.Result.Success && allSurveys.Result.TotalCount !=0) {
                const surveyData = allSurveys.Surveys.filter(sr => sr.LanguageId === SchlesignerController.languageId);
                if(!surveyData.length) {
                    res.json({ status: true, message: 'No survey found for this language!' });
                    return;
                }
                for(let survey of surveyData ){
                    const checkExists = await Survey.count({
                        where: {
                            survey_provider_id: this.providerId,
                            survey_number: survey.SurveyId,
                        },
                    });
                    if(!checkExists) {
                        await Survey.create({
                            survey_provider_id: this.providerId,
                            loi: survey.LOI,
                            cpi: survey.CPI,
                            name: null,
                            survey_number: survey.SurveyId,
                            status: 'live',
                            original_json: survey,
                            created_at: new Date()
                        });
                    } else {
                        await Survey.update({
                            loi: survey.LOI,
                            cpi: survey.CPI,
                            name: null,
                            original_json: survey,
                            updated_at: new Date()
                        }, {
                            where: {
                                survey_number: survey.SurveyId,
                            }
                        });
                    }
                }
                return await Survey.findAll({
                    where: {
                        status: 'live',
                        survey_provider_id: this.providerId,
                    }
                });
                
            } else {
                return [];
            }
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }

}
module.exports = SchlesingerController;