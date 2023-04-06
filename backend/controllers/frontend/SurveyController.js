const {
    Member,
    SurveyProvider,
    Survey,
    SurveyQuestion,
    SurveyQualification,
    SurveyAnswerPrecodes,
    MemberEligibilities
  } = require('../../models');
  const db = require('../../models/index');
  const { QueryTypes } = require('sequelize');
  
  class SurveyController {
    constructor() {
      this.getSurvey = this.getSurvey.bind(this)
    }
    //get survey details based on member eligibility
    async getSurvey(req,res){
        //res.send(req.session.member.id)
        
        let survey_provider_id = req.query.provider_id || ''
        let result = []
        if(survey_provider_id == ''){
          result = await this.getProviders()
        }else{
          result = await this.getMatchedSurvey(survey_provider_id)
        }
        res.json(result)
    }
    //get survey providers
    async getProviders(){
      return await SurveyProvider.findAll({where:{status:1}});
    }
    //matched survey
    async getMatchedSurvey(survey_provider_id){
      let member_id = 1;
      let member_details = await MemberEligibilities.findAll({where:{member_id:member_id}})
      let surveys = []
      if(member_details){
        let match_string = []
        member_details.forEach(async (element) => {
          match_string.push("(survey_qualifications.survey_question_id = "+element.survey_question_id+" AND survey_answer_precodes.lucid_precode = "+element.precode_id+") ")
        });
        surveys = await db.sequelize.query(
          "SELECT surveys.id, surveys.name FROM `surveys` JOIN survey_qualifications on surveys.id = survey_qualifications.survey_id JOIN survey_answer_precode_survey_qualifications on survey_qualifications.id = survey_answer_precode_survey_qualifications.survey_qualification_id JOIN survey_answer_precodes on survey_answer_precode_survey_qualifications.survey_answer_precode_id = survey_answer_precodes.id WHERE survey_provider_id = "+survey_provider_id+" AND status = 'active' AND ("+match_string.join('OR')+");", { type: QueryTypes.SELECT}
        );
      }
      return surveys
    }
  }
  
  module.exports = SurveyController;
  