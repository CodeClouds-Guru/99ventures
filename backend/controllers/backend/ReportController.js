const Controller = require("./Controller");
const {
  Survey,
  Member,
  MemberSurvey,
  MemberActivityLog,
  sequelize,
} = require("../../models/index");
const { Op,QueryTypes } = require("sequelize");
const queryInterface = sequelize.getQueryInterface();
const db = require("../../models/index");
const moment = require('moment');
class ReportController{
  constructor() {
    this.getReport = this.getReport.bind(this);
  }
  //override the edit function
  async getReport(req, res) {
    let type = req.query.type
    var start_date = req.query.from
    var end_date = req.query.to
    if(start_date){
      start_date = new Date(start_date+' 00:00:00')
    }else{
      start_date = moment().subtract(30, 'days').toISOString()
    }
    if(end_date){
      end_date = new Date(end_date+' 23:59:59')
    }else{
      end_date = moment().toISOString()
    }
    if(type == 'count_report'){
        //get total active surveys
        let survey_list = await Survey.findAndCountAll({where:{status:1}})
        //no of active members
        let member_list = await Member.findAndCountAll({where:{status:'member'}})
        //no of verified members
        let verified_member = await Member.findAndCountAll({where:{admin_status:'verified'}})
        
        res.json({ results: {
                            no_of_surveys: survey_list.count,
                            no_of_members: member_list.count,
                            no_of_verified_members : verified_member.count
                        } 
                });
    }else if(type == 'completed_surveys'){
        //get no completed surveys 
        // let completed_surveys = await db.sequelize.query(
        //   'SELECT survey_number, COUNT(*) as count FROM member_surveys Where completed_on BETWEEN ? AND ? GROUP BY survey_number',
        //   {
        //     replacements: [start_date,end_date],
        //     type: QueryTypes.SELECT,
        //   }
        // );


        let completed_surveys = await MemberSurvey.findAll({
          attributes:['survey_number',[sequelize.fn('COUNT', '*'), 'count']],
          group:'survey_number',
          where:{
            completed_on: {
              [Op.between]: [start_date,end_date]
            }
          }
          // include:{
          //   model: Survey,
          //   required: true,
          //   attributes: ["name"],
          // }
        })

        var survey_numbers = []
        var survey_arr = {}
        var survey_names = []
        var survey_count = []
        var total_completed_surveys = 0
        if(completed_surveys){
          survey_numbers = completed_surveys.map((completed_survey) => {
            return completed_survey.survey_number
          })
        }
        if(survey_numbers.length){
          let survey = await Survey.findAll({where:{survey_number:survey_numbers},attributes:['survey_number','name']})
        //    let survey = await db.sequelize.query(
        //   'SELECT survey_number, COUNT(*) as count FROM surveys WHERE survey_number BETWEEN ? AND ? GROUP BY survey_number',
        //   {
        //     replacements: [start_date,end_date],
        //     type: QueryTypes.SELECT,
        //   }
        // );
          if(survey){
            for(let i of survey){
              let sur_num = i.survey_number
              survey_arr[sur_num] = i.name
            }
          }
        }
        for(let survey_details of completed_surveys){
          let sur_num = survey_details.dataValues.survey_number
          survey_names.push(survey_arr[sur_num])
          survey_count.push(survey_details.dataValues.count)
          total_completed_surveys = total_completed_surveys + survey_details.dataValues.count
        }
        res.json({results:{survey_names,survey_count,total_completed_surveys}})
    }else if(type == 'open_vs_closed_tickets'){
      let tickets = await db.sequelize.query(
        'SELECT status, COUNT(*) as count FROM tickets GROUP BY status',
        {
          type: QueryTypes.SELECT,
        }
      );
      res.json(tickets)
    }
    else if(type == 'members'){
      let member_by_status = await Member.findAll({
        attributes:['status',[sequelize.fn('COUNT', '*'), 'count']],
        group:'status',
        where:{
          created_at: {
            [Op.between]: [start_date,end_date]
          }
        }
      })
      let profile_complted_members = await Member.findAll({
                                                  attributes:[[sequelize.fn('COUNT', '*'), 'count']],
                                                  where:
                                                    {profile_completed_on:{[Op.ne]: null },
                                                    }})
      res.json({results:{profile_complted_members,member_by_status}})
    }
    else if(type == 'login_per_day'){
      let member_activity_logs = await db.sequelize.query(
                                        'SELECT DATE(created_at) as day, COUNT(*) as count FROM member_activity_logs Where action = "Member Logged In" AND created_at BETWEEN ? AND ? GROUP BY day',
                                        {
                                          replacements: [start_date,end_date],
                                          type: QueryTypes.SELECT,
                                        }
                                      );
      let name_values = await this.getNameValues(start_date,end_date);
      var days_arr = name_values.names
      var count_arr = name_values.values
      if(member_activity_logs.length){
        for(let i of member_activity_logs){
          let created_at = new Date(i.day)
          let diff_time = Math.abs(created_at - start_date);
          let diff_days = Math.ceil(diff_time / (1000 * 60 * 60 * 24)); 
          count_arr[diff_days] = i.count
        }
      }
      res.json({results:{names:days_arr,values:count_arr}})
    }
  }
  //get name values structure
  async getNameValues(start_date,end_date){
    var names = []
    var values = []
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
    var dt = start_date;
    console.log(dt,end_date)
    while (dt <= end_date) {
      let date = dt.getDate()
      switch (date % 10) {
        case 1: date = date+"st "+monthNames[dt.getMonth()]; break;
        case 2: date = date+"nd "+monthNames[dt.getMonth()]; break;
        case 3: date = date+"rd "+monthNames[dt.getMonth()]; break;
        default: date = date+"th "+monthNames[dt.getMonth()]; break;
      }
      names.push(date)
      values.push(0)
      dt.setDate(dt.getDate() + 1);
    }
    return {
      names:names,
      values:values
    }
  }
}

module.exports = ReportController;
