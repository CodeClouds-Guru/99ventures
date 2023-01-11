const Controller = require('./Controller');
const { Op } = require('sequelize');
const { OfferWall,OfferWallIp } = require('../../models/index');
const util = require('util');
class OfferWallController extends Controller {
  constructor() {
    super('OfferWall');
  }
  //save
  async save(req, res) {
    let request_data = req.body;
    let company_portal_id = req.headers.site_id;
    let ips = request_data.ips
    const { error, value } = this.model.validate(req);
    if (error) {
      const errorObj = new Error("Validation failed.");
      errorObj.statusCode = 422;
      errorObj.data = error.details.map((err) => err.message);
      throw errorObj;
    }
    request_data.company_portal_id = company_portal_id
    delete request_data.ips
    let model = await this.model.create(request_data, { silent: true });
    if(ips != ''){
      ips = ips.split(",");
      ips.forEach(async (ip) => {
        model.deleted_by = req.user.id;
        await OfferWallIp.create({ip:ip,offer_wall_id:model.id,status:'1'}, { silent: true });
      });
    }
    //delete previous record
    // await OfferWallIp.destroy({ where: { id: modelIds } });
    return {
      status: true,
      message: 'Record has been created successfully',
      result: model,
    };
  }

  //list
  async list(req, res) {
    try {
      const site_id = req.header('site_id') || 1;
      let report = req.query.report || 0;
      var options = super.getQueryOptions(req);
      const campaign_id = parseInt(req.query.campaign_id) || null;
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
