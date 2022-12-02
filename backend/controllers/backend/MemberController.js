const Controller = require("./Controller");
const { QueryTypes, Op } = require("sequelize");
const {
  MembershipTier,
  IpLog,
  Country,
  MemberNote,
  MemberTransaction,
  MemberPaymentInformation,
  PaymentMethod,
  MemberReferral,
  MemberBalance,Member,
  User,
  sequelize,
} = require("../../models/index");
const db = require("../../models/index");
const FileHelper = require("../../helpers/fileHelper");
class MemberController extends Controller {
  constructor() {
    super("Member");
    this.view = this.view.bind(this);
    this.update = this.update.bind(this);
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
          "first_name",
          "last_name",
          "email",
          "country_code",
          "username",
          "status",
          "zip_code",
          "phone_no",
          "avatar",
          "address_1",
          "address_2",
          "address_3",
          "last_active_on",
          "country_id",
          "referral_code",
          "member_referral_id",
        ];

        options.where = { id: member_id };
        options.include = [
          {
            model: MembershipTier,
            attributes: ["name"],
          },
          {
            model: Country,
            attributes: [["nicename", "name"]],
          },
          {
            model: IpLog,
            attributes: [
              "geo_location",
              "ip",
              "isp",
              "browser",
              "browser_language",
            ],
            limit: 1,
            order: [["created_at", "DESC"]],
          },
          {
            model: MemberNote,
            attributes: [
              "user_id",
              "member_id",
              "previous_status",
              "current_status",
              "note",
              "created_at",
              "id",
            ],
            limit: 20,
            order: [["created_at", "DESC"]],
            include: {
              model: User,
              attributes: ["first_name", "last_name", "alias_name"],
            },
          },
          {
            model: MemberTransaction,
            attributes: ["member_payment_information_id"],
            limit: 1,
            where: {
              member_id: member_id,
              status: 2,
              type: "credited",
            },
            order: [["created_at", "DESC"]],
            include: {
              model: MemberPaymentInformation,
              attributes: ["name", "value"],
            },
          },

          // {
          //   model: MemberTransaction,
          //   attributes: ["note", "amount"],
          //   limit: 1,
          //   where: {
          //     member_id: member_id,
          //     type: "credited",
          //   },
          //   order: [["created_at", "DESC"]],
          // },
          {
            model: MemberReferral,
            attributes: ["referral_email", "ip", "member_id"],
            include: {
              model: Member,
              attributes: ["referral_code", "first_name",'last_name','email'],
            },
          },
        ];
        // options.include = [{ all: true, nested: true }];
        let result = await this.model.findOne(options);
        let country_list = await Country.getAllCountryList();

        //get total earnings
        let total_earnings = await this.getTotalEarnings(member_id);

        result.setDataValue("country_list", country_list);
        result.setDataValue("total_earnings", total_earnings);

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

  async update(req, res) {
    let id = req.params.id;
    let request_data = req.body;
    console.log("request_data", request_data);
    try {
      let result = false;
      if (req.body.type == "basic_details") {
        const { error, value } = this.model.validate(req);
        if (error) {
          console.log(error);
          const errorObj = new Error("Validation failed.");
          errorObj.statusCode = 422;
          errorObj.data = error.details.map((err) => err.message);
          throw errorObj;
        }
        result = this.updateBasicDetails(req, res);
        delete req.body.type;
      } else if (req.body.type == "member_status") {
        result = await this.model.changeStatus(req);
        delete req.body.type;
      } else if (req.body.type == "admin_adjustment") {
        console.log("req.body", req.body);
        result = await this.adminAdjustment(req);
        delete req.body.type;
      }
      if (result) {
        return {
          status: true,
          message: "Record has been updated successfully",
        };
      } else {
        this.throwCustomError("Unable to save data", 500);
      }
    } catch (error) {
      console.error(error);
      this.throwCustomError("Unable to save data", 500);
    }
  }

  //update member details and avatar
  async updateBasicDetails(req, res) {
    let request_data = req.body;
    try {
      request_data.updated_by = req.user.id;
      if (req.files) {
        let member = await this.model.findOne({ where: { id: req.params.id } });
        let pre_avatar = member.avatar;
        let files = [];
        files[0] = req.files.avatar;
        const fileHelper = new FileHelper(
          files,
          "members/" + req.params.id,
          req
        );
        const file_name = await fileHelper.upload();
        request_data.avatar = file_name.files[0].filename;

        if (pre_avatar != "") {
          let file_delete = await fileHelper.deleteFile(pre_avatar);
        }
      } else request_data.avatar = null;
      let model = await this.model.update(request_data, {
        where: { id: req.params.id },
      });
      return true;
    } catch (error) {
      console.error(error);
      this.throwCustomError("Unable to get data", 500);
    }
  }

  //get member total balance
  async getTotalEarnings(member_id) {
    let result = {};
    let total_earnings = await db.sequelize.query(
      "SELECT id, amount as total_amount FROM `member_balances` WHERE amount_type='cash' AND member_id=?",
      {
        replacements: [member_id],
        type: QueryTypes.SELECT,
      }
    );
    let total_adjustment = await db.sequelize.query(
      "SELECT SUM(amount) as total_adjustment FROM `member_transactions` WHERE type='credited' AND amount_action='admin_adjustment' AND member_id=?",
      {
        replacements: [member_id],
        type: QueryTypes.SELECT,
      }
    );
    console.log("total_adjustment", total_adjustment);
    result = total_earnings[0];
    result.total_adjustment = total_adjustment[0].total_adjustment;
    return result;
  }
  //get transaction details
  async adminAdjustment(req) {
    console.log("req", req);

    try {
      let member_id = req.params.id;
      let admin_amount = req.body.admin_amount || 0;
      let admin_note = req.body.admin_note || "";
      let total_earnings = await this.getTotalEarnings(member_id);
      console.log("total_earnings", total_earnings);

      let modified_total_earnings =
        parseFloat(total_earnings.total_amount) + parseFloat(admin_amount);
      let transaction_data = {
        type: "credited",
        amount: parseFloat(admin_amount),
        status: 2,
        note: admin_note,
        created_by: req.user.id,
        member_id: member_id,
        amount_action: "admin_adjustment",
        completed_at: new Date(),
      };
      console.log("transaction_data", transaction_data);
      let transaction = await MemberTransaction.create(transaction_data, {
        silent: true,
      });
      let balance = await MemberBalance.update(
        { amount: modified_total_earnings },
        {
          where: { id: total_earnings.id },
        }
      );
      if (transaction && balance) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
      this.throwCustomError("Unable to get data", 500);
    }
  }
}

module.exports = MemberController;
