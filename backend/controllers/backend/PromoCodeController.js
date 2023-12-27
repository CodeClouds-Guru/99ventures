const Controller = require('./Controller');
const { Op } = require('sequelize');
const { Member, MemberTransaction, Country } = require('../../models/index');

class PromoCodeController extends Controller {
  constructor() {
    super('PromoCode');
  }

  //override add function
  async add(req, res) {
    let response = await super.add(req);
    let fields = response.fields;
    // let email_actions = await EmailAction.findAll()
    fields = {
      type: {
        field_name: 'type',
        db_name: 'type',
        type: 'select',
        placeholder: 'Type',
        listing: false,
        show_in_form: true,
        sort: false,
        required: true,
        value: '',
        width: '50',
        searchable: false,
        options: [
          { key: 'auto', value: 'auto', label: 'Auto Generated Codes' },
          { key: 'custom', value: 'custom', label: 'Enter Custom Code' },
        ],
      },
      ...fields,
    };
    return {
      status: true,
      fields,
    };
  }
  //override save function
  async save(req, res) {
    // console.log(req);
    req.body.company_portal_id = req.headers.site_id;
    var type = req.body.type || 'custom';
    if (type === 'auto') {
      req.body.code = req.body.name
        .split(' ')
        .reduce((response, word) => (response += word.slice(0, 1)), '');
      var random_int = String(
        Math.floor(Math.random() * 99999999999)
      ).substring(0, 12 - String(req.body.code).length);
      req.body.code = req.body.code + random_int;
    }
    // console.log(req.body.code);
    let existingCode = await this.model.findOne({
      where: { code: req.body.code },
      company_portal_id: req.body.company_portal_id,
    });
    if (existingCode) {
      if (existingCode.max_uses != existingCode.used) {
        // return {
        //   status: false,
        //   message: 'Duplicate Entry',
        // };
        return this.throwCustomError('Duplicate Entry', 500);
      }
    }
    req.body.cash = req.body.cash == '' ? 0 : parseFloat(req.body.cash);
    req.body.point = req.body.point == '' ? 0 : parseInt(req.body.point);
    delete req.body.type;
    // console.log('before save', req.body);
    let response = await super.save(req);
    return response;
  }
  //override update function
  async update(req, res) {
    // console.log(req);
    req.body.company_portal_id = req.headers.site_id;
    var type = req.body.type || 'custom';
    if (type === 'auto') {
      req.body.code = req.body.name
        .split(' ')
        .reduce((response, word) => (response += word.slice(0, 1)), '');
      var random_int = String(
        Math.floor(Math.random() * 99999999999)
      ).substring(0, 12 - String(req.body.code).length);
      req.body.code = req.body.code + random_int;
    }
    // console.log(req.body);
    let existingCode = await this.model.findOne({
      where: {
        code: req.body.code,
        id: { [Op.ne]: req.params.id },
        company_portal_id: req.body.company_portal_id,
      },
    });
    if (existingCode) {
      if (existingCode.max_uses != existingCode.used) {
        // return {
        //   status: false,
        //   message: 'Duplicate Entry',
        // };
        return this.throwCustomError('Duplicate Entry', 500);
      }
    }
    req.body.cash = req.body.cash == '' ? 0 : parseFloat(req.body.cash);
    req.body.point = req.body.point == '' ? 0 : parseInt(req.body.point);
    delete req.body.type;
    let response = await super.update(req);
    return response;
  }

  async list(req, res) {
    var options = super.getQueryOptions(req);
    const { docs, pages, total } = await this.model.paginate(options);
    return {
      result: { data: docs, pages, total },
      fields: {
        ...this.model.fields,
        report: {
          // Added this object to show the Report Option in the table
          field_name: 'report',
          db_name: 'report',
          type: 'text',
          placeholder: 'Report',
          listing: true,
          show_in_form: false,
          sort: false,
          required: false,
          value: '',
          width: '50',
          searchable: false,
        },
      },
    };
  }

  async view(req, res) {
    let get_model = await this.model.findOne({
      where: { id: req.params.id },
    });
    let model = await this.model.findOne({
      where: { id: req.params.id },
      include: {
        model: Member,
        as: 'MemberPromoCode',
        attributes: ['id', 'username'],
        include: [
          {
            model: MemberTransaction,
            attributes: ['created_at'],
            where: { note: { [Op.like]: `%${get_model.code}%` } },
          },
          {
            model: Country,
            attributes: ['nicename'],
          },
        ],
      },
    });
    return { status: true, result: model };
  }
}

module.exports = PromoCodeController;
