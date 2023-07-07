class EmailEventListner {
  constructor() {
    this.listen = this.listen.bind(this);
  }
  async listen(payload) {
    let EmailHelper = require('./helpers/EmailHelper');
    let emailHelper = new EmailHelper(payload.req);
    let email_template = await emailHelper.parse(payload);
    if (email_template.status) {
      try {
        let send_mail = await emailHelper.sendMail(
          email_template.email_body,
          payload.data.email,
          email_template.subject
        );
        return send_mail;
      } catch (e) {
        console.error('Email event listner error', e);
      }
    }
  }
}

module.exports = {
  event: 'send_email',
  classname: EmailEventListner,
};
