const { Survey, SurveyQuestion, SurveyQualification, SurveyAnswerPrecodes } = require('../../models');
const PurespectrumHelper = require('../../helpers/Purespectrum');
const { Op } = require("sequelize");

class PureSpectrumController {
    static providerId = 3;
    static questionType = {
        1: 'singlepunch',
        2: 'singlepunch-alt',
        3: 'multipunch',
        4: 'range',
        5: 'open-ended',
        6: 'type 6'
    }

    static surveyStatus = {
        11: 'draft',
        22: 'live',
        33: 'paused',
        44: 'closed'
    }
    
    constructor() {}

    /**
     * To create all the questions
     */
    async saveSurveyQuestions(req, res) {
        try{
            const psObj = new PurespectrumHelper;
            const allAttributes = await psObj.fetchAndReturnData('/attributes?localization=en_US&format=true');
            if ('success' === allAttributes.apiStatus) {
                const qualAttributes = allAttributes.qual_attributes;                
                for(let attr of qualAttributes) {                    
                    const checkExists = await SurveyQuestion.count({
                        where: {
                            survey_provider_id: PureSpectrumController.providerId,
                            survey_provider_question_id: attr.qualification_code,
                        },
                    });
                    if(!checkExists) {
                        await SurveyQuestion.create({
                            question_text: attr.text,
                            name: attr.desc,
                            survey_provider_id: PureSpectrumController.providerId,
                            survey_provider_question_id: attr.qualification_code,
                            question_type: PureSpectrumController.questionType[attr.type],
                            created_at: new Date()
                        })
                    }
                }
                res.json({ status: true, message: 'Updated' });
            } else {
                res.json(allAttributes);
            }
            return;
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }    

    /**
     * To Save Survey, Qualifications, Qualification Answer
     * 
     * @param {*} req 
     * @param {*} res 
     */
    async survey(req, res){
        try{
            //Save Surveys
            const allSurveys = await PureSpectrumController.prototype.getSurveyFromAPI();
            
            if(allSurveys.length) {
                const psObj = new PurespectrumHelper;
                for(let survey of allSurveys) {
                    const surveyData = await psObj.fetchAndReturnData('/surveys/' + survey.survey_number);
                    if ('success' === surveyData.apiStatus) {
                        const quotas = surveyData.survey.quotas;
                        if(quotas.length){
                            for(let quota of quotas){
                                const questionData = await SurveyQuestion.findOne({
                                    attributes:['id', 'question_type', 'survey_provider_question_id'],
                                    where: {
                                        survey_provider_question_id: quota.criteria[0].qualification_code,
                                        survey_provider_id: PureSpectrumController.providerId
                                    }
                                });
                                
                                // Qualifications insert || Find
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
                                    // Survey Precode Check and survey_answer_precode_survey_qualifications save
                                    if(surveyQualification && surveyQualification.id) {
                                        const criteria = quota.criteria[0];
                                        if(criteria.condition_codes){
                                            const precodeData = await SurveyAnswerPrecodes.findOne({
                                                where: {
                                                    precode: criteria.qualification_code,
                                                    survey_provider_id: PureSpectrumController.providerId,
                                                    option: criteria.condition_codes[0]
                                                }
                                            });
                                            if(precodeData && precodeData.id) {
                                                await surveyQualification.addSurveyAnswerPrecodes(precodeData);
                                            }
                                        }
                                        else if(criteria.range_sets){
                                            const precodeData = await SurveyAnswerPrecodes.findAll({
                                                where: {
                                                    precode: criteria.qualification_code,
                                                    survey_provider_id: PureSpectrumController.providerId,
                                                    option: {
                                                        [Op.between]: [criteria.range_sets[0].from, criteria.range_sets[0].to]
                                                    }
                                                }
                                            });
                                            
                                            if(precodeData && precodeData.length) {
                                                await surveyQualification.addSurveyAnswerPrecodes(precodeData);
                                            }
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
            return;
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
            const psObj = new PurespectrumHelper;
            const allSurveys = await psObj.fetchAndReturnData('/surveys');            
            if ('success' === allSurveys.apiStatus && allSurveys.surveys) {
                //-- Disabled all the previous surveys
                const current_datetime = new Date();
                Survey.update({
                    survey_provider_id: PureSpectrumController.providerId,
                    status: PureSpectrumController.surveyStatus[33],
                    deleted_at: new Date()
                }, {
                    where: {
                        status: 'live',
                        created_at: {
                            [Op.lt]: current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate()
                        },
                    }
                });
                //----------

                /*
                const params = []
                for(let survey of allSurveys.surveys ){
                    params.push({
                        survey_provider_id: PureSpectrumController.providerId,
                        loi: survey.survey_performance.overall.loi,
                        cpi: survey.cpi,
                        name: survey.survey_name,
                        survey_number: survey.survey_id,
                        status: PureSpectrumController.surveyStatus[survey.survey_status],
                        original_json: survey,
                        created_at: new Date()
                    });
                }
                
                const result = await Survey.bulkCreate(params, {
                    updateOnDuplicate: ['loi', 'cpi', 'name', 'status', 'original_json']
                });
                return result;
                */

                for(let survey of allSurveys.surveys ){
                    const checkExists = await Survey.count({
                        where: {
                            survey_provider_id: PureSpectrumController.providerId,
                            survey_number: survey.survey_id,
                        },
                    });
                    if(!checkExists) {
                        await Survey.create({
                            survey_provider_id: PureSpectrumController.providerId,
                            loi: survey.survey_performance.overall.loi,
                            cpi: survey.cpi,
                            name: survey.survey_name,
                            survey_number: survey.survey_id,
                            status: PureSpectrumController.surveyStatus[survey.survey_status],
                            original_json: survey,
                            created_at: new Date()
                        });
                    } else {
                        await Survey.update({
                            survey_provider_id: PureSpectrumController.providerId,
                            loi: survey.survey_performance.overall.loi,
                            cpi: survey.cpi,
                            name: survey.survey_name,
                            status: PureSpectrumController.surveyStatus[survey.survey_status],
                            original_json: survey,
                            updated_at: new Date()
                        }, {
                            where: {
                                survey_number: survey.survey_id,
                            }
                        });
                    }
                }
                return await Survey.findAll({
                    where: {
                        status: 'live',
                        survey_provider_id: PureSpectrumController.providerId,
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


    /*async saveSurveyQualification(req, res) {
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
                const result = await SurveyQualification.bulkCreate(params, {
                    updateOnDuplicate: ['survey_id', 'survey_question_id'],
                    ignoreDuplicates: true
                });
                res.json({ status: true, message: 'Updated', data: result });
            } else {
                res.json({ status: true, message: 'No record to update!' });
            }
            return;
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }*/
}

module.exports = PureSpectrumController;