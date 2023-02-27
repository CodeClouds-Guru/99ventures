const {
  MemberTransaction,
  Member,
  SurveyProvider,
  Survey,
  SurveyQuestion,
  SurveyQualification,
  SurveyAnswerPrecodes,
} = require('../../models');
const db = require('../../models/index');
const { QueryTypes } = require('sequelize');

class SurveycallbackController {
  constructor() {
    this.storeSurveyQualifications = this.storeSurveyQualifications.bind(this)
    this.syncSurvey = this.syncSurvey.bind(this)
  }

  async save(req, res) {
    const logger1 = require('../../helpers/Logger')(
      `outcome-${req.params.provider}.log`
    );
    // console.log('===================req', req);
    logger1.info(JSON.stringify(req.query));
    logger1.info(JSON.stringify(req.body));

    const provider = req.params.provider;
    if (provider === 'cint') {
      const username = req.params.ssi;
      const reward = req.params.reward;

      let member = await Member.findOne({
        attributes: ['id', 'username'],
        where: {
          username: username,
        },
      });
      if (member) {
        const note = provider;
        const transaction_obj = {
          member_id: member ? member.id : null,
          amount: reward,
          note: note + ' ' + req.params.status,
          type: 'credited',
          amount_action: 'survey',
          created_by: null,
          payload: JSON.stringify(req.query),
        };
        console.log('transaction_obj', transaction_obj);
        let result = await MemberTransaction.updateMemberTransactionAndBalance(
          transaction_obj
        );
        res.send(req.query);
      }
    }
  }

  async syncSurvey(req, res) {
    // const logger1 = require('../../helpers/Logger')(
    //   req.params.provider + '.log'
    // );
    // //   console.log('===================req', req);
    // logger1.info(JSON.stringify(req.query));
    // logger1.info(JSON.stringify(req.body));
    let survey = req.body;
    // let survey = require('./test.json');
    // console.log(survey, survey.length);
    
      try{
        if (survey.length > 0) {
          const provider = req.params.provider;
          //get survey provider
          let survey_provider = await SurveyProvider.findOne({
            attributes: ['id'],
            where: { name: provider.charAt(0).toUpperCase() + provider.slice(1) },
          });
          //survey questions
          let survey_questions = await SurveyQuestion.findAll({
            attributes: ['survey_provider_question_id'],
          });
          survey.map(async (record) => {
            let status = 'draft'
            if(record.is_live == true || record.is_live == 'true'){
              status = 'active'
            }
            //create survey
            let model = {};
            let data = {
              survey_provider_id: survey_provider.id,
              loi: record.length_of_interview,
              cpi: record.cpi,
              name: record.survey_name,
              survey_number: record.survey_id,
              status:status
            }
            let survey_status = 'created';
            model = await Survey.findOne({where:{ survey_number: record.survey_id }})
                                  .then(function(obj) {
                                  // update
                                  if(obj){
                                    survey_status = 'updated'
                                    return obj.update(data);
                                  }
                                  else
                                    return Survey.create(data);
                      })
            
            if (record.survey_qualifications.length > 0) {
              let qualification_ids = []
              //clear all the previous records if the status is updated
              if(survey_status == 'updated'){
                //get all qualification 
                qualification_ids = await SurveyQualification.findAll({where:{survey_id:model.id},attributes:['id']})
                qualification_ids = qualification_ids.map((qualification_id) => {
                  return qualification_id.id
                })
                if(qualification_ids.length > 0){
                  //remove qualifications
                  await SurveyQualification.destroy({ where: { id: qualification_ids },force:true });
                  await db.sequelize.query(
                    "DELETE FROM `survey_answer_precode_survey_qualifications` WHERE `survey_qualification_id` IN ("+qualification_ids+")", { type: QueryTypes.DELETE}
                  );
                }
              }
              //store survey qualifications
              await this.storeSurveyQualifications(record,model,survey_questions,req)
            }
          });
        }else{
          const logger1 = require('../../helpers/Logger')(
            `lucid-sync-errror.log`
          );
          logger1.info(JSON.stringify(req.query));
          logger1.info(JSON.stringify(req.body));
          res.status(200).json({
            status: true,
            message:"No survey found."
          });
        }
      }catch (error) {
        const logger1 = require('../../helpers/Logger')(
          `lucid-sync-errror.log`
        );
        logger1.info(JSON.stringify(req.query));
        logger1.info(JSON.stringify(req.body));
      } finally {
        res.status(200).json({
          status: true,
          message:"Data synced."
        });
      }
    
  }

  //function to store survey qualifications
  async storeSurveyQualifications(record,model,survey_questions,req){
    try{
      record.survey_qualifications.map(async (record1) => {
        let obj = survey_questions.find(
          (val) => val.survey_provider_question_id === record1.question_id
        );
        if (obj) {
            let model1 = await SurveyQualification.create(
              {
                survey_id: model.id,
                survey_question_id: record1.question_id,
                logical_operator: record1.logical_operator,
              },
              { silent: true }
            );
            
          record1.precodes.map(async (precode) => {
          
            let answer_precode = await SurveyAnswerPrecodes.findOne({where:{ lucid_precode: precode}})
                          .then(function(obj) {
                          // update
                          if(obj)
                            return obj
                          else{
                            return SurveyAnswerPrecodes.create({
                                              option: '',
                                              lucid_precode: precode,
                                            },
                                            { silent: true }
                                          );
                          }
              })
            await db.sequelize.query(
              'INSERT INTO survey_answer_precode_survey_qualifications (survey_qualification_id, survey_answer_precode_id) VALUES (?, ?)',
              {
                type: QueryTypes.INSERT,
                replacements: [model1.id, answer_precode.id],
              }
            );
          });
        }
      });
    }catch (error) {
      const logger1 = require('../../helpers/Logger')(
        `lucid-sync-errror.log`
      );
      logger1.info(JSON.stringify(req.query));
      logger1.info(JSON.stringify(req.body));
    }
  }
}

module.exports = SurveycallbackController;
