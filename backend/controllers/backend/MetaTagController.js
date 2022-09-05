const Controller = require("./Controller");
const { CompanyPortalMetaTag } = require("../../models/index");

class MetaTagController extends Controller {
  constructor() {
    super("CompanyPortalMetaTag");
    this.list = this.list.bind(this);
    this.update = this.update.bind(this);
  }

  async list(req, res) {
    try {
      const site_id = req.header("site_id") || 1;
      const company_id = req.header("company_id") || 1;
      let meta_tag_list = await CompanyPortalMetaTag.findAll({
        where: { company_portal_id: site_id },
        attributes: ["id", "tag_name", "tag_content"],
      });
      var data = [];

      data = meta_tag_list.map((values) => {
        return {
          [values.tag_name]: values.tag_content,
        };
      });

      console.log(data);
      return res.status(200).json({
        status: true,
        data,
      });
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({
        status: false,
        errors: "Unable to get data",
      });
    }
  }

  async update(req, res) {
    try {
      const site_id = req.header("site_id") || 1;
      const company_id = req.header("company_id") || 1;
      const meta_update = req.body.meta || "";

      await CompanyPortalMetaTag.destroy({
        where: { company_portal_id: site_id },
      });

      let data = [];
      data = meta_update.map((values) => {
        return {
          tag_content: values.content,
          tag_name: values.tag_name,
          company_portal_id: site_id,
          created_by: req.user.id,
        };
      });
      console.log(data);
      const company_portal_meta = CompanyPortalMetaTag.bulkCreate(data);

      if (company_portal_meta) {
        return res.status(200).json({
          status: true,
          message: "Data saved",
        });
      }
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({
        status: false,
        errors: "Unable to get data",
      });
    }
  }
}

module.exports = MetaTagController;
