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
        name: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246",
        value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246"
      },
      {
        name: "Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36",
        value: "Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36"
      },
      {
        name: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9",
        value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9"
      },
      {
        name: "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36",
        value: "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36"
      },
      {
        name: "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1",
        value: "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1"
      },
      {
        name: "Dalvik/2.1.0 (Linux; U; Android 9; ADT-2 Build/PTT5.181126.002)",
        value: "Dalvik/2.1.0 (Linux; U; Android 9; ADT-2 Build/PTT5.181126.002)"
      },
      {
        name: "Mozilla/5.0 (CrKey armv7l 1.5.16041) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.0 Safari/537.36",
        value: "Mozilla/5.0 (CrKey armv7l 1.5.16041) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.0 Safari/537.36"
      },
      {
        name: "Roku4640X/DVP-7.70 (297.70E04154A)",
        value: "Roku4640X/DVP-7.70 (297.70E04154A)"
      },
      {
        name: "Mozilla/5.0 (Linux; U; Android 4.2.2; he-il; NEO-X5-116A Build/JDQ39) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30",
        value: "Mozilla/5.0 (Linux; U; Android 4.2.2; he-il; NEO-X5-116A Build/JDQ39) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30"
      },
      {
        name: "Mozilla/5.0 (Linux; Android 9; AFTWMST22 Build/PS7233; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/88.0.4324.152 Mobile Safari/537.36",
        value: "Mozilla/5.0 (Linux; Android 9; AFTWMST22 Build/PS7233; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/88.0.4324.152 Mobile Safari/537.36"
      },
      {
        name: "Mozilla/5.0 (Linux; Android 5.1; AFTS Build/LMY47O) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/41.99900.2250.0242 Safari/537.36",
        value: "Mozilla/5.0 (Linux; Android 5.1; AFTS Build/LMY47O) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/41.99900.2250.0242 Safari/537.36"
      },
      {
        name: "Dalvik/2.1.0 (Linux; U; Android 6.0.1; Nexus Player Build/MMB29T)",
        value: "Dalvik/2.1.0 (Linux; U; Android 6.0.1; Nexus Player Build/MMB29T)"
      },
      {
        name: "AppleTV11,1/11.1",
        value: "AppleTV11,1/11.1"
      },
      {
        name: "AppleTV6,2/11.1",
        value: "AppleTV6,2/11.1"
      },
      {
        name: "AppleTV5,3/9.1.1",
        value: "AppleTV5,3/9.1.1"
      },
      {
        name: "Mozilla/5.0 (PlayStation; PlayStation 5/2.26) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15",
        value: "Mozilla/5.0 (PlayStation; PlayStation 5/2.26) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15"
      },
      {
        name: "Mozilla/5.0 (PlayStation 4 3.11) AppleWebKit/537.73 (KHTML, like Gecko)",
        value: "Mozilla/5.0 (PlayStation 4 3.11) AppleWebKit/537.73 (KHTML, like Gecko)"
      }
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
