const Controller = require("./Controller");
const util = require("util");

const { Member, sequelize } = require("../../models/index");
class CampaignController extends Controller {
  constructor() {
    super("Campaign");
  }

  async list(req, res) {
    // var emailHelper = new EmailHelper(req)
    // var send_mail = await emailHelper.sendMail('<b>hello</b>','sourabh.das@codeclouds.in');
    // return send_mail
    const options = this.getQueryOptions(req);
    let company_portal_id = req.headers.site_id;
    var query_str =
      "FROM campaign_member WHERE campaign_member.campaign_id = Campaign.id";
      
    var fields = Object.keys(this.model.fields).filter(
      (x) => !this.model.extra_fields.includes(x)
    );
    console.log(fields)
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
  async view(req, res) {
    let model = await this.model.findOne({
      where: { id: req.params.id },
      include: {
        model: Member,
        required: false,
        attributes: ["id", "first_name", "last_name", "email"],
      },
    });
    let fields = this.model.fields;
    return { status: true, result: model, fields };
  }
}

module.exports = CampaignController;
