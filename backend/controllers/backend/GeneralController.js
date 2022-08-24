/**
 * @description All General functionalities are here in this Controller.
 * @author Debosmita
 */

const {
    Page,
    PageTemplate,
    CaptchaOption,
    CompanyPortal,
    CaptchaOptionCompanyPortal
} = require('../../models/index')


class GeneralController {
    constructor() {
    }

    async getGeneralTabData(req, res) {
        const site_id = req.header('site_id') || 1
        const company_id = req.header('company_id') || 1
        try {
            const pagesData = await Page.findAll({ where: { company_portal_id: site_id } })
            const templatesData = await PageTemplate.findAll({ where: { company_portal_id: site_id } })
            const captchaData = await CaptchaOption.findAll()
            const companyPortalCaptcha = await CompanyPortal.findOne({
                where: {
                    id: site_id,
                    company_id: company_id
                },
                include: [{ all: true, nested: true }],
            })

            const response = {
                pages_data: pagesData,
                templates_data: templatesData,
                captcha_data: captchaData,
                company_portal_captcha: companyPortalCaptcha,
                general_reply: ''
            }
            return res.status(200).json(response)
        } catch (err) {
            console.log(err.message)
            res.status(500).json({
                status: false,
                errors: 'Unable to get data',
            })
        }
    }

    async saveGeneralTabData(req, res) {
        const site_id = req.header('site_id') || 1
        const company_id = req.header('company_id') || 1

        try {
            const selectedHomePageId = req.body.selected_page_id || ''
            const selectedPageTemplate = req.body.selected_template_id || ''
            const selectedCaptchaId = req.body.selected_captcha_id || ''

            if (selectedHomePageId !== '') {
                const prevHomePageUpdate = await Page.update({ is_hompage: 0 }, { where: { company_portal_id: site_id, is_hompage: 1 } })
                if (prevHomePageUpdate) {
                    const currHomePageUpdate = await Page.update({ is_hompage: 1 }, { where: { company_portal_id: site_id, id: selectedHomePageId } })
                    if (currHomePageUpdate) {
                        return res.status(200).json({ message: 'Successfully updated' })
                    }

                }
            }
            // if (selectedPageTemplate !== '') {
            //     const prevTemplate = await PageTemplate.findOne({ where: { company_portal_id: site_id } })
            // }
            // if (selectedCaptchaId !== '') {
            //     const prevCompanyPortalCaptcha = await CompanyPortal.findOne({
            //         where: {
            //             id: site_id,
            //             company_id: company_id
            //         },
            //         include: [{ all: true, nested: true }],
            //     })
            //     const updateCmporCaptcha = await CaptchaOptionCompanyPortal.update({ captcha_option_id: selectedCaptchaId }, { where: { company_portal_id: site_id, captcha_option_id: prevCompanyPortalCaptcha.CaptchaOptions.captcha_option_company_portal.captcha_option_id } })
            // }


        } catch (err) {
            console.log(err.message)
            res.status(500).json({
                status: false,
                errors: 'Unable to save data',
            })
        }
    }
}

module.exports = GeneralController

