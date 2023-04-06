const Controller = require('./Controller');
const { Op } = require('sequelize');
const { Member, MemberBalance } = require('../../models/index');
const moment = require('moment');
class MemberTransactionController extends Controller {
  constructor() {
    super('MemberTransaction');
  }
  // override save function
  async list(req, res) {
    var options = super.getQueryOptions(req);
    let company_portal_id = req.headers.site_id;
    var fields = Object.assign({}, this.model.fields);
    var query_where = req.query.where ? JSON.parse(req.query.where) : null;
    var option_where = options.where || {};
    var new_option = {};
    var and_query = {
      completed_at: {
        [Op.between]: query_where.completed_at ?? [
          moment().subtract(30, 'days').toISOString(),
          moment().toISOString(),
        ],
      },
    };

    if (Object.keys(query_where).length > 0) {
      new_option[Op.and] = {
        ...option_where,
        ...and_query,
      };
    }
    options.where = new_option;
    options.include = {
      model: Member,
      required: false,
      attributes: ['id', 'first_name', 'last_name', 'email', 'avatar'],
    };
    const { docs, pages, total } = await this.model.paginate(options);

    let transaction_list = [];
    docs.forEach(function (record, key) {
      if (
        record.dataValues.Member != null &&
        record.dataValues.Member.dataValues.avatar != ''
      ) {
        record.dataValues.Member.dataValues.avatar =
          process.env.S3_BUCKET_OBJECT_URL +
          record.dataValues.Member.dataValues.avatar;
      }
      switch (record.dataValues.status) {
        case 1:
          record.dataValues.status = 'processing';
          break;
        case 2:
          record.dataValues.status = 'completed';
          break;
        case 3:
          record.dataValues.status = 'failed';
          break;
        case 4:
          record.dataValues.status = 'declined';
          break;
        default:
          record.dataValues.status = 'initiated';
      }
      transaction_list.push(record.dataValues);
    });

    fields.transaction_id.listing = !(
      query_where &&
      'type' in query_where &&
      query_where.type === 'withdraw'
    );
    fields.note.listing = !(
      query_where &&
      'type' in query_where &&
      query_where.type === 'withdraw'
    );
    return {
      result: {
        data: transaction_list,
        pages: pages,
        total: total,
      },
      fields,
    };
  }
}
module.exports = MemberTransactionController;
