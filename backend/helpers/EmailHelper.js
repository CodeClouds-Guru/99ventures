const { EmailAction,EmailTemplateVariable,EmailActionEmailTemplate,EmailTemplate,Company,User,CompanyPortal,sequelize } = require('../models/index')
const queryInterface = sequelize.getQueryInterface()
const { Op } = require("sequelize");
class EmailHelper {
    
    constructor(req_data) {
        this.req_data = req_data
        this.parse = this.parse.bind(this)
        this.getCompanyInfo = this.getCompanyInfo.bind(this)
        this.replaceVariables = this.replaceVariables.bind(this)
        }
    //email parsing
    async parse(){
        let req = this.req_data
        let user = req.user;
        let receiver_module = '';
        let search = {'id' : '1'};
        let all_details = {
        'users': user
        }
        let email_template = await EmailTemplate.findOne({where:{'id':'1'}})
        if(email_template){
        //variables used for the template
        let match_variables = email_template.body.match(/{(.*?)}/g);
        if(match_variables){
            //required model list
            let models = await EmailTemplateVariable.findAll({where:{code:match_variables, module: { [Op.ne]: receiver_module }}, attributes:['module','code']})
            let include_models = []
            let  all_models = []
            let  all_variables = {}
            if(models){
            include_models = models.map((model_obj)=>{
                return {model: eval(model_obj.module)}
            })
            models.map((model_obj)=>{
                all_models.push(model_obj.module)
                let code = model_obj.code
                all_variables[code]= ''
                return model_obj.module
            })
            }
            //get company info
            let company_portal_details = await this.getCompanyInfo(req)
            all_details['companies'] = company_portal_details[0].Company
            company_portal_details[0].Company = {}
            all_details['company_portals'] = company_portal_details[0]
            //set user details
            let email_body = await this.replaceVariables(all_details,match_variables,email_template.body)
            return email_body
        }
        
        }
    }
    //company info
    async getCompanyInfo(req){
        let company_id = req.headers.company_id
        let company_portal_id = req.headers.site_id

        return CompanyPortal.findAll({
        where:{'id':company_portal_id},
        include:[{all:true,nested:false}]
        })
    }
    //replace email variables
    async replaceVariables(details, replace_data,email_body){
        replace_data.forEach(function(value,key){
        let new_value = value;
        new_value = new_value.replace('{','');
        new_value = new_value.replace('}','');
        replace_data[key] = eval('details'+'.'+new_value)
        email_body = email_body.replaceAll(value,replace_data[key])
        })
        return email_body
    }
}
module.exports = EmailHelper