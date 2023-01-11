const Controller = require('./Controller');
const { Op } = require('sequelize');
const { OfferWall,OfferWallIp } = require('../../models/index');
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
  async list(req, res) {}
}
module.exports = OfferWallController;
