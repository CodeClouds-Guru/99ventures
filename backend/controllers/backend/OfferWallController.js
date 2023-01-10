const Controller = require('./Controller');
const { Op } = require('sequelize');
const { OfferWall } = require('../../models/index');
const util = require('util');
class OfferWallController extends Controller {
  constructor() {
    super('OfferWall');
  }
  //save
  async save(req, res) {}

  //list
  async list(req, res) {
    try {
      const site_id = req.header('site_id') || 1;
      let report = req.query.report || 0;
      var options = super.getQueryOptions(req);
      const campaign_id = parseInt(req.query.id) || null;
      options['where'] = {
        [Op.and]: {
          ...options['where'],
          company_portal_id: site_id,
          ...(parseInt(report) == 1 && { campaign_id: campaign_id }),
        },
      };
      console.log(
        util.inspect(options, { showHidden: false, depth: null, colors: true })
      );

      let page = req.query.page || 1;
      let limit = parseInt(req.query.show) || 10; // per page record
      let offset = (page - 1) * limit;
      options.limit = limit;
      options.offset = offset;

      let result = await this.model.findAndCountAll(options);
      let pages = Math.ceil(result.count / limit);
      return {
        status: true,
        result: { data: result.rows, pages, total: result.count },
        fields: this.model.fields,
      };
    } catch (err) {
      console.error(err);
      this.throwCustomError('Unable to get data', 500);
    }
  }
}
module.exports = OfferWallController;
