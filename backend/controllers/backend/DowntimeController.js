const Controller = require('./Controller')
const {
  IpConfiguration,
  IspConfiguration,
  CompanyPortal,
} = require('../../models/index')

class DowntimeController extends Controller {
  constructor() {
    super('IpConfiguration')
    this.list = this.list.bind(this)
    this.update = this.update.bind(this)
  }

  /** Fetch ip downtime data **/
  async list(req, res) {
    try {
      const site_id = req.header('site_id') || 1
      const company_id = req.header('company_id') || 1
      let ip_list = await this.model.findAll({
        where: { status: 1, company_portal_id: site_id },
        attributes: ['ip'],
      })
      ip_list = ip_list.map((ip_result) => {
        return ip_result.ip
      })
      const downtime_text = await CompanyPortal.findOne({
        where: { id: site_id },
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
  async update(req, res) {
    try {
      // console.log(req.body)
      const site_id = req.header('site_id') || 1
      const company_id = req.header('company_id') || 1
      const shutdown_checked =
        'shutdown_checked' in req.body ? req.body.shutdown_checked : ''
      const updated_downtime_text = req.body.updated_downtime_text || ''
      const new_ip_list = req.body.new_ip_list || null
      let flag = false

      let comPorData = []
      if (updated_downtime_text !== '') {
        comPorData.downtime_message = updated_downtime_text
      }
      if (shutdown_checked !== '') {
        comPorData.status = shutdown_checked ? 2 : 1
      }
      if (comPorData) {
        const company_portal_update = await CompanyPortal.update(comPorData, {
          where: { id: site_id },
        })
        if (company_portal_update) {
          flag = true
        }
      }

      if (new_ip_list) {
        //remove previous ip records
        await IpConfiguration.destroy({
          where: { company_portal_id: site_id, status: 1 },
        })

        // console.log(req.body.new_ip_list)
        let data = []
        data = new_ip_list.map((ip) => {
          return {
            ip: ip,
            company_portal_id: site_id,
            status: 1,
            created_by: 1,
          }
        })

        const insertNewData = await IpConfiguration.bulkCreate(data, {
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

module.exports = DowntimeController
