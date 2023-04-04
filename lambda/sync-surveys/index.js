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
      let obj = await survey_questions.find(
      (val) => val.survey_provider_question_id === record1.question_id
      );
      if (obj) {
      let model1 = await SurveyQualification.create(
        {
          survey_id: model.id,
          survey_question_id: obj.id,
          logical_operator: record1.logical_operator,
        },
        { silent: true,
          ignoreDuplicates:true
        }
      );
  
      record1.precodes.map(async (precode) => {
        let precode_data = {
          option:precode,
          precode: record1.question_id
        }
        var answer_precode = await SurveyAnswerPrecodes.findOne({
          where: precode_data,
        });
        if (!answer_precode) {
          answer_precode = await SurveyAnswerPrecodes.create(precode_data);
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
      console.error(error);
    }
};

exports.handler = async (event) => {
  console.log('event object', event);
  try{
    if(event.Records){
      event.Records.forEach(async (record) => {
        record = JSON.parse(record.body)
        let survey_questions = await SurveyQuestion.findAll({
          attributes: ['survey_provider_question_id','id'],
        });
        let model = {};
        let data = {
          survey_provider_id:record.survey_provider_id,
          status:record.is_live || record.is_live === 'true' ? 'active' : 'draft',
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
        if (obj) {
          survey_status = 'updated';
          model = await obj.update(data);
        } else {
          model = await Survey.create(data);
        }

        if (
          'survey_qualifications' in record &&
          Array.isArray(record.survey_qualifications) &&
          record.survey_qualifications.length > 0
        ) {
          let qualification_ids = [];
          //clear all the previous records if the status is updated
          if (survey_status === 'updated') {
            //get all qualification
            var qualification_ids_rows = await SurveyQualification.findAll({
              where: { survey_id: model.id },
              attributes: ['id'],
            });
            qualification_ids = qualification_ids_rows.map((qualification_id) => {
              return qualification_id.id;
            });
            if (qualification_ids.length > 0) {
              //remove qualifications
              await SurveyQualification.destroy({
                where: {
                  id: {
                    [Op.in]: qualification_ids,
                  },
                },
                force: true,
              });
              await db.sequelize.query(
                'DELETE FROM `survey_answer_precode_survey_qualifications` WHERE `survey_qualification_id` IN (' +
                qualification_ids.join(',') +
                ')',
                { type: QueryTypes.DELETE }
              );
            }
          }
          //store survey qualifications
          await storeSurveyQualifications(record, model, survey_questions);
        }
      });
    }
  } catch (error) {
    console.error(error);
  }finally {
    return true;
  }
};
