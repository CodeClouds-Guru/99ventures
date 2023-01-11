const Controller = require('./Controller');
const { Op } = require('sequelize');
const { OfferWall, OfferWallIp, Campaign } = require('../../models/index');
const util = require('util');
class OfferWallController extends Controller {
  constructor() {
    super('OfferWall');
  }
  //save
  async save(req, res) {
    let request_data = req.body;
    let company_portal_id = req.headers.site_id;
    let ips = request_data.ips;
    const { error, value } = this.model.validate(req);
    if (error) {
      const errorObj = new Error('Validation failed.');
      errorObj.statusCode = 422;
      errorObj.data = error.details.map((err) => err.message);
      throw errorObj;
    }
    request_data.company_portal_id = company_portal_id;
    delete request_data.ips;
    let model = await this.model.create(request_data, { silent: true });
    if (ips != '') {
      ips = ips.split(',');
      ips.forEach(async (ip) => {
        model.deleted_by = req.user.id;
        await OfferWallIp.create(
          { ip: ip, offer_wall_id: model.id, status: '1' },
          { silent: true }
        );
      });
    }
    
    return {
      status: true,
      message: 'Record has been created successfully',
      result: model,
    };
  }
  //update
  async update(req,res){
    let id = req.params.id;
    let request_data = req.body;
    let company_portal_id = req.headers.site_id;
    let ips = request_data.ips;
    const { error, value } = this.model.validate(req);
    if (error) {
      const errorObj = new Error("Validation failed.");
      errorObj.statusCode = 422;
      errorObj.data = error.details.map((err) => err.message);
      throw errorObj;
    }
    try {
      request_data.updated_by = req.user.id;
      request_data.company_portal_id = company_portal_id;
      delete request_data.ips;
      let model = await this.model.update(request_data, { where: { id } });

      //delete previous record
      await OfferWallIp.destroy({ where: { offer_wall_id: id } });
      if (ips != '') {
        ips = ips.split(',');
        ips.forEach(async (ip) => {
          model.deleted_by = req.user.id;
          await OfferWallIp.create(
            { ip: ip, offer_wall_id: model.id, status: '1' },
            { silent: true }
          );
        });
      }
      return {
        message: "Record has been updated successfully",
      };
    } catch (error) {
      throw error;
    }
  }
  //override list function
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
      options.include = {
        model: Campaign,
        attributes: ['name'],
      };
      let result = await this.model.findAndCountAll(options);

      for (let i = 0; i < result.rows.length; i++) {
        if (result.rows[i].Campaign) {
          result.rows[i].setDataValue(
            'campaign_name',
            result.rows[i].Campaign.name
          );
          delete result.rows[i].Campaign.name;
        }
      }
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

  //override delete function
  async delete(req, res) {
    // console.log(req);
    let modelIds = req.body.modelIds ?? [];
    let response = await super.delete(req);

    await OfferWallIp.destroy({
      where: { offer_wall_id: modelIds },
    });
    return {
      status: true,
      message: 'Offer deleted.',
    };
  }
}
module.exports = OfferWallController;
