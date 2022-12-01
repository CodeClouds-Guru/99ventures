const Controller = require("./Controller");
const { Op } = require("sequelize");
const {
  MembershipTier,
  IpLog,
  Country,
  MemberNote,
  MemberTransaction,
  MemberPaymentInformation,
  PaymentMethod,
  User,
  sequelize,
} = require("../../models/index");
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
          "referer",
          "status",
          "zip_code",
          "phone_no",
          "avatar",
          "address_1",
          "address_2",
          "address_3",
          "last_active_on",
          "country_id",
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
            },
            order: [["created_at", "DESC"]],
            include: {
              model: MemberPaymentInformation,
              attributes: ["name", "value"],
            },
          },
        ];
        // options.include = [{ all: true, nested: true }];
        let result = await this.model.findOne(options);
        let country_list = await Country.findAll({
          attributes: ["id", ["nicename", "name"], "phonecode"],
        });
        // console.log(country_list);

        // let payment_email = await MemberTransaction.findOne({
        //   attributes: ["member_payment_information_id"],
        //   limit: 1,
        //   where: {
        //     member_id: member_id,
        //     status: 2,
        //   },
        //   order: [["created_at", "DESC"]],
        //   include: {
        //     model: MemberPaymentInformation,
        //     attributes: ["name", "value"],
        //   },
        // });
        let transaction_options = {};
        transaction_options.attributes = ["type", "amount", "completed_at"];
        transaction_options.limit = 5;
        transaction_options.where = {
          member_id: member_id,
          status: 2,
        };
        transaction_options.order = [["created_at", "DESC"]];
        let transaction_history = await this.getTransactionDetails(
          transaction_options
        );
        // let transaction_details = await MemberTransaction.findAll({
        //   attributes: ["type",'amount','completed_at'],
        //   limit: 5,
        //   where: {
        //     member_id: member_id,
        //     status: 2,
        //   },
        //   order: [["created_at", "DESC"]],

        // });
        result.setDataValue("country_list", country_list);
        // result.setDataValue("payment_email", payment_email);
        result.setDataValue("transaction_history", transaction_history);

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
    
    try {
      let result = false;
      if (req.body.type == "basic_details") {
        delete req.body.type;
        const { error, value } = this.model.validate(req);
        if (error) {
          console.log(error)
          const errorObj = new Error("Validation failed.");
          errorObj.statusCode = 422;
          errorObj.data = error.details.map((err) => err.message);
          throw errorObj;
        }
        result = this.updateBasicDetails(req, res);
      } else if (req.body.type == "member_status") {
        delete req.body.type;
        result = await this.model.changeStatus(req);
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
        const fileHelper = new FileHelper(files, "members", req);
        const file_name = await fileHelper.upload();
        request_data.avatar = file_name.files[0].filename;

        if (pre_avatar != "") {
          let file_delete = await fileHelper.deleteFile(pre_avatar);
        }
      }else request_data.avatar = null;
      let model = await this.model.update(request_data, {
        where: { id: req.params.id },
      });
      return true;
    } catch (error) {
      console.error(error);
      this.throwCustomError("Unable to get data", 500);
    }
  }

  //get transaction details
  async getTransactionDetails(options) {
   let result = await MemberTransaction.findAll(options);
   return result;
  }
}

module.exports = MemberController;
