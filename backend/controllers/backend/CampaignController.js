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

    // options.attributes = Object.keys(this.model.fields).concat([
    //   [
    //     // Note the wrapping parentheses in the call below!
    //     sequelize.literal(
    //       `(SELECT COUNT(*) as users, COUNT(if(is_condition_met=1,1,null)) as leads, COUNT(if(is_reversed=1,1,null)) as reversals FROM campaign_member WHERE campaign_member.campaign_id = Campaign.id)`
    //     ),
    //     'laughReactionsCount'
    //   ],
    // ]);
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
