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
  SiteLayout,
} = require('../../models')
const db = require('../../models/index')
const { QueryTypes, Op } = require('sequelize')

class GeneralConfigurationController {
  constructor() {
    this.list = this.list.bind(this)
    this.save = this.save.bind(this)
  }

  async list(req, res) {
    const site_id = req.header('site_id') || 1

    let home_page_id = 0
    let default_template_id = 0
    let default_captcha_option_id = 0
    try {
      const page_options = await Page.findAll({
        attributes: ['id', 'name', 'is_homepage'],
        where: { company_portal_id: site_id },
      })
      const layout_options = await SiteLayout.findAll({
        attributes: ['id', 'name'],
      })
      const captcha_options = await CaptchaOption.findAll({
        attributes: ['id', 'name'],
      })

      const site = await CompanyPortal.findOne({
        where: {
          id: site_id,
        },
      })
      default_template_id =
        site && site.site_layout_id ? site.site_layout_id : 0

      const general_replies = await AutoResponder.findAll()

      const home_page = page_options.find(
        (page) => page.dataValues.is_homepage === 1
      )
      home_page_id = home_page ? home_page.id : 0

      const selected_captcha = await db.sequelize.query(
        'SELECT * FROM captcha_option_company_portal WHERE company_portal_id = ?',
        {
          replacements: [site_id],
          type: QueryTypes.SELECT,
        }
      )
      default_captcha_option_id =
        selected_captcha && selected_captcha.length > 0
          ? selected_captcha[0].captcha_option_id
          : 0

      const response = {
        status: true,
        page_options,
        layout_options,
        captcha_options,
        general_replies,
        home_page_id,
        default_template_id,
        default_captcha_option_id,
      }
      // return res.status(200).json(response)
      return {
        status:true,
        data: response
      }
    } catch (err) {
      console.error(err)
      res.status(500).json({
        status: false,
        errors: 'Unable to get data',
        trace: err,
      })
    }
  }

  async save(req, res) {
    const site_id = req.header('site_id') || 1
    const company_id = req.header('company_id') || 1

    try {
      const selectedHomePageId = req.body.selected_page_id || ''
      const selectedPageTemplate = req.body.selected_template_id || 0
      const selectedCaptchaId = req.body.selected_captcha_id || ''

      const autoResponseNewData = req.body.auto_response_new_data
        ? req.body.auto_response_new_data
        : []

      let flag = false

      if (selectedPageTemplate !== 0) {
        await CompanyPortal.update(
          { site_layout_id: selectedPageTemplate },
          { where: { id: site_id } }
        )
      }

      /** Code for default home changed **/
      if (selectedHomePageId !== '') {
        const prevHomePageUpdate = await Page.update(
          { is_hompage: 0 },
          { where: { company_portal_id: site_id, is_hompage: 1 } }
        )
        if (prevHomePageUpdate) {
          const currHomePageUpdate = await Page.update(
            { is_homepage: 1 },
            { where: { company_portal_id: site_id, id: selectedHomePageId } }
          )
          if (currHomePageUpdate) {
            flag = true
          }
        }
      }

      /** Code for Captcha option changed **/
      if (selectedCaptchaId !== '') {
        const prevCompanyPortalCaptcha = await CompanyPortal.findOne({
          where: {
            id: site_id,
            company_id: company_id,
          },
          include: [{ all: true, nested: true }],
        })
        // console.log(prevCompanyPortalCaptcha.CaptchaOptions);
        const prevCapOpId =
          prevCompanyPortalCaptcha.CaptchaOptions.length > 0
            ? prevCompanyPortalCaptcha.CaptchaOptions[0]
                .captcha_option_company_portal.captcha_option_id
            : ''
        let updateCmporCaptcha = false
        if (prevCapOpId !== '') {
          updateCmporCaptcha = await CaptchaOptionCompanyPortal.update(
            { captcha_option_id: selectedCaptchaId },
            {
              where: {
                company_portal_id: site_id,
                captcha_option_id: prevCapOpId,
              },
            }
          )
        } else {
          updateCmporCaptcha = await CaptchaOptionCompanyPortal.create({
            captcha_option_id: selectedCaptchaId,
            company_portal_id: site_id,
            created_by: req.user.id,
          })
        }

        if (updateCmporCaptcha) {
          flag = true
        }
      }

      /** Code for Auto Response ad and edit **/
      if (autoResponseNewData && autoResponseNewData.length > 0) {
        await AutoResponder.destroy({
          where: {
            id: {
              [Op.ne]: null,
            },
          },
        })
        let data = []
        autoResponseNewData.forEach((val, i) => {
          data[i] = { name: val.name, body: val.body, created_by: req.user.id }
        })

        const insertNewData = AutoResponder.bulkCreate(data, {
          updateOnDuplicate: ['name'],
        })
        if (insertNewData) {
          flag = true
        }
      }

      if (flag) {
        // return res.status(200).json({
        //   status: true,
        //   message: 'Data saved',
        // })
        return {
          status: true,
          message: 'Data saved',
        }
      } else {
        // res.status(500).json({
        //   status: false,
        //   errors: 'Unable to save data',
        // })
        this.throwCustomError('Unable to save data', 500);
      }
    } catch (err) {
      // console.log(err.message)
      // res.status(500).json({
      //   status: false,
      //   errors: 'Unable to save data',
      // })
      this.throwCustomError('Unable to save data', 500);
    }
  }
}

module.exports = GeneralConfigurationController
