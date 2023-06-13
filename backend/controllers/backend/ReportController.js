const Controller = require("./Controller");
const {
  Survey,
  SurveyProvider,
  Member,
  MemberSurvey,
  MemberTransaction,
  sequelize,
} = require("../../models/index");
const { Op,QueryTypes } = require("sequelize");
const queryInterface = sequelize.getQueryInterface();
const db = require("../../models/index");
const moment = require('moment');
const { includes } = require("lodash");
class ReportController{
  constructor() {
    this.getReport = this.getReport.bind(this);
  }
  //override the edit function
  async getReport(req, res) {
    let type = req.query.type
    var start_date = req.query.from
    var end_date = req.query.to
    let company_portal_id = req.headers.site_id
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
    try {
      var report = {}
      switch (type) {
        case 'count_report':
          report = await this.countReport(company_portal_id);
          break;
        case 'completed_surveys':
          report = await this.completedSurveys(start_date,end_date);
          break;
        case 'open_vs_closed_tickets':
          report = await this.openVsClosedTickets(start_date,end_date,company_portal_id);
          break;
        case 'members':
          report = await this.membersReport(start_date,end_date,company_portal_id);
          break;
        case 'login_per_day':
          report = await this.loginPerDay(start_date,end_date,company_portal_id);
          break;
        case 'top_surveys':
          report = await this.topSurveys(start_date,end_date);
          break;
        case 'top_members':
          report = await this.topMembers(start_date,end_date,company_portal_id);
          break;
        default:
      }
    }catch (error) {
      console.error(error);
    }
    res.json(report)
  }
  async countReport(company_portal_id){
    //get total active surveys
    let survey_list = await Survey.findAndCountAll({where:{status:1}})
    //no of active members
    let member_list = await Member.findAndCountAll({where:{status:'member',company_portal_id:company_portal_id}})
    //no of verified members
    let verified_member = await Member.findAndCountAll({where:{admin_status:'verified',company_portal_id:company_portal_id}})
    
    return { results: {
                        no_of_surveys: survey_list.count,
                        no_of_members: member_list.count,
                        no_of_verified_members : verified_member.count
                    } 
            }
  }
  async completedSurveys(start_date,end_date){
      //get no completed surveys 
      let completed_surveys = await MemberSurvey.findAll({
      attributes:['survey_provider_id',[sequelize.fn('COUNT', '*'), 'count']],
      group:'survey_provider_id',
      where:{
        completed_on: {
          [Op.between]: [start_date,end_date]
        }
      },
      include:{
        model: SurveyProvider,
        attributes: ["name"],
      }
    })
    var survey_names = []
    var survey_count = []
    var total_completed_surveys = 0
    if(completed_surveys.length){
      for(let survey_details of completed_surveys){
        survey_names.push(survey_details.dataValues.SurveyProvider.dataValues.name)
        survey_count.push(survey_details.dataValues.count)
        total_completed_surveys = total_completed_surveys + survey_details.dataValues.count
      }
    }
    return {results:{survey_names,survey_count,total_completed_surveys}}
  }

  async openVsClosedTickets(start_date,end_date,company_portal_id){
    let tickets = await db.sequelize.query(
      'SELECT DATE(created_at) as day,status, COUNT(*) as count FROM tickets WHERE company_portal_id = ? AND created_at BETWEEN ? AND ? GROUP BY status,day',
      {
        replacements: [company_portal_id,start_date,end_date],
        type: QueryTypes.SELECT,
      }
    );

    let name_values = await this.getNameValues(start_date,end_date);
    var days_arr = name_values.names
    var total_count_arr = [...name_values.values]
    var open_count_arr = [...name_values.values]
    var pending_count_arr = [...name_values.values]
    var closed_count_arr = [...name_values.values]
    
    if(tickets.length){
      for(let i of tickets){
        let created_at = new Date(i.day)
        let diff_time = Math.abs(created_at - start_date);
        let diff_days = Math.ceil(diff_time / (1000 * 60 * 60 * 24)); 

        total_count_arr[diff_days] = total_count_arr[diff_days] + i.count
       console.log(days_arr[diff_days])
        if(i.status === 'open')
          open_count_arr[diff_days] = i.count
        else if(i.status === 'pending')
          pending_count_arr[diff_days] = i.count
        else if(i.status === 'closed')
          closed_count_arr[diff_days] = i.count
      }
    }
    return {results:{
      names:days_arr,
      values:[{
        name:'Total',
        data: total_count_arr,
      },
      {
        name:'Pending',
        data: pending_count_arr,
      },
      {
        name:'Open',
        data: open_count_arr,
      },
      {
        name:'Closed',
        data: closed_count_arr,
      }]
    }}
  }

  async membersReport(start_date,end_date,company_portal_id){
    
    let member_by_status = await Member.findAll({
      attributes:['status',[sequelize.fn('COUNT', '*'), 'count']],
      group:'status',
      where:{
        company_portal_id:company_portal_id,
        created_at: {
          [Op.between]: [start_date,end_date]
        }
      }
    })
    let profile_verified_members = await Member.findAll({
                                                attributes:[[sequelize.fn('COUNT', '*'), 'count']],
                                                where:
                                                  {admin_status:'verified',
                                                  company_portal_id:company_portal_id
                                                  }})
    let profile_complted_members = await Member.findAll({
                                                    attributes:[[sequelize.fn('COUNT', '*'), 'count']],
                                                    where:
                                                      {company_portal_id:company_portal_id,
                                                        profile_completed_on:{[Op.ne]: null },
                                                      }})
    var member_status = ['Member','Validating','Suspended','Deleted','Verified','Profile completed']
    var member_status_value = [0,0,0,0,profile_verified_members[0].dataValues.count,profile_complted_members[0].dataValues.count]

    if(member_by_status.length){
      for(let member of member_by_status){
        let status = member.dataValues.status
        status = status.charAt(0).toUpperCase() + status.slice(1)
        let status_index = member_status.indexOf(status);
        member_status_value[status_index] = member.dataValues.count
      }
    }
    return {results:{names:member_status,values:member_status_value}}
  }

  async loginPerDay(start_date,end_date,company_portal_id){
    let member_activity_logs = await db.sequelize.query(
      'SELECT DATE(member_activity_logs.created_at) as day, COUNT(*) as count FROM member_activity_logs JOIN members on member_activity_logs.member_id = members.id WHERE members.company_portal_id = ? AND action = "Member Logged In" AND member_activity_logs.created_at BETWEEN ? AND ? GROUP BY day',
      {
        replacements: [company_portal_id,start_date,end_date],
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
    return {results:{names:days_arr,values:count_arr}}
  }

  async topSurveys(start_date, end_date){
    let top_surveys = await MemberSurvey.findAll({
      attributes:['survey_number',[sequelize.fn('COUNT', '*'), 'count']],
      limit:5,
      offset:0,
      order: [[sequelize.fn('COUNT', '*'), 'DESC']],
      group:'survey_number',
      where:{
        completed_on: {
          [Op.between]: [start_date,end_date]
        }
      }
    })
    let names = []
    if(top_surveys.length){
      for(let i of top_surveys){
        let survey = await Survey.findOne({where:{survey_number:i.survey_number},
                                            include:{
                                            model: SurveyProvider,
                                            attributes: ['name'],
                                          }
                                        })
        names.push(survey.dataValues.name+" ("+ survey.dataValues.SurveyProvider.dataValues.name+")")
      }
    }
    return {
      results:{
        names:names
      }
    }
  }

  async topMembers(start_date,end_date,company_portal_id){
    let top_members = await MemberTransaction.findAll({
      attributes:['member_id',[sequelize.fn('COUNT', '*'), 'count']],
      limit:5,
      offset:0,
      order: [[sequelize.fn('COUNT', '*'), 'DESC']],
      group:'member_id',
      where:{
        type:'credited',
        amount_action:'survey',
        created_at: {
          [Op.between]: [start_date,end_date]
        }
      },
      include:{
        model: Member,
        attributes: ['first_name','last_name'],
        where:{company_portal_id: company_portal_id}
      }
    })
    let names = []
    if(top_members.length){
      for(let i of top_members){
        names.push(i.dataValues.Member.first_name+" "+ i.dataValues.Member.last_name)
      }
    }                          
    return {
        results:{
          names:names
        }
    }
  }
  //get name values structure
  async getNameValues(start_date,end_date){
    var names = []
    var values = []
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
    var dt = new Date(start_date);
    while (dt <= end_date) {
      let date = dt.getDate()
      switch (date % 10) {
        case 1: date = date+"st "+monthNames[dt.getMonth()]+","+(''+dt.getFullYear()).substr(2); break;
        case 2: date = date+"nd "+monthNames[dt.getMonth()]+","+(''+dt.getFullYear()).substr(2); break;
        case 3: date = date+"rd "+monthNames[dt.getMonth()]+","+(''+dt.getFullYear()).substr(2); break;
        default: date = date+"th "+monthNames[dt.getMonth()]+","+(''+dt.getFullYear()).substr(2); break;
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
