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
  constructor() {}

  async save(req, res) {
    const logger1 = require('../helpers/Logger')(
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
        // if(record.message_reason == 'updated'){
        //    model = await Survey.update(
        //     {
        //       survey_provider_id: survey_provider.id,
        //       loi: record.length_of_interview,
        //       cpi: record.cpi,
        //       name: record.survey_name,
        //       survey_number: record.survey_id,
        //     },
        //     { where: { survey_number: record.survey_id,} }
        //   );
        // }else{
          model = await Survey.create(
            {
              survey_provider_id: survey_provider.id,
              loi: record.length_of_interview,
              cpi: record.cpi,
              name: record.survey_name,
              survey_number: record.survey_id,
              status:status,
              original_json:record
            },
            { silent: true }
          );
        // }
        if (record.survey_qualifications.length > 0) {
          record.survey_qualifications.map(async (record1) => {
            let obj = survey_questions.find(
              (val) => val.survey_provider_question_id === record1.question_id
            );
            if (obj) {
              let model1 = await SurveyQualification.create(
                {
                  survey_id: model.id,
                  survey_question_id: obj.id,
                  logical_operator: record1.logical_operator,
                },
                { silent: true }
              );
              record1.precodes.map(async (precode) => {
                let answer_precode = await SurveyAnswerPrecodes.create(
                  {
                    option: precode,
                    lucid_precode: record1.question_id,
                  },
                  { silent: true }
                );
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
        }
      });

      res.json({
        status:true,
        message:"Survey Updated."
      })
    }else{
      res.json({
        status:false,
        message:"No survey found."
      })
    }
  }
}

module.exports = SurveycallbackController;
