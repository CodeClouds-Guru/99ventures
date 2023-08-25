class ShoutboxEventListner {
  constructor() {
    this.listen = this.listen.bind(this);
  }
  async listen(payload) {
    // console.log('========payload', payload);
    const { ShoutboxConfiguration, Shoutbox } = require('./models/index');
    const safeEval = require('safe-eval');

    try {
      let event_slug = payload.action;
      let shoutbox_verbose = await ShoutboxConfiguration.findOne({
        where: {
          event_slug: event_slug,
          company_portal_id: payload.company_portal_id,
          status: 1,
        },
        attributes: ['verbose'],
      });
      if (shoutbox_verbose) {
        let all_details = payload.data ? payload.data : {};
        let verbose = shoutbox_verbose.verbose;
        if (all_details) {
          verbose = safeEval('`' + verbose + '`', all_details);
          await Shoutbox.create({
            company_id: payload.company_id,
            company_portal_id: payload.company_portal_id,
            member_id: all_details.members.id ?? null,
            survey_provider_id: all_details.survey_provider_id ?? null,
            verbose: verbose,
            created_at: new Date(),
          });
          global.socket.emit('shoutbox', {
            name: all_details.members.first_name ?? null,
            place: 'USA',
            message: verbose,
          });
        }
      }
      return;
    } catch (err) {
      console.log(err.message);
      return;
    }
  }
}

module.exports = {
  event: 'happening_now',
  classname: ShoutboxEventListner,
};
