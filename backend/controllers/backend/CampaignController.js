const Controller = require('./Controller')
const { Op } = require("sequelize")
const {
  Member,
  CampaignMember,
  sequelize,
} = require("../../models/index");
class CampaignController extends Controller {
  constructor() {
    super('Campaign')
  }
  //view campaign
  async view(req, res){
    let member_id = req.body.member_id
    let report = req.body.report
    let where = {campaign_id:req.params.id}
    if(member_id){
      where['member_id'] = {member_id:member_id}
    }
    let model = await this.model.findOne({where:{id:req.params.id}});
    if(report == '1'){
      
      let members = await CampaignMember.findAll({
                                                attributes:["member_id","campaign_id","track_id","is_condition_met","is_postback_triggered","is_reversed"],
                                                  where:where,
                                                  include:
                                                    { 
                                                      model: Member,
                                                      // required: false,
                                                      attributes: ["id", "first_name", "last_name", "email","username","created_at","status"],
                                                    }
                                                  })
      model.setDataValue('report',members)
    }
    
    let fields = this.model.fields;
    return { status: true,result: model, fields };
  }
}

module.exports = CampaignController
