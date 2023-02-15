const {
    SurveyQuestion
  } = require('../../models');
  const LucidHelper = require('../../helpers/Lucid')
  class SurveyQuestionsController{
    constructor() {
    }
    async save(req,res){
        const lucidHelper = new LucidHelper();
        const questions = await lucidHelper.fetchAndReturnData("https://api.samplicio.us/Lookup/v1/QuestionLibrary/AllQuestions/7");
        let question_list = []
        if(questions && questions.ResultCount && questions.ResultCount > 0){
          let question= questions.Questions
          question.forEach(element => {
            question_list.push({question_text:element.QuestionText,name:element.Name,survey_provider_id:'1',survey_provider_question_id:element.QuestionID,question_type:element.QuestionType,created_at:new Date()})
          });
          await SurveyQuestion.bulkCreate(question_list)
        }
        
        res.json({status: true,message:"Updated"})
        return
    }
}
module.exports = SurveyQuestionsController;