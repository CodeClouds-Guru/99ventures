const { Survey, SurveyQuestion, SurveyQualification, SurveyAnswerPrecodes } = require('../../models');
const PurespectrumHelper = require('../../helpers/Purespectrum');
const db = require('../../models/index');


class PureSpectrumController {
    static providerId = 3;
    static questionType = {
        1: 'singlepunch',
        2: 'singlepunch-alt',
        3: 'multipunch',
        4: 'range',
        5: 'type 5',
        6: 'type 6'
    }
    
    constructor() {}

    /**
     * To save the survey
     */
    async save(req, res) {
        try{
            const psObj = new PurespectrumHelper;
            const allSurveys = await psObj.fetchAndReturnData('/surveys');
            if ('success' === allSurveys.apiStatus) {
                const params = []
                for(let survey of allSurveys.surveys ){
                    params.push({
                        survey_provider_id: 3,
                        loi: survey.survey_performance.overall.loi,
                        cpi: survey.cpi,
                        name: survey.survey_name,
                        survey_number: survey.survey_id,
                        created_at: new Date()
                    });
                }
                
                await Survey.bulkCreate(params, {
                    updateOnDuplicate: ['survey_number'],
                    ignoreDuplicates: true,
                });
            }
            res.json({ status: true, message: 'Updated' });
            return;
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }

    async saveSurveyQuestions(req, res) {
        try{
            const psObj = new PurespectrumHelper;
            const allAttributes = await psObj.fetchAndReturnData('/attributes?localization=en_US&format=true');
            if ('success' === allAttributes.apiStatus) {
                const qualAttributes = allAttributes.qual_attributes;
                const params = []
                for(let attr of qualAttributes) {
                    params.push({
                        question_text: attr.text,
                        name: attr.desc,
                        survey_provider_id: PureSpectrumController.providerId,
                        survey_provider_question_id: attr.qualification_code,
                        question_type: PureSpectrumController.questionType[attr.type],
                        created_at: new Date()
                    })
                }
                if(params.length){
                    await SurveyQuestion.bulkCreate(params, {
                        updateOnDuplicate: ['survey_provider_question_id'],
                        ignoreDuplicates: true
                    });
                    res.json({ status: true, message: 'Updated' });
                } else {
                    res.json({ status: true, message: 'No record to update!' });
                }
                return;

            }
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }

    async saveSurveyQualification(req, res) {
        try{
            const allSurveys = await Survey.findAll({
                attributes: ['survey_number', 'id']
            })
            const params = [];
            if(allSurveys.length) {
                const psObj = new PurespectrumHelper;
                for(let survey of allSurveys) {
                    const surveyData = await psObj.fetchAndReturnData('/surveys/' + survey.survey_number);
                    if ('success' === surveyData.apiStatus) {
                        const qualifications = surveyData.survey.qualifications;
                        if(qualifications.length){
                            for(let ql of qualifications){
                                const questionData = await SurveyQuestion.findOne({
                                    where: {
                                        survey_provider_question_id: ql.qualification_code,
                                        survey_provider_id: PureSpectrumController.providerId
                                    }
                                });
                                
                                if(questionData && questionData.id) {
                                    params.push({
                                        survey_id: survey.id,
                                        survey_question_id: questionData.id,
                                        logical_operator: 'OR',
                                        created_at: new Date()
                                    })
                                }
                            }
                        }
                    }
                }
            }
            if(params.length){
                await SurveyQualification.bulkCreate(params, {
                    updateOnDuplicate: ['survey_id', 'survey_question_id'],
                    ignoreDuplicates: true
                });
                res.json({ status: true, message: 'Updated' });
            } 
            res.json({ status: true, message: 'No record to update!' });
            return;
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
}

module.exports = PureSpectrumController;