const Controller = require('./Controller')
const { Op } = require("sequelize");
const {
  Layout
} = require("../../models/index");
class PageController extends Controller {
  constructor() {
    super('Page')
  }
  //override add function
  async add(req, res) {
    let response = await super.add(req);
    let fields = response.fields;
    
    let layouts = await Layout.findAll();
    layouts = layouts.map(layout => {
      return {
          id: layout.id,
          value: layout.name
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
    return {
      status: true,
      fields,
    };
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
    req.body.parmalink = req.body.slug;
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
      where: { slug: req.body.slug,id: { [Op.ne]: req.params.id } },
    });
    if (check_code) {
      this.throwCustomError("Slug already in use.", 409);
    }
    req.body.parmalink = req.body.slug;
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