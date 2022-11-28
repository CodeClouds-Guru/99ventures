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
        console.log(country_list)
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
      if (req.body.type == "basic_details") {
        delete req.body.type;
        this.updateBasicDetails(req, res);
      } else if (req.body.type == "change_avatar") {
        delete req.body.type;
        this.changeAvatar(req, res);
      } else {
        res.status(401).json({
          status: false,
          errors: "Type is required.",
        });
      }

      return {
        message: "Record has been updated successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  //update member basic details
  async updateBasicDetails(req, res) {
    let request_data = req.body.data;
    
    try {
      request_data.updated_by = req.user.id;
      let model = await this.model.update(request_data, {
        where: { id: req.params.id },
      });
      return {
        message: "Record has been updated successfully",
      };
    } catch (error) {
      throw error;
    }
  }
  //change avatar
  async changeAvatar(req, res) {
    if (req.files) {
      let member = await this.model.findOne(options);
      let pre_avatar = member.avatar;
      let files = [];
      files[0] = req.files.avatar;
      const fileHelper = new FileHelper(files, "members", req);
      const file_name = await fileHelper.upload();
      await this.model.update(
        {
          avatar: file_name.files[0].filename,
        },
        { where: { id: req.params.id } }
      );
      if (pre_avatar != "") {
        let file_delete = await fileHelper.deleteFile(pre_avatar);
      }
      // let profile_details = await this.profileDetails(req)
      res.status(200).json({
        status: true,
        message: "Avatar Updated.",
      });
    } else {
      res.status(422).json({
        status: false,
        errors: "Avatar is required.",
      });
    }
  }
}

module.exports = MemberController;
