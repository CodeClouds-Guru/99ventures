class EmailEventListner {
    constructor() {
        this.listen = this.listen.bind(this);
    }
    async listen(payload) {
        let EmailHelper = require('./helpers/EmailHelper')
        let emailHelper = new EmailHelper(payload.req)
        let email_template = await emailHelper.parse(payload)
        let send_mail = await emailHelper.sendMail(email_template.email_body,payload.data.email,email_template.subject)
        console.log('status',send_mail)
        return send_mail
    }
}

module.exports = {
    'event': 'send_email',
    'classname': EmailEventListner
}