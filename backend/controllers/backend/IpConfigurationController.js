const Controller = require('./Controller')
const {
  IpConfiguration,
  IspConfiguration,
  CompanyPortal,
  CountryConfiguration,
  BrowserConfiguration,
  Country,
} = require('../../models/index')

class IpConfigurationController extends Controller {
  constructor() {
    super('IpConfiguration')
    this.list = this.list.bind(this)
  }
  //overide list function
  async list(req, res) {
    let company_portal_id = req.headers.site_id

    //ip list
    let ip_list = await this.model.findAll({
      where: { status: 0, company_portal_id: company_portal_id },
    })
    ip_list = ip_list.map((ip_result) => {
      return ip_result.ip
    })

    //isp list
    let isp_list = await IspConfiguration.findAll({
      where: { status: 0, company_portal_id: company_portal_id },
    })
    isp_list = isp_list.map((isp_result) => {
      return isp_result.isp
    })

    //country list
    let country_list = await CountryConfiguration.findAll({ status: 0, company_portal_id: company_portal_id })
    country_list = country_list.map((country) => {
      return country.iso
    })

    //browser list
    let browser_list = await BrowserConfiguration.findAll({ status: 0, company_portal_id: company_portal_id })
    browser_list = browser_list.map((browser) => {
      return browser.browser
    })

    //all country list
    let all_country_list = await Country.findAll()
    all_country_list = all_country_list.map((country) => {
      return {
        name: country.name,
        value: country.iso
      }
    })

    //all browser list 
    let all_browser_list = [
      {
        name: "Microsoft Internet Explorer",
        value: "microsoft internet explorer"
      },
      {
        name: "Microsoft Edge",
        value: "microsoft edge"
      },
      {
        name: "Firefox",
        value: "firefox"
      },
      {
        name: "Chrome",
        value: "chrome"
      },
      {
        name: "Canary",
        value: "canary"
      },
      {
        name: "Safari",
        value: "safari"
      },
      {
        name: "Opera",
        value: "opera"
      },
    ]
    return {
      status: true,
      data: { ip_list, isp_list, country_list, browser_list },
      all_country_list: all_country_list,
      all_browser_list: all_browser_list
    }
  }
  //override save function
  async save(req, res) {
    let company_portal_id = req.headers.site_id
    let ips = req.body.ips
    let isps = req.body.isps
    let countries = req.body.countries
    let browsers = req.body.browsers

    //remove previous ip records
    await IpConfiguration.destroy({
      where: { company_portal_id: company_portal_id, status: '0' },
    })

    //store ip list
    if (ips) {
      ips = ips.map((ip) => {
        return {
          ip: ip,
          company_portal_id: company_portal_id,
          status: 0,
          created_by: req.user.id,
        }
      })
      //bulck create ip list
      await IpConfiguration.bulkCreate(ips)
    }

    //remove previous isp records
    await IspConfiguration.destroy({
      where: { company_portal_id: company_portal_id, status: 0 },
    })

    //store isp list
    if (isps) {
      isps = isps.map((isp) => {
        return {
          isp: isp,
          company_portal_id: company_portal_id,
          status: 0,
          created_by: req.user.id,
        }
      })

      //bulck create isp list
      await IspConfiguration.bulkCreate(isps)
    }

    //remove previous countries records
    await CountryConfiguration.destroy({
      where: { company_portal_id: company_portal_id, status: 0 },
    })

    //store countries list
    if (countries) {
      countries = countries.map((country) => {
        return {
          iso: country,
          company_portal_id: company_portal_id,
          status: 0,
          created_by: req.user.id,
        }
      })

      //bulck create country list
      await CountryConfiguration.bulkCreate(countries)
    }

    //remove previous browser records
    await BrowserConfiguration.destroy({
      where: { company_portal_id: company_portal_id, status: 0 },
    })

    //store browser list
    if (browsers) {
      browsers = browsers.map((browser) => {
        return {
          browser: browser,
          company_portal_id: company_portal_id,
          status: 0,
          created_by: req.user.id,
        }
      })

      //bulck create browser list
      await BrowserConfiguration.bulkCreate(browsers)
    }

    return {
      status: true,
      message: 'Record Updated',
    }
  }
}

module.exports = IpConfigurationController
