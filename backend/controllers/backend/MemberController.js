const Controller = require("./Controller");
const { Op } = require("sequelize");
const {
  MembershipTier,
  MemberSecurityInformation,
  Country,
  sequelize,
} = require("../../models/index");
class MemberController extends Controller {
  constructor() {
    super("Member");
  }

  async view(req, res) {
    let company_id = req.headers.company_id;
    let company_portal_id = req.headers.site_id;
    let member_id = req.params.id || null;
    // let type = req.body.type || null;
    if (member_id) {
      try {
        let options = {};
        options.attributes = [
          "id",
          "username",
          "referer",
          "status",
          // "membership_tier_id",
          "phone_no",
          "avatar",
          "address_1",
          "address_2",
          "address_3",
          "last_active_on",
        ];

        options.where = { [Op.and]: { id: member_id } };
        options.include = [
          {
            model: MembershipTier,
            attributes: ["name"],
          },
          {
            model: Country,
            attributes: [["nicename",'name']],
          },
          {
            model: MemberSecurityInformation,
            attributes: [
              "geo_location",
              "ip",
              "isp",
              "browser",
              "browser_language",
            ],
          },
        ];
        let result = await this.model.findOne(options);
        // result.setDataValue("MembershipTier", result.MembershipTier.name);
        let additional_details;

        // result.setDataValue("additional_details", additional_details);
        return {
          status: true,
          data: result,
        };
      } catch (error) {
        console.error(error);
        this.throwCustomError("Unable to get data", 500);
      }
    } else {
      console.error(error);
      this.throwCustomError("Unable to get data", 500);
    }
  }
}

module.exports = MemberController;
