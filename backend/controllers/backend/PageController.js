const Controller = require('./Controller')
const { Op } = require("sequelize");
const {
  Layout,Component
} = require("../../models/index");
class PageController extends Controller {
  constructor() {
    super('Page')
  }
  //override add function
  async add(req, res) {
    let response = await super.add(req);
    let fields = { ...response.fields };
    const site_id = req.header('site_id')
    let layouts = await Layout.findAll({where:{company_portal_id:site_id}});
    let components = await Component.findAll({where:{company_portal_id:site_id}});
    layouts = layouts.map(layout => {
      return {
        id: layout.id,
        value: layout.name
      }
    });
    components = components.map(component => {
      return {
        id: component.id,
        value: component.name,
        html:component.html
      }
    });

    fields.layouts = {
      field_name: 'layout',
      db_name: 'layouts',
      type: 'select',
      placeholder: 'Layout',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
      options: layouts,
    };
    fields.components = {
      field_name: 'component',
      db_name: 'components',
      type: 'select',
      placeholder: 'Component',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
      options: components,
    };
    return {
      status: true,
      fields,
    };
  }
  //override edit function
  async edit(req, res) {
    let response = await super.edit(req);
    let fields = { ...response.fields };

    const site_id = req.header('site_id')
    let layouts = await Layout.findAll({where:{company_portal_id:site_id}});
    let components = await Component.findAll({where:{company_portal_id:site_id}});
    layouts = layouts.map(layout => {
      return {
        id: layout.id,
        value: layout.name
      }
    });
    components = components.map(component => {
      return {
        id: component.id,
        value: component.name,
        html:component.html
      }
    });

    fields.layouts = {
      field_name: 'layout',
      db_name: 'layouts',
      type: 'select',
      placeholder: 'Layout',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
      options: layouts,
    };
    fields.components = {
      field_name: 'component',
      db_name: 'components',
      type: 'select',
      placeholder: 'Component',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
      options: components,
    };
    response.fields = fields
    return response;
  }
  //override save function
  async save(req, res) {
    req.body.company_portal_id = req.headers.site_id;
    //unique code checking
    let check_code = await this.model.findOne({
      where: { slug: req.body.slug },
    });
    if (check_code) {
      this.throwCustomError("Slug already in use.", 409);
    }
    let response = await super.save(req);
    return {
      status: true,
      message: "Page added.",
      id: response.result.id,
    };
  }
  //override update function
  async update(req, res) {
    req.body.company_portal_id = req.headers.site_id;
    //unique code checking
    let check_code = await this.model.findOne({
      where: { slug: req.body.slug, id: { [Op.ne]: req.params.id } },
    });
    if (check_code) {
      this.throwCustomError("Slug already in use.", 409);
    }
    let response = await super.update(req);
    return {
      status: true,
      message: "Page updated."
    };
  }
  //override delete function
  async delete(req, res) {
    let response = await super.delete(req);
    return {
      status: true,
      message: "Page deleted.",
    };
  }
}

module.exports = PageController