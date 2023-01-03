const Controller = require('./Controller')
const { Op } = require("sequelize")
const {
  Member,
  CampaignMember,
  sequelize,
} = require("../../models/index");
class CampaignController extends Controller {
  constructor() {
    super("Campaign");
  }

  async list(req, res) {
    const options = this.getQueryOptions(req);
    let company_portal_id = req.headers.site_id;

    // var query_where = JSON.parse(req.query.where);
    // var temp = {};
    // var status_filter = {};
    // if (query_where) {
    //   if (query_where.filters) {
    //     temp = query_where.filters.map((filter) => {
    //       return {
    //         [filter.column]: {
    //           [Op[filter.match]]: filter.search,
    //         },
    //       };
    //     });
    //   }
    // }
    // options.where = {
    //   ...options.where,
    //   company_portal_id: company_portal_id,
    //   ...(temp && { [Op.and]: temp }),
    // };
    var query_str =
      "FROM campaign_member WHERE campaign_member.campaign_id = Campaign.id";

    var fields = Object.keys(this.model.fields).filter(
      (x) => !this.model.extra_fields.includes(x)
    );
    console.log(fields);
    options.attributes = fields.concat([
      [sequelize.literal(`(SELECT COUNT(*)` + query_str + `)`), "users"],
      [
        sequelize.literal(
          `(SELECT COUNT(if(campaign_member.is_condition_met=1,1,null)) ` +
            query_str +
            `)`
        ),
        "leads",
      ],
      [
        sequelize.literal(
          `(SELECT COUNT(if(campaign_member.is_reversed=1,1,null)) ` +
            query_str +
            `)`
        ),
        "reversals",
      ],
    ]);
    let page = req.query.page || 1;
    let limit = parseInt(req.query.show) || 10; // per page record
    let offset = (page - 1) * limit;
    options.limit = limit;
    options.offset = offset;
    console.log(
      util.inspect(options, { showHidden: false, depth: null, colors: true })
    );
    let result = await this.model.findAndCountAll(options);
    let pages = Math.ceil(result.count / limit);
    return {
      result: { data: result.rows, pages, total: result.count },
      fields: this.model.fields,
    };
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
    return { status: true, result: model, fields };
  }
}

module.exports = CampaignController;
