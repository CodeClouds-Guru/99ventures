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
      
    }
    //get survey details based on member eligibility
    async getSurvey(req,res){
        res.send(req.session.member)
    }
  }
  
  module.exports = SurveyController;
  