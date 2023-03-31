class MemberActivityEventListners {
  constructor() {
    this.listen = this.listen.bind(this);
  }
  async listen(payload) {
    const util = require('util');
    const { MemberActivityLog } = require('./models/index');

    return await MemberActivityLog.addMemberActivity(payload);
  }
}

module.exports = {
  event: 'member_activity',
  classname: MemberActivityEventListners,
};
