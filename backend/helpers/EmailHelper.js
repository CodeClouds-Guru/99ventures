const {
  Member,
  EmailAction,
  EmailTemplateVariable,
  EmailActionEmailTemplate,
  EmailTemplate,
  Company,
  User,
  CompanyPortal,
  EmailConfiguration,
  sequelize,
} = require('../models/index');
const queryInterface = sequelize.getQueryInterface();
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');
class EmailHelper {
  constructor(req_data) {
    this.req_data = req_data;
    this.parse = this.parse.bind(this);
    this.getCompanyInfo = this.getCompanyInfo.bind(this);
    this.replaceVariables = this.replaceVariables.bind(this);
  }
  //email parsing
  async parse(payload) {
    let req = this.req_data;
    let user = req.user;
    let receiver_module = '';
    let search = { id: '1' };
    let all_details = {};
    const publicURL = process.env.CLIENT_ORIGIN || 'http://127.0.0.1:3000';
    try {
      if (payload.data.details != undefined && payload.data.details) {
        all_details = payload.data.details;
        all_details['users'] = user;
      } else {
        all_details = {
          users: user,
        };
      }
      all_details['logo'] = publicURL + '/assets/images/logo/logo.png';
      let email_action = await EmailAction.findOne({
        where: { action: payload.action },
        include: {
          model: EmailTemplate,
          required: true,
          where: { company_portal_id: req.headers.site_id },
        },
      });
      if (email_action && email_action.EmailTemplates) {
        let email_template = email_action.EmailTemplates[0];
        let email_body = '';
        let email_subject = '';
        if (email_template.body != undefined && email_template.body != '') {
          email_subject = email_template.subject;
          //variables used for the template
          let match_variables = email_template.body.match(/\${(.*?)}/g);
          let match_variables_subject =
            email_template.subject.match(/\${(.*?)}/g);
          if (match_variables || match_variables_subject) {
            //required model list
            let models = await EmailTemplateVariable.findAll({
              where: {
                code: match_variables,
                module: { [Op.ne]: receiver_module },
              },
              attributes: ['module', 'code'],
            });
            let include_models = [];
            let all_models = [];
            let all_variables = {};
            if (models) {
              include_models = models.map((model_obj) => {
                return { model: eval(model_obj.module) };
              });
              models.map((model_obj) => {
                all_models.push(model_obj.module);
                let code = model_obj.code;
                all_variables[code] = '';
                return model_obj.module;
              });
            }
            //get company info
            let company_portal_details = await this.getCompanyInfo(req);
            all_details['companies'] = company_portal_details[0].Company;
            company_portal_details[0].Company = {};
            all_details['company_portals'] = company_portal_details[0];
            //set user details
            email_body = await this.replaceVariables(
              all_details,
              match_variables,
              email_template.body
            );
            email_subject = await this.replaceVariables(
              all_details,
              match_variables_subject,
              email_subject
            );
            // console.log('all_details======', all_details)
          } else {
            email_body = email_template.body;
          }
        }
        return { status: true, email_body: email_body, subject: email_subject };
      } else {
        return { status: false };
      }
    } catch (error) {
      console.error('error sending email', error);
      return { status: false };
    }
  }
  //company info
  async getCompanyInfo(req) {
    let company_id = req.headers.company_id;
    let company_portal_id = req.headers.site_id;

    return CompanyPortal.findAll({
      where: { id: company_portal_id },
      include: [{ all: true, nested: false }],
    });
  }
  //replace email variables
  async replaceVariables(details, replace_data, email_body) {
    const safeEval = require('safe-eval');

    if (replace_data) {
      replace_data.forEach(function (value, key) {
        let new_value = value;
        new_value = new_value.replace('${', '');
        new_value = new_value.replace('}', '');
        replace_data[key] = eval('details' + '.' + new_value);
        email_body = email_body.replaceAll(value, replace_data[key]);
      });
      
    }
    // email_body = safeEval('`' + email_body + '`', details);
    return email_body;
  }
  //send mail
  async sendMail(body, to, subject) {
    // create reusable transporter object using the default SMTP transport
    try {
      let req = this.req_data;
      let company_portal_id = req.headers.site_id;
      let email_configurations = await EmailConfiguration.findAll({
        where: { company_portal_id: company_portal_id },
      });
      // console.log('email_configurations',email_configurations)
      if (email_configurations) {
        var transporter = nodemailer.createTransport({
          host: email_configurations[0].email_server_host, //"email-smtp.us-east-2.amazonaws.com",//"smtp.mailtrap.io",
          port: email_configurations[0].email_server_port, //465,//2525,
          auth: {
            user: email_configurations[0].email_username, //"AKIAW4QB5PVEBC4SVRUC",//"7f4f85b9351b0d",
            pass: email_configurations[0].password, //"BDHv1Tp/ZfPTGvebdDyTmNPi2wFzSycpKE7VJ8BvU7wc",//"1c385733adeb77"
          },
        });
        if (email_configurations[0].site_name_visible == '1') {
          subject = email_configurations[0].from_name + ' - ' + subject;
        }
        const mailData = {
          from:
            email_configurations[0].from_name +
            '<' +
            email_configurations[0].from_email +
            '>', //'info@moresurveys.com', // sender address
          to: to, // list of receivers
          // from: 'sourabh.das@codeclouds.in',
          // to: 'debosmita.dey@codeclouds.co.in',
          subject: subject,
          //text: 'That was easy!',
          html: body,
        };
        // console.log('Mail Data', mailData);
        await transporter.sendMail(mailData);
      }
    } catch (error) {
      console.error('error sending email', error);
    }
  }
}
module.exports = EmailHelper;
