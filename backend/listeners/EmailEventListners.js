class EmailEventListner {
    constructor() {
        this.listen = this.listen.bind(this);
    }
    async listen(payload) {
        var EmailHelper = require('./helpers/EmailHelper')
        var emailHelper = new EmailHelper()
        var email_template = await emailHelper.parse(payload)
    }
}

module.exports = {
    'event': 'send_email',
    'classname': EmailEventListner
}