const Controller = require('./Controller')
const {
  IpConfiguration,
  IspConfiguration,
  CompanyPortal,
} = require('../../models/index')

class IpConfigurationController extends Controller {
  constructor() {
    super('IpConfiguration')
    this.list = this.list.bind(this)
    this.getIpDowntimeSettings = this.getIpDowntimeSettings.bind(this)
    this.updateIpDowntimeData = this.updateIpDowntimeData.bind(this)
  }
  //overide list function
  async list(req, res) {
    let company_portal_id = req.headers.site_id
    let ip_list = await this.model.findAll({
      where: { status: 0, company_portal_id: company_portal_id },
    })
    ip_list = ip_list.map((ip_result) => {
      return ip_result.ip
    })
    let isp_list = await IspConfiguration.findAll({
      where: { status: 0, company_portal_id: company_portal_id },
    })
    isp_list = isp_list.map((isp_result) => {
      return isp_result.isp
    })

    res.status(200).json({
      status: true,
      ip_list,
      isp_list,
    })
  }
  //override save function
  async save(req, res) {
    let company_portal_id = req.headers.site_id
    let ips = req.body.ips
    let isps = req.body.isps

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
    res.status(200).json({
      status: true,
      message: 'Record Updated',
    })
  }

  /** Fetch ip downtime data **/
  async getIpDowntimeSettings(req, res) {
    try {
      const site_id = req.header('site_id') || 1
      const company_id = req.header('company_id') || 1
      let ip_list = await this.model.findAll({
        where: { status: 0, company_portal_id: site_id },
        attributes: ['ip'],
      })
      ip_list = ip_list.map((ip_result) => {
        return ip_result.ip
      })
      const downtime_text = await CompanyPortal.findOne({
        where: { company_id: company_id },
        attributes: ['downtime_message', 'status'],
      })
      return res.status(200).json({
        status: true,
        data: { ip_list, downtime_text },
      })
    } catch (err) {
      console.log(err.message)
      return res.status(500).json({
        status: false,
        errors: 'Unable to get data',
      })
    }
  }

  /** Update ip downtime data **/
  async updateIpDowntimeData(req, res) {
    try {
      console.log(req.body)
      const site_id = req.header('site_id') || 1
      const company_id = req.header('company_id') || 1
      const shutdown_checked = req.body.shutdown_checked || false
      const updated_downtime_text = req.body.updated_downtime_text || ''
      const new_ip_list = req.body.new_ip_list || []
      let flag = false

      let comPorData = []
      if (updated_downtime_text !== '') {
        comPorData.downtime_message = updated_downtime_text
      }
      if (shutdown_checked !== '') {
        comPorData.status = shutdown_checked == true ? 2 : 1;
      }
      if (comPorData) {
        const company_portal_update = await CompanyPortal.update(comPorData, {
          where: { id: site_id },
        })
        if (company_portal_update) {
          flag = true
        }
      }

      if (new_ip_list.length > 0) {
        //remove previous ip records
        await this.model.destroy({
          where: { company_portal_id: site_id, status: '0' },
        })

        console.log(req.body.new_ip_list)
        let data = []
        data = new_ip_list.map((ip) => {
          return {
            ip: ip,
            company_portal_id: site_id,
            status: 0,
            created_by: 1,
          }
        })

        const insertNewData = this.model.bulkCreate(data, {
          updateOnDuplicate: ['ip'],
        })
        if (insertNewData) {
          flag = true
        }
      }

      if (flag) {
        return res.status(200).json({
          status: true,
          message: 'Data saved',
        })
      } else {
        return res.status(500).json({
          status: false,
          errors: 'Unable to save data',
        })
      }
    } catch (err) {
      console.log(err.message)
      return res.status(500).json({
        status: false,
        errors: 'Unable to get data',
      })
    }
  }
}

module.exports = IpConfigurationController
