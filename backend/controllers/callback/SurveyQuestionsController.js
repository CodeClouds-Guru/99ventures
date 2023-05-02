const { SurveyQuestion, SurveyAnswerPrecodes } = require('../../models');
const LucidHelper = require('../../helpers/Lucid');
const db = require('../../models/index');
class SurveyQuestionsController {
  constructor() {}
  async save(req, res) {
    const lucidHelper = new LucidHelper();
    const questions = await lucidHelper.fetchAndReturnData(
      'https://api.samplicio.us/Lookup/v1/QuestionLibrary/AllQuestions/9'
    );
    let question_list = [];
    if (questions && questions.ResultCount && questions.ResultCount > 0) {
      let question = questions.Questions;
      question.forEach(async (element) => {
        question_list.push({
          question_text: element.QuestionText,
          name: element.Name,
          survey_provider_id: '1',
          survey_provider_question_id: element.QuestionID,
          question_type: element.QuestionType,
          created_at: new Date(),
        });
      });
      await SurveyQuestion.bulkCreate(question_list, {
        updateOnDuplicate: ['survey_provider_question_id'],
        ignoreDuplicates: true,
      });
    }

    res.json({ status: true, message: 'Updated' });
    return;
  }

  async saveAnswerPrecodes(req, res) {
    let survey_questions = await SurveyQuestion.findAll({
      attributes: ['survey_provider_question_id'],
      offset: 0,
      limit: 50,
    });
    let precodes = {};
    if (survey_questions.length > 0) {
      const lucidHelper = new LucidHelper();
      survey_questions.forEach(async (element) => {
        const questions = await lucidHelper.questionOptions(
          9,
          element.survey_provider_question_id
        );
        let precode_list = [];
        if (survey_questions.length > 0) {
          questions.QuestionOptions.forEach(async (options) => {
            precode_list.push({
              option: options.OptionText,
              lucid_precode: options.Precode,
            });
          });
          precodes = await SurveyAnswerPrecodes.bulkCreate(precode_list, {
            updateOnDuplicate: ['option'],
            ignoreDuplicates: true,
          });
        }
      });
    }
    // console.log(precodes);
    res.json({ status: true, message: 'Updated', precodes: precodes });
    return;
  }
}
module.exports = SurveyQuestionsController;
