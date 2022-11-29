const Controller = require("./Controller");
const { Op } = require("sequelize");
const {
  MembershipTier,
  MemberSecurityInformation,
  Country,
  sequelize,
} = require("../../models/index");
const FileHelper = require("../../helpers/fileHelper");
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

        options.where = { [Op.and]: { id: member_id } };
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
        let country_list = await Country.findAll({
          attributes: ["id", ["nicename", "name"], "phonecode"],
        });
        console.log(country_list);
        result.setDataValue("country_list", country_list);

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
    console.log(request_data);

    const { error, value } = this.model.validate(req);
    if (error) {
      const errorObj = new Error("Validation failed.");
      errorObj.statusCode = 422;
      errorObj.data = error.details.map((err) => err.message);
      throw errorObj;
    }
    try {
      let result = this.updateBasicDetails(req, res);

      if (result) {
        return {
          status: true,
          message: "Record has been updated successfully",
        };
      } else {
        console.error(error);
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
      }
      let model = await this.model.update(request_data, {
        where: { id: req.params.id },
      });
      return true;
    } catch (error) {
      console.error(error);
      this.throwCustomError("Unable to get data", 500);
    }
  }
}

module.exports = MemberController;
