const axios = require("axios");
const { Member, Campaign, sequelize } = require("../models/index");
const { QueryTypes } = require("sequelize");

class CampaignCallbackHelper {
  constructor(member_id, track_id) {
    this.member_id = 1;
    this.track_id = track_id;
  }
  async makeRequest() {
    let member_campaign = await sequelize.query(
      "SELECT * FROM campaign_member WHERE member_id = ?",
      {
        replacements: [this.member_id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    let result = await Campaign.findOne({
      attributes: [
        "name",
        "affiliate_network",
        "payout_amount",
        "trigger_postback",
        "postback_url",
        "track_id",
        "condition_type",
      ],
      where: { id: member_campaign[0].campaign_id },
      include: {
        model: Member,
        where: { id: member_campaign[0].member_id },
        required: false,
        attributes: ["id", "first_name", "last_name", "email"],
      },
    });
    let postback_url = result.postback_url;

    let data = {};
    if (result.postback_url) {
      const config = {
        method: "get",
        url: "http://localhost:4000/api/profile",
        headers: {
          "User-Agent": "Axios- console app",
          company_id: 1,
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxfSwiaWF0IjoxNjcyNjY3Njg2LCJleHAiOjE2NzI3Njc2ODZ9._9LGCsnv4-LPtwt_kc9uL6Yc9_PbeFB5nkd8F7-DN2U",
        },
      };
      let res = await axios(config);
      data = res.data;
    }
    console.log(data);
    return data ;
  }
}
module.exports = CampaignCallbackHelper;
