const Controller = require('./Controller');
const { stringToSlug } = require('../../helpers/global');
const { Script, sequelize } = require('../../models/index');

const { Op } = require('sequelize');

class ScriptController extends Controller {
  constructor() {
    super('Script');
  }

  async list(req, res) {
    const options = this.getQueryOptions(req);
    const company_portal_id = req.headers.site_id;
    var search = req.query.search || '';
    let page = req.query.page || 1;
    let limit = parseInt(req.query.show) || 10; // per page record
    let offset = (page - 1) * limit;
    options.limit = limit;
    options.offset = offset;

    options.where = {
      ...options.where,
      ...{ [Op.and]: { company_portal_id: company_portal_id, type: 'custom' } },
    };

    let result = await this.model.findAndCountAll(options);
    let pages = Math.ceil(result.count / limit);
    return {
      result: { data: result.rows, pages, total: result.count },
      fields: this.model.fields,
    };
  }

  //override save function
  async save(req, res) {
    req.body.company_portal_id = req.headers.site_id;
    try {
      const script_name = req.body.name || '';
      // req.body.code = stringToSlug(script_name) + '-'+new Date().getTime();
      req.body.code =
        script_name
          .split(' ')
          .reduce((response, word) => (response += word.slice(0, 1)), '') +
        '-' +
        new Date().getTime();
      // req.body.script_json = JSON.parse(req.body.script_json) || {};
      // console.log("-----------------------", req.body);
      let model = await super.save(req);
      return {
        status: true,
        message: 'Record has been created successfully',
        result: model.result,
      };
    } catch (error) {
      throw error;
    }
  }

  async update(req, res) {
    let request_data = req.body;
    let id = req.params.id;
    req.body.company_portal_id = req.headers.site_id;
    try {
      let prev_data = await this.model.findOne({ where: { id: id } });

      if (prev_data) {
        const script_name = req.body.name || '';
        // req.body.script_json = JSON.parse(req.body.script_json) || {};
        // req.body.code =
        //   script_name
        //     .split(" ")
        //     .reduce((response, word) => (response += word.slice(0, 1)), "") +
        //   "-" +
        //   new Date().getTime();
        let result = await Script.update(req.body, {
          where: {
            id: id,
          },
        });
        // await super.save(request_data);
        // result = await this.model.findOne({ where: { id: id } });

        return {
          status: true,
          message: 'Record has been updated successfully',
          result: result,
        };
      } else {
        return {
          status: false,
          message: 'No record found',
        };
      }
    } catch (error) {
      throw error;
    }
  }
}
module.exports = ScriptController;
