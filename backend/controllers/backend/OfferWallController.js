const Controller = require('./Controller');
const { Op } = require('sequelize');
const {
  OfferWall,
  OfferWallIp,
  Campaign,
  Member,
  CompanyPortal,
} = require('../../models/index');
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
    //unique offerwall name
    let existing_offerwall = await OfferWall.count({
      where: {
        company_portal_id: company_portal_id,
        name: req.body.name,
      },
    });
    if (existing_offerwall > 0) {
      this.throwCustomError('Sorry! this name has already been taken', 409);
    }
    let company_portal_domain = await CompanyPortal.findOne({
      attributes: ['domain'],
      where: { id: company_portal_id },
    });

    request_data.postback_url = company_portal_domain.domain;
    delete request_data.ips;
    let model = await this.model.create(request_data, { silent: true });
    if (ips.length > 0) {
      // ips = ips.split(',');
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
  async update(req, res) {
    let id = req.params.id;
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
    try {
      request_data.updated_by = req.user.id;
      request_data.company_portal_id = company_portal_id;
      //unique offerwall name
      let existing_offerwall = await OfferWall.count({
        where: {
          company_portal_id: company_portal_id,
          name: req.body.name,
          id: { [Op.ne]: id },
        },
      });
      if (existing_offerwall > 0) {
        this.throwCustomError('Sorry! this name has already been taken', 409);
      }
      delete request_data.ips;
      let model = await this.model.update(request_data, { where: { id } });

      //delete previous record
      await OfferWallIp.destroy({ where: { offer_wall_id: id } });
      if (ips.length > 0) {
        // ips = ips.split(',');
        ips.forEach(async (ip) => {
          model.deleted_by = req.user.id;
          await OfferWallIp.create(
            { ip: ip, offer_wall_id: id, status: '1' },
            { silent: true }
          );
        });
      }
      return {
        message: 'Record has been updated successfully',
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
      req.query.sort =
        req.query.sort === 'campaign_name' ? 'Campaign.name' : req.query.sort;
      var options = super.getQueryOptions(req);
      const campaign_id = parseInt(req.query.campaign_id) || null;
      options['where'] = {
        [Op.and]: {
          ...options['where'],
          company_portal_id: site_id,
          ...(parseInt(report) == 1 && { campaign_id: campaign_id }),
        },
      };
      // console.log(
      //   util.inspect(options, { showHidden: false, depth: null, colors: true })
      // );

      let page = req.query.page || 1;
      let limit = parseInt(req.query.show) || 10; // per page record
      let offset = (page - 1) * limit;
      options.limit = limit;
      options.offset = offset;
      options.include = [
        {
          model: Campaign,
          attributes: ['name'],
        },
      ];
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
  //view offer wall
  async view(req, res) {
    let report = req.query.report;
    let options = [
      {
        model: Campaign,
        attributes: ['name'],
      },
      {
        model: OfferWallIp,
        attributes: ['ip'],
      },
    ];

    let fields = this.model.fields;
    if (report == '1') {
      //offer wall report details
      options.push({
        model: Member,
        attributes: [
          'id',
          'first_name',
          'last_name',
          'email',
          'username',
          'created_at',
          'status',
        ],
      });
    }
    let model = await this.model.findOne({
      where: { id: req.params.id },
      include: options,
    });
    model.dataValues.ips = [];
    if (model.dataValues.OfferWallIps) {
      model.dataValues.ips = [];
      let offer_wall_ips = model.dataValues.OfferWallIps;
      offer_wall_ips.forEach(function (ip, key) {
        model.dataValues.ips.push(ip.ip);
      });
    }
    if (model.dataValues.Campaign != null) {
      model.dataValues.campaign_name = model.dataValues.Campaign.name;
    }

    let postback_url_example =
      model.postback_url +
      '/callback/postback/' +
      model.name +
      '?' +
      model.sub_id_variable +
      '={sub}&' +
      model.campaign_id_variable +
      '={offerid}&' +
      model.campaign_name_variable +
      '={offername}';
    model.setDataValue('postback_url_example', postback_url_example);
    return { status: true, result: model, fields };
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
  //get report details
  async getReport(req) {}
}
module.exports = OfferWallController;
