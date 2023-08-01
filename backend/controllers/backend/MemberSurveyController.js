const Controller = require('./Controller');
const {
  MemberSurvey,
  SurveyProvider,
  MemberTransaction,
  Member,
} = require('../../models/index');
class MemberSurveyController extends Controller {
  constructor() {
    super('MemberSurvey');
  }
  async list(req, res) {
    var options = await this.getQueryOptions(req);
    let company_portal_id = req.headers.site_id;
    options.include = [
      {
        model: SurveyProvider,
        attributes: ['name'],
      },
      {
        model: MemberTransaction,
        attributes: ['transaction_id', 'type', 'status', 'amount_action'],
        include: [
          {
            model: Member,
            attributes: ['username', 'id'],
            where: { company_portal_id: company_portal_id },
          },
        ],
      },
    ];
    let page = req.query.page || 1;
    let limit = parseInt(req.query.show) || 10; // per page record
    let offset = (page - 1) * limit;
    options.limit = limit;
    options.offset = offset;
    let result = await this.model.findAndCountAll(options);
    let pages = Math.ceil(result.count / limit);
    result.rows.map((row) => {
      if (row.SurveyProvider) {
        row.setDataValue('SurveyProvider.name', row.SurveyProvider.name);
      } else {
        row.setDataValue('SurveyProvider.name', '');
      }
      if (row.MemberTransaction) {
        row.setDataValue(
          'MemberTransaction->Member.username',
          row.MemberTransaction.Member.username
        );
        row.setDataValue(
          'MemberTransaction->Member.id',
          row.MemberTransaction.Member.id
        );
        switch (row.MemberTransaction.status) {
          case 1:
            row.MemberTransaction.status = 'processing';
            break;
          case 2:
            row.MemberTransaction.status = 'completed';
            break;
          case 3:
            row.MemberTransaction.status = 'failed';
            break;
          case 4:
            row.MemberTransaction.status = 'declined';
            break;
          case 5:
            row.MemberTransaction.status = 'reverted';
            break;
          default:
            row.MemberTransaction.status = 'initiated';
            break;
        }
        row.setDataValue('type', row.MemberTransaction.type);
        row.setDataValue('status', row.MemberTransaction.status);
        row.setDataValue('amount_action', row.MemberTransaction.amount_action);
      } else {
        row.setDataValue('MemberTransaction->Member.username', '');
        row.setDataValue('MemberTransaction->Member.id', '');
        row.setDataValue('type', '');
        row.setDataValue('status', '');
        row.setDataValue('amount_action', '');
      }
    });
    return {
      result: { data: result.rows, pages, total: result.count },
      fields: this.model.fields,
    };
  }
}
module.exports = MemberSurveyController;
