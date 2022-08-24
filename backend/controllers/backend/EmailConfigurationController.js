const Controller = require('./Controller')
const { EmailConfiguration } = require('../../models/index')

class EmailConfigurationController extends Controller {
  constructor() {
    super('EmailConfiguration')
  }
  //get email configuration details
  async view(req,res){
    let company_id = req.headers.company_id;
    let site_id = req.headers.site_id;
    let email_details = await EmailConfiguration.findOne({where:{company_portal_id:site_id}})
    res.status(200).json({
        status: true,
        data: email_details
    })
  }
  //update email configuration 
  async save(req,res){
    let company_portal_id = req.headers.site_id;
    const { error, value } = EmailConfiguration.validate(req);
    if (error) {
      let message = error.details.map((err) => err.message).join(', ');
      res.status(401).json({
        status: false,
        errors: message,
        })
        return
    }
    //
    let email_details = await EmailConfiguration.findOne({where:{company_portal_id:company_portal_id}})
    if(email_details){
        req.params.id = email_details.id
        req.body.company_portal_id = company_portal_id
        await super.update(req);
    }else{
        req.body.company_portal_id = company_portal_id
        await super.save(req);
    }
    res.status(200).json({
        status: true,
        message:"Record Updated"
    })
  }
}

module.exports = new EmailConfigurationController()