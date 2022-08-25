/**
 * @description All General functionalities are here in this Controller.
 * @author Debosmita
 */

const {
  Page,
  PageTemplate,
  CaptchaOption,
  CompanyPortal,
  CaptchaOptionCompanyPortal,
  AutoResponder,
} = require("../../models/index");

class GeneralController {
  constructor() {
    this.getGeneralTabData = this.getGeneralTabData.bind(this);
    this.saveGeneralTabData = this.saveGeneralTabData.bind(this);
  }

  async getGeneralTabData(req, res) {
    const site_id = req.header("site_id") || 1;
    const company_id = req.header("company_id") || 1;
    try {
      const pagesData = await Page.findAll({
        where: { company_portal_id: site_id },
      });
      const templatesData = await PageTemplate.findAll({
        where: { company_portal_id: site_id },
      });
      const captchaData = await CaptchaOption.findAll();
      const companyPortalCaptcha = await CompanyPortal.findOne({
        where: {
          id: site_id,
          company_id: company_id,
        },
        include: [{ all: true, nested: true }],
      });

      const allAutoResponderData = await AutoResponder.findAll({
        where: { deleted_at: "" },
      });

      const response = {
        pages_data: pagesData,
        templates_data: templatesData,
        captcha_data: captchaData,
        company_portal_captcha: companyPortalCaptcha,
        general_reply: allAutoResponderData,
      };
      return res.status(200).json(response);
    } catch (err) {
      console.log(err.message);
      res.status(500).json({
        status: false,
        errors: "Unable to get data",
      });
    }
  }

  async saveGeneralTabData(req, res) {
    const site_id = req.header("site_id") || 1;
    const company_id = req.header("company_id") || 1;

    try {
      const user_id = req.body.selected_page_id || 0;
      const selectedHomePageId = req.body.selected_page_id || "";
      const selectedPageTemplate = req.body.selected_template_id || "";
      const selectedCaptchaId = req.body.selected_captcha_id || "";
      const autoResponseUpdateData = req.body.auto_response_update_data
        ? JSON.parse(req.body.auto_response_update_data)
        : [];
      const autoResponseNewData = req.body.auto_response_new_data
        ? JSON.parse(req.body.auto_response_new_data)
        : [];
      const autoResponseDeleteData = req.body.auto_response_delete_data
        ? JSON.parse(req.body.auto_response_delete_data)
        : [];

      let flag = false;

      /** Code for default home changed **/
      if (selectedHomePageId !== "") {
        const prevHomePageUpdate = await Page.update(
          { is_hompage: 0 },
          { where: { company_portal_id: site_id, is_hompage: 1 } }
        );
        if (prevHomePageUpdate) {
          const currHomePageUpdate = await Page.update(
            { is_hompage: 1 },
            { where: { company_portal_id: site_id, id: selectedHomePageId } }
          );
          if (currHomePageUpdate) {
            flag = true;
          }
        }
      }

      // if (selectedPageTemplate !== '') {
      //     const prevTemplate = await PageTemplate.findOne({ where: { company_portal_id: site_id } })
      // }

      /** Code for Captcha option changed **/
      if (selectedCaptchaId !== "") {
        const prevCompanyPortalCaptcha = await CompanyPortal.findOne({
          where: {
            id: site_id,
            company_id: company_id,
          },
          include: [{ all: true, nested: true }],
        });
        const prevCapOpId =
          prevCompanyPortalCaptcha.CaptchaOptions[0]
            .captcha_option_company_portal.captcha_option_id;
        console.log(prevCompanyPortalCaptcha.CaptchaOptions);
        const updateCmporCaptcha = await CaptchaOptionCompanyPortal.update(
          { captcha_option_id: selectedCaptchaId },
          {
            where: {
              company_portal_id: site_id,
              captcha_option_id: prevCapOpId,
            },
          }
        );
        if (updateCmporCaptcha) {
          flag = true;
        }
      }

      /** Code for Auto Response ad and edit **/
      if (autoResponseNewData && autoResponseNewData.length > 0) {
        let data = [];
        autoResponseNewData.forEach((val, i) => {
          data[i] = { name: val.name, body: val.body, created_by: user_id };
        });

        const insertNewData = AutoResponder.bulkCreate(data, {
          updateOnDuplicate: ["name"],
        });
        if (insertNewData) {
          flag = true;
        }
      }

      if (autoResponseUpdateData && autoResponseUpdateData.length > 0) {
        let data = [];
        autoResponseUpdateData.forEach((val, i) => {
          data[i] = { id: val.id, name: val.name, body: val.body };
        });
        const updateData = AutoResponder.bulkCreate(data, {
          updateOnDuplicate: ["name", "body"],
        });
        if (updateData) {
          flag = true;
        }
      }

      if (autoResponseDeleteData && autoResponseDeleteData.length > 0) {
        await AutoResponder.destroy({
          where: { id: autoResponseDeleteData },
        });
      }

      if (flag) {
        return res.status(200).json({
          status: true,
          msg: "Data saved",
        });
      } else {
        res.status(500).json({
          status: false,
          errors: "Unable to save data",
        });
      }
    } catch (err) {
      console.log(err.message);
      res.status(500).json({
        status: false,
        errors: "Unable to save data",
      });
    }
  }

}

module.exports = GeneralController;
