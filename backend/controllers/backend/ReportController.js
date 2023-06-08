const Controller = require("./Controller");
const {
  Survey,
  Member,
  MemberSurvey,
  sequelize,
} = require("../../models/index");
const { Op,QueryTypes } = require("sequelize");
const queryInterface = sequelize.getQueryInterface();
const db = require("../../models/index");
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
      start_date = start_date+' 00:00:00'
    }
    if(end_date){
      end_date = end_date+' 23:59:59'
    }
    // completed_at: {
    //   [Op.between]: query_where.completed_at ?? [
    //     moment().subtract(30, 'days').toISOString(),
    //     moment().toISOString(),
    //   ],
    // },
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
        let completed_surveys = await db.sequelize.query(
          'SELECT survey_number, COUNT(*) as count FROM member_surveys Where completed_on BETWEEN ? AND ? GROUP BY survey_number',
          {
            replacements: [start_date,end_date],
            type: QueryTypes.SELECT,
          }
        );
        res.json(completed_surveys)
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
      let total_members = Member.count()
      let profile_complted_members = Member.count({where:
                                                    {profile_completed_on:{[Op.ne]: null },
                                                    }})
      res.json({total_members,profile_complted_members})
    }
  }
}

module.exports = ReportController;
