const AWS = require('aws-sdk');
require('dotenv').config();

const { QueryTypes, Op, json } = require('sequelize');
const {
  SurveyProvider,
  Survey,
  SurveyQuestion,
  SurveyQualification,
  SurveyAnswerPrecodes,
} = require('./models');
const db = require('./models/index');

const storeSurveyQualifications = async (record, model, survey_questions) => {
  try {
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
          {
            silent: true,
            ignoreDuplicates: true
          }
        );

        record1.precodes.map(async (precode) => {
          let precode_data = {
            option: precode,
            precode: record1.question_id
          }
          var answer_precode = await SurveyAnswerPrecodes.findOrCreate({
            where: precode_data,
          });
          // if (!answer_precode) {
          //   answer_precode = await SurveyAnswerPrecodes.create(precode_data);
          // }

          await db.sequelize.query(
            'INSERT INTO survey_answer_precode_survey_qualifications (survey_qualification_id, survey_answer_precode_id) VALUES (?, ?)',
            {
              type: QueryTypes.INSERT,
              replacements: [model1.id, answer_precode[0].id],
            }
          );
        });
      }
    });
  } catch (error) {
    console.error(error);
  }
};

const main = async (event) => {
  if (event.Records) {
    event.Records.forEach(async (record) => {
      record = JSON.parse(record.body)
      let survey_questions = await SurveyQuestion.findAll({
        attributes: ['survey_provider_question_id', 'id'],
        raw: true
      });
      let model = {};
      let data = {
        survey_provider_id: record.survey_provider_id,
        status: record.is_live || record.is_live === 'true' ? 'active' : 'draft',
        loi: record.length_of_interview,
        cpi: record.cpi,
        name: record.survey_name,
        survey_number: record.survey_id,
        original_json: record
      };
      var survey_status = 'created';
      var obj = await Survey.findOne({
        where: {
          survey_number: record.survey_id,
          survey_provider_id: record.survey_provider_id,
        },
      });
      let survey_record_id = 0
      if (obj) {
        data.id = obj.id
        await Survey.destroy({ where: { id: obj.id }, force: true })
        await SurveyQualification.destroy({
          where: { survey_id: obj.id },
          force: true,
        });
        // survey_status = 'updated';
        // model = await obj.update(data);
      } else {
        // model = await Survey.create(data);
      }
      model = await Survey.create(data);
      if (
        'survey_qualifications' in record &&
        Array.isArray(record.survey_qualifications) &&
        record.survey_qualifications.length > 0
      ) {
        let qualification_ids = [];
        //clear all the previous records if the status is updated
        //////////////

        /*if (survey_status === 'updated') {
          //get all qualification
          // var qualification_ids_rows = await SurveyQualification.findAll({
          //   where: { survey_id: model.id },
          //   attributes: ['id'],
          // });
          // qualification_ids = qualification_ids_rows.map((qualification_id) => {
          //   return qualification_id.id;
          // });
          // if (qualification_ids.length > 0) {
          //   //remove qualifications
          //   await SurveyQualification.destroy({
          //     where: {
          //       id: {
          //         [Op.in]: qualification_ids,
          //       },
          //     },
          //     force: true,
          //   });
          //   await db.sequelize.query(
          //     'DELETE FROM `survey_answer_precode_survey_qualifications` WHERE `survey_qualification_id` IN (' +
          //     qualification_ids.join(',') +
          //     ')',
          //     { type: QueryTypes.DELETE }
          //   );
          // }
        }*/
        //store survey qualifications
        await storeSurveyQualifications(record, model, survey_questions);
      }
    });
  }
  return true;
}

// exports.handler = 
const abc = async (event) => {
  try {
    return await main(event);
  } catch (error) {
    console.error(error);
  } finally {
    await db.sequelize.connectionManager.pool.destroyAllNow();
  }
};

abc({
  Records: [
    {
      messageId: '4e3c99ce-7c43-4455-9c8a-698c1748b66d',
      receiptHandle: 'AQEB2mgyeiQ1ol9cRoOarcEmjSsXJY6IxgkqYDg7ZZj0IX1l5Q3++EFm9IbNAornIJi47sHGe1cagCWJ2MTGERcU18R6YDs+72TQWwSS62yGhmOdUK9DDg+Mxp3qQRhFSp66JOy0Q8Tzd3VaPANCvWcn+U0bHhrjH1XeFGcLpBr/ZkFsowHkSgFAU5T3azc5gDDAd+d/TeAcUuMdKXuKeMLm8k8Ym0JazRyG5fjo7Fb6RRoStqMfL8L0MuXooqwJY/Bo+b2wm7Xs9aDcebmo3oTqHXoeo4C29QC8PYqwdbFFP5k6X3hFIEoGPcwko7vl6ZJuQHaS0lANKhXoF1jLP9mj9KFuNrKj0JJiMSxdDNwg6C3gOiMygM6XPSC/XEPLQ/xT3CvPlh3Yr9nrXlTWQYw8Og==',
      body: '{"message_reason":"updated","survey_id":33703324,"survey_name":"QLB-003906042023 - US :: 1","account_name":"QuestionLab","country_language":"eng_us","industry":"other","study_type":"adhoc","bid_length_of_interview":15,"bid_incidence":20,"collects_pii":false,"survey_group_ids":[2485033],"is_live":true,"survey_quota_calc_type":"completes","is_only_supplier_in_group":false,"cpi":4.5,"total_client_entrants":100,"total_remaining":3,"completion_percentage":0.85,"conversion":0.17,"overall_completes":17,"mobile_conversion":0.09,"earnings_per_click":0.765,"length_of_interview":17,"termination_length_of_interview":0,"respondent_pids":[],"survey_quotas":[{"survey_quota_id":171855347,"survey_quota_type":"Total","quota_cpi":4.5,"conversion":0.17,"number_of_respondents":3,"questions":[]}],"survey_qualifications":[{"question_id":42,"logical_operator":"OR","precodes":["25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45","46","47","48","49","50","51","52","53","54","55","56","57","58","59","60","61","62","63","64","65","66","67","68","69","70","71","72","73","74","75","76","77","78","79","80","81","82","83","84","85","86","87","88","89","90","91","92","93","94","95","96","97","98","99"]},{"question_id":43,"logical_operator":"OR","precodes":["1","2"]},{"question_id":645,"logical_operator":"OR","precodes":["10","11","12","13","4","5","6","7","8","9"]},{"question_id":646,"logical_operator":"OR","precodes":["11","12","13"]},{"question_id":2189,"logical_operator":"OR","precodes":["1","2","3","4"]},{"question_id":5729,"logical_operator":"OR","precodes":["1","10","11","12","13","14","15","16","17","18","19","2","21","22","23","24","25","28","29","3","30","31","32","33","34","35","37","39","4","40","41","42","44","45","46","47","48","49","5","50","52","53","6","7","8","9"]},{"question_id":14785,"logical_operator":"OR","precodes":["1","10","11","12","13","14","15","16","17","18","19","2","20","21","22","23","24","25","26","27","3","4","5","6","7","8","9"]},{"question_id":15297,"logical_operator":"OR","precodes":["2","3","4"]},{"question_id":22467,"logical_operator":"OR","precodes":["1","2","3","4","5","6","7","8"]}],"survey_provider_id":1}',
    }
  ]
});
