const EmailHelper = require("../helpers/EmailHelper")
class EmailEventListner {
    async listen(payload) {
        // console.log(payload)
         var emailHelper = new EmailHelper()
         var email_template = await emailHelper.parse(payload)
    }
}

module.exports = {
    'event': 'send_email',
    'classname': EmailEventListner
}