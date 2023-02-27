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
const { QueryTypes, Op } = require('sequelize');

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
    let survey = req.body;
    try {
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
          if (record.is_live == true || record.is_live == 'true') {
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
            status: status
          }
          var survey_status = 'created';
          var obj = await Survey.findOne({ where: { survey_number: record.survey_id, survey_provider_id: survey_provider.id } })
          if (obj) {
            survey_status = 'updated'
            model = await obj.update(data);
          }
          else {
            model = await Survey.create(data);
          }

          if (record.survey_qualifications.length > 0) {
            let qualification_ids = []
            //clear all the previous records if the status is updated
            if (survey_status === 'updated') {
              //get all qualification 
              var qualification_ids_rows = await SurveyQualification.findAll({ where: { survey_id: model.id }, attributes: ['id'] })
              qualification_ids = qualification_ids_rows.map((qualification_id) => {
                return qualification_id.id
              })
              if (qualification_ids.length > 0) {
                //remove qualifications
                await SurveyQualification.destroy({
                  where: { [Op.in]: { id: qualification_ids } }, force: true
                });
                await db.sequelize.query(
                  "DELETE FROM `survey_answer_precode_survey_qualifications` WHERE `survey_qualification_id` IN (" + qualification_ids.join(',') + ")", { type: QueryTypes.DELETE }
                );
              }
            }
            //store survey qualifications
            await this.storeSurveyQualifications(record, model, survey_questions, req)
          }
        });
      }
    } catch (error) {
      const logger1 = require('../../helpers/Logger')(
        `lucid-sync-errror.log`
      );
      logger1.error(error.message);
    } finally {
      const logger1 = require('../../helpers/Logger')(
        `lucid.log`
      );
      logger1.info(JSON.stringify(req.body));
      res.status(200).json({
        status: true,
        message: "Data synced."
      });
    }
  }

  //function to store survey qualifications
  async storeSurveyQualifications(record, model, survey_questions, req) {
    try {
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

            var answer_precode = await SurveyAnswerPrecodes.findOne({ where: { lucid_precode: precode } });
            if (!answer_precode) {
              answer_precode = await SurveyAnswerPrecodes.create({
                option: '',
                lucid_precode: precode,
              });
            }
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
    } catch (error) {
      const logger1 = require('../../helpers/Logger')(
        `lucid-sync-errror.log`
      );
      logger1.info(JSON.stringify(req.query));
      logger1.info(JSON.stringify(req.body));
    }
  }
}

module.exports = SurveycallbackController;
