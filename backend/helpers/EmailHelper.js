const { EmailAction,EmailTemplateVariable,EmailActionEmailTemplate,EmailTemplate,Company,User,CompanyPortal,EmailConfiguration,sequelize } = require('../models/index')
const queryInterface = sequelize.getQueryInterface()
const { Op } = require("sequelize");
const nodemailer = require('nodemailer');
class EmailHelper {
    
    constructor(req_data) {
        this.req_data = req_data
        this.parse = this.parse.bind(this)
        this.getCompanyInfo = this.getCompanyInfo.bind(this)
        this.replaceVariables = this.replaceVariables.bind(this)
        }
    //email parsing
    async parse(payload){
        let req = this.req_data
        let user = req.user;
        let receiver_module = '';
        let search = {'id' : '1'};
        let all_details = {
        'users': user
        }
        let email_action = await EmailAction.findOne({where:{'action':payload.action},include:EmailTemplate})
        let email_template = email_action.EmailTemplates[0]
        let email_body = ''
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
                email_body = await this.replaceVariables(all_details,match_variables,email_template.body)
            }else{
                email_body = email_template.body
            }
        }
        return email_body
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
    //send mail
    async sendMail(body,to){
        // create reusable transporter object using the default SMTP transport
        let req = this.req_data
        let company_portal_id = req.headers.site_id
        let email_configurations = await EmailConfiguration.findAll({where:{'company_portal_id':company_portal_id}})
        var transporter = nodemailer.createTransport({
            host: email_configurations[0].email_server_host,//"email-smtp.us-east-2.amazonaws.com",//"smtp.mailtrap.io",
            port: email_configurations[0].email_server_port,//465,//2525,
            auth: {
              user: email_configurations[0].email_username,//"AKIAW4QB5PVEBC4SVRUC",//"7f4f85b9351b0d",
              pass: email_configurations[0].password,//"BDHv1Tp/ZfPTGvebdDyTmNPi2wFzSycpKE7VJ8BvU7wc",//"1c385733adeb77"
            }
          });
        const mailData = {
            from: email_configurations[0].from_email,//'info@moresurveys.com', // sender address
            to: to,   // list of receivers
            subject: 'Sending Email using Node.js',
            //text: 'That was easy!',
            html: body,
        };
        transporter.sendMail(mailData, function (err, info) {
            if(err)
                console.log('err',err)
            else
                console.log('success====',info);
        });
    }
}
module.exports = EmailHelper