const Controller = require('./Controller');

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
    req.body.company_portal_id = req.headers.site_id;
    var type = req.body.type || 'custom';
    if (type === 'auto') {
      req.body.code = Math.random().toString(36).slice(2);
    }
    req.body.slug =
      req.body.code.replace(' ', '_').toLowerCase() +
      '-' +
      new Date().getTime();

    //unique code checking
    let check_code = await this.model.findOne({
      where: { slug: req.body.slug, company_portal_id: req.headers.site_id },
    });
    if (check_code) {
      this.throwCustomError('Slug already in use.', 409);
    }
    delete req.body.type;
    let response = await super.save(req);

    return response;
  }
  //override update function
  async update(req, res) {
    console.log(req);
    req.body.company_portal_id = req.headers.site_id;

    var type = req.body.type || 'custom';
    if (type === 'auto') {
      req.body.code = Math.random().toString(36).slice(2);
    }
    let findCode = await this.model.findOne({
      where: { id: req.params.id },
    });
    req.body.slug = findCode.slug;
    delete req.body.type;
    let response = await super.update(req);
    return response;
  }
}

module.exports = PromoCodeController;
