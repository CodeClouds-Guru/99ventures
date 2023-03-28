const { Survey, SurveyProvider, SurveyQuestion, SurveyQualification, SurveyAnswerPrecodes } = require('../../models');
const SchlesingerHelper = require('../../helpers/Schlesinger');
const PurespectrumHelper = require('../../helpers/Purespectrum');
const { Op } = require("sequelize");
const { capitalizeFirstLetter } = require('../../helpers/global')

class SurveySyncController {

    constructor() {
        this.pureSpectrumSurveyQuestions = this.pureSpectrumSurveyQuestions.bind(this);
        this.schlesingerSurveyQuestions = this.schlesingerSurveyQuestions.bind(this);
        this.pureSpectrumSurvey = this.pureSpectrumSurvey.bind(this);
        this.schlesingerSurvey = this.schlesingerSurvey.bind(this);
        this.pureSpectrumQualification = this.pureSpectrumQualification.bind(this);
        this.schlesingerQualification = this.schlesingerQualification.bind(this);
        this.syncSurveyQuestion = this.syncSurveyQuestion.bind(this);
        this.syncSurveyQualification = this.syncSurveyQualification.bind(this);
        this.getProvider = this.getProvider.bind(this);
        this.index = this.index.bind(this);

        /**
         * "English - United States"
         * language 3
         */
        this.schlesingerLanguageId = 3;
    }

    index(req, res){
        const action = req.params.action;
        this.getProvider(req, res);        
        if(action === 'question') {
            this.syncSurveyQuestion(req, res);
        } else if(action === 'survey') {
            this.syncSurveyQualification(req, res);
        }
    }

    async getProvider(req, res){
        const providerName = req.params.provider;
        const provider = await SurveyProvider.findOne({
            attributes: ['id'],
            where: {
                name: capitalizeFirstLetter(providerName)
            }
        });
        
        this.providerId = (provider.id).toString()
        return provider;
    }

    async syncSurveyQuestion(req, res) {
        const provider = req.params.provider;
        if(provider === 'purespectrum') {
            this.pureSpectrumSurveyQuestions(req, res);
        }
        else if(provider === 'schlesinger') {
            this.schlesingerSurveyQuestions(req, res);
        } 
        else {
            res.send(provider);
        }
    }

    async syncSurveyQualification(req, res) {
        const provider = req.params.provider;
        if(provider === 'purespectrum') {
            this.pureSpectrumQualification(req, res);
        }
        else if(provider === 'schlesinger') {
            this.schlesingerQualification(req, res);
        } 
        else {
            res.send(provider);
        }
    }


    /**
     * Pure Spectrum To create all the questions
     */
    async pureSpectrumSurveyQuestions(req, res) {
        try{
            const psObj = new PurespectrumHelper;
            const allAttributes = await psObj.fetchAndReturnData('/attributes?localization=en_US&format=true');
            
            if ('success' === allAttributes.apiStatus) {
                const qualAttributes = allAttributes.qual_attributes;                
                for(let attr of qualAttributes) {                    
                    const checkExists = await SurveyQuestion.count({
                        where: {
                            survey_provider_id: this.providerId,
                            survey_provider_question_id: attr.qualification_code,
                        },
                    });
                    if(!checkExists) {
                        await SurveyQuestion.create({
                            question_text: attr.text,
                            name: attr.desc,
                            survey_provider_id: this.providerId,
                            survey_provider_question_id: attr.qualification_code,
                            question_type: psObj.getQuestionType(attr.type),
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
     * Schlesinger To create all the questions
     */
    async schlesingerSurveyQuestions(req, res){
        try{
            const schObj = new SchlesingerHelper;
            const qualifications = await schObj.fetchAndReturnData('/definition-api/api/v1/definition/qualification-answers/lanaguge/' + this.schlesingerLanguageId);
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
                            question_type: schObj.getQuestionType(attr.qualificationTypeId),
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

    /**
     * Pure Spectrum survey
     */
    async pureSpectrumSurvey(req, res) {
        try{
            const psObj = new PurespectrumHelper;
            const allSurveys = await psObj.fetchAndReturnData('/surveys');            
            if ('success' === allSurveys.apiStatus && allSurveys.surveys) {
                //-- Disabled all the previous surveys
                const current_datetime = new Date();
                Survey.update({
                    status: psObj.getSurveyStatus(33),
                    deleted_at: new Date()
                }, {
                    where: {
                        survey_provider_id: this.providerId,
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
                        survey_provider_id: this.providerId,
                        loi: survey.survey_performance.overall.loi,
                        cpi: survey.cpi,
                        name: survey.survey_name,
                        survey_number: survey.survey_id,
                        status: psObj.getSurveyStatus(survey.survey_status),
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
                            survey_provider_id: this.providerId,
                            survey_number: survey.survey_id,
                        },
                    });
                    if(!checkExists) {
                        await Survey.create({
                            survey_provider_id: this.providerId,
                            loi: survey.survey_performance.overall.loi,
                            cpi: survey.cpi,
                            name: survey.survey_name,
                            survey_number: survey.survey_id,
                            status: psObj.getSurveyStatus(survey.survey_status),
                            original_json: survey,
                            created_at: new Date()
                        });
                    } else {
                        await Survey.update({
                            survey_provider_id: this.providerId,
                            loi: survey.survey_performance.overall.loi,
                            cpi: survey.cpi,
                            name: survey.survey_name,
                            status: psObj.getSurveyStatus(survey.survey_status),
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

    /**
     * Schlesinger survey
     */
    async schlesingerSurvey(req, res) {
        try{
            const psObj = new SchlesingerHelper();
            const allSurveys = await psObj.fetchAndReturnData('/supply-api-v2/api/v2/survey/allocated-surveys');   
                 
            if (allSurveys.Result.Success && allSurveys.Result.TotalCount !=0) {
                const surveyData = allSurveys.Surveys.filter(sr => sr.LanguageId === this.schlesingerLanguageId);
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

    /** 
     * [Pure Spectrum] To Save Survey, Qualifications, Qualification Answer
     */
    async pureSpectrumQualification(req, res) {
        try{
            //Save Surveys
            const allSurveys = await this.pureSpectrumSurvey(req, res);
            
            if(allSurveys.length) {
                const psObj = new PurespectrumHelper;
                for(let survey of allSurveys) {
                    const surveyData = await psObj.fetchAndReturnData('/surveys/' + survey.survey_number);
                    if ('success' === surveyData.apiStatus) {
                        const qualifications = surveyData.survey.qualifications;
                        if(qualifications.length){
                            for(let qualification of qualifications){
                                const questionData = await SurveyQuestion.findOne({
                                    attributes:['id', 'question_type', 'survey_provider_question_id'],
                                    where: {
                                        survey_provider_question_id: qualification.qualification_code,
                                        survey_provider_id: this.providerId
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
                                        if(qualification.condition_codes){
                                            const precodeData = await SurveyAnswerPrecodes.findOne({
                                                where: {
                                                    precode: qualification.qualification_code,
                                                    survey_provider_id: this.providerId,
                                                    option: qualification.condition_codes
                                                }
                                            });
                                            if(precodeData && precodeData.id) {
                                                await surveyQualification.addSurveyAnswerPrecodes(precodeData);
                                            }
                                        }
                                        else if(qualification.range_sets){
                                            const precodeData = await SurveyAnswerPrecodes.findAll({
                                                where: {
                                                    precode: qualification.qualification_code,
                                                    survey_provider_id: this.providerId,
                                                    option: {
                                                        [Op.between]: [qualification.range_sets[0].from, qualification.range_sets[0].to]
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
     * [Schlesinger] To Save Survey, Qualifications, Qualification Answer
     */
    async schlesingerQualification(req, res) {
        try{
            const allSurveys = await this.schlesingerSurvey(req, res);            
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

}

module.exports = SurveySyncController