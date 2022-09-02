const Controller = require('./Controller')
const { EmailAction,EmailTemplateVariable } = require('../../models/index')

class EmailTemplateController extends Controller {
  constructor() {
    super('EmailTemplate')
  }
  //override list function
  async list(req,res){
    const options = this.getQueryOptions(req)
    let company_id = req.headers.company_id
    options.include = [
      {
        model: EmailAction,
        attributes: ['id','action'],
      },
    ]
    let page = req.query.page || 1
    let limit = parseInt(req.query.show) || 10 // per page record
    let offset = (page - 1) * limit
    options.limit = limit
    options.offset = offset
    let result = await this.model.findAndCountAll(options)
    let pages = Math.ceil(result.count / limit)
    return {
      result: { data: result.rows, pages, total: result.count },
      fields: this.model.fields,
    }
  }
  //override add function
    async add(req,res){
        let response = await super.add(req)
        let fields = response.fields
        let email_actions = await EmailAction.findAll()
        let email_template_variables = await EmailTemplateVariable.findAll()
        fields.email_actions.options = email_actions
        fields.email_template_variables.options = email_template_variables
        return {
        status: true,
        fields,
        }
    }
}

module.exports = EmailTemplateController