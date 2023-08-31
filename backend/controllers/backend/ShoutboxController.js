const Controller = require('./Controller');
const { Shoutbox } = require('../../models/index');
const { Member } = require('../../models/index');

class ShoutboxController extends Controller {
  constructor() {
    super('Shoutbox');
  }
  //list function
  async list(req, res) {
    var options = super.getQueryOptions(req);
    options.include = [
      {
        model: Member,
        attributes: ['id', 'email', 'status', 'username'],
      },
    ];
    const { docs, pages, total } = await this.model.paginate(options);
    docs.forEach(function (record, key) {
      if (record.dataValues.Member != null) {
        record.dataValues['Member.username'] =
          record.dataValues.Member.username;
        // record.dataValues['member_id'] = record.dataValues.Member.id;
      }
    });
    return {
      result: { data: docs, pages, total },
      fields: this.model.fields,
    };
  }
}
module.exports = ShoutboxController;
