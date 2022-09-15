const Controller = require('./Controller')
const { EmailAction,EmailTemplateVariable,EmailActionEmailTemplate,EmailTemplate,Company,CompanyPortal,sequelize } = require('../../models/index')
const queryInterface = sequelize.getQueryInterface()

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
  //override save function
  async save(req,res){
    req.body.company_portal_id = req.headers.site_id;
    let response = await super.save(req)
    //update email action
    await queryInterface.bulkInsert('email_action_email_template', [{
      email_action_id: req.body.email_actions,
      email_template_id: response.result.id
    }])
      // EmailActionEmailTemplate.create({
      //   email_action_id: req.body.email_actions,
      //   email_template_id: response.result.id
      // })
    
    return {
      status: true,
      message: "Email template added.",
      id: response.result.id
    }
  }
  //update email template
  async update(req,res){
    let id = req.params.id
    req.body.company_portal_id = req.headers.site_id;
    let response = await super.update(req)
    //update email action
      EmailActionEmailTemplate.update({
        email_action_id: req.body.email_actions
      },
      {
        where:{
          email_template_id: id
        }
      })
    
    return {
      status: true,
      message: "Email template updated."
    }
  }
  //override delete function
  async delete(req,res){
    let modelIds = req.body.modelIds ?? [];
    let response = await super.delete(req)
    
    //delete email action
    EmailActionEmailTemplate.destroy({ where: { email_template_id: modelIds } })
    return {
      status: true,
      message: "Email template deleted."
    }
  }
  //get a single email template by id
  async edit(req,res){
    try {
      let response = await super.edit(req)
      if(response.result){
        let email_actions = await response.result.getEmailActions()
        response.result.setDataValue('EmailActions',email_actions)
        return response
      }else{
        this.throwCustomError("Email template not found.", 409);
      }
    } catch (error) {
      throw error;
    }
  }
  //email parsing
  async parse(req,res){
    let user = req.user;
    let receiver_module = '';
    let search = {'id' : '1'};
    let email_template = await EmailTemplate.findOne({where:{'id':'1'}})
    if(email_template){
      //variables used for the template
      let match_variables = email_template.body.match(/{(.*?)}/g);
      if(match_variables){
        //required model list
        let models = await EmailTemplateVariable.findAll({where:{code:match_variables, module: { [Op.ne]: receiver_module }}, attributes:['module','code']})
        let include_models = all_models = []
        // let  = []
        if(models){
          include_models = models.map((model_obj)=>{
            return {model: eval(model_obj.module)}
          })
          all_models = models.map((model_obj)=>{
            return model_obj.module
          })
        }
        //get company info
        let company_details = await this.getCompanyInfo(req)
        let replace_list = []
        models.forEach(element => {
          
        });
        //fetch all info
        let options = {}
        if(search)
          options = {where:search}
        if(include_models)
          options['include'] = [{all:true,nested:true}]
          
        let email_data = await CompanyPortal.findAll(options)
        return email_data
      }
      
    }
  }
  //company info
  async getCompanyInfo(req){
    let company_id = req.headers.company_id
    let company_portal_id = req.headers.site_id

    return Company.findAll({
      where:{'id':company_id},
      include:{
        model: CompanyPortal,
        where:{id:company_portal_id},
        include:[{all:true,nested:true}]
      }
    })
  }
}

module.exports = EmailTemplateController