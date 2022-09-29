const Controller = require('./Controller')
const { EmailConfiguration } = require('../../models/index')

class EmailConfigurationController extends Controller {
  constructor() {
    super('EmailConfiguration')
    this.view = this.view.bind(this)
    this.save = this.save.bind(this)
  }
  //get email configuration details
  async view(req, res) {
    let company_id = req.headers.company_id
    let site_id = req.headers.site_id
    let email_details = await EmailConfiguration.findOne({
      where: { company_portal_id: site_id },
    })
    return {
      status: true,
      data: email_details,
    }
  }
  //update email configuration
  async save(req, res) {
    let company_portal_id = req.headers.site_id
    req.body.company_portal_id = company_portal_id
    const { error, value } = EmailConfiguration.validate(req)
    if (error) {
      let message = error.details.map((err) => err.message).join(', ')
      this.throwCustomError(message, 401);
    }
    //
    let email_details = await EmailConfiguration.findOne({
      where: { company_portal_id: company_portal_id },
    })
    if (email_details) {
      req.params.id = email_details.id
      await super.update(req)
    } else {
      await super.save(req)
    }
    return {
      status: true,
      data: 'Record Updated',
    }
  }
}

module.exports = EmailConfigurationController
