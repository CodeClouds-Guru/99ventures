const Controller = require("./Controller");
const { Op } = require("sequelize");
const { Layout, Component, Page } = require("../../models/index");
class PageController extends Controller {
  constructor() {
    super("Page");
  }
  //override list function
  async list(req, res) {
    req.query.sort = req.query.sort || "updated_at";
    let response = await super.list(req);
    let pages = response.result.data
    await pages.forEach(function (page, key) {
      if (page.slug == '404' || page.slug == '500') {
        response.result.data[key].setDataValue('deletable', false)
      } else {
        response.result.data[key].setDataValue('deletable', true)
      }
    })
    return response
  }
  //override add function
  async add(req, res) {
    let response = await super.add(req);
    let fields = { ...response.fields };
    const site_id = req.header("site_id");
    let layouts = await Layout.findAll({
      where: {
        company_portal_id: site_id,
        code: {
          [Op.notLike]: "%-rev-%",
        },
      },
    });
    let default_layout = await Layout.findOne({
      where: { code: 'default-layout', company_portal_id: site_id },
    });
    fields.layout_id.value = default_layout.id;
    let components = await Component.findAll({
      where: {
        company_portal_id: site_id,
        code: {
          [Op.notLike]: "%-rev-%",
        },
      },
    });
    layouts = layouts.map((layout) => {
      return {
        id: layout.id,
        value: layout.name,
      };
    });
    components = components.map((component) => {
      return {
        id: component.id,
        value: component.name,
        html: component.html,
      };
    });

    fields.layouts = {
      field_name: "layout",
      db_name: "layouts",
      type: "select",
      placeholder: "Layout",
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: true,
      options: layouts,
    };
    fields.components = {
      field_name: "component",
      db_name: "components",
      type: "select",
      placeholder: "Component",
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
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

    const site_id = req.header("site_id");
    let layouts = await Layout.findAll({
      where: {
        company_portal_id: site_id,
        code: {
          [Op.notLike]: "%-rev-%",
        },
      },
    });
    let default_layout = await Layout.findOne({
      where: { code: 'default-layout', company_portal_id: site_id },
    });
    fields.layout_id.value = default_layout.id;
    let components = await Component.findAll({
      where: {
        company_portal_id: site_id,
        code: {
          [Op.notLike]: "%-rev-%",
        },
      },
    });
    layouts = layouts.map((layout) => {
      return {
        id: layout.id,
        value: layout.name,
      };
    });
    components = components.map((component) => {
      return {
        id: component.id,
        value: component.name,
        html: component.html,
      };
    });

    fields.layouts = {
      field_name: "layout",
      db_name: "layouts",
      type: "select",
      placeholder: "Layout",
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: true,
      options: layouts,
    };
    fields.components = {
      field_name: "component",
      db_name: "components",
      type: "select",
      placeholder: "Component",
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: true,
      options: components,
    };
    response.fields = fields;
    return response;
  }
  //override save function
  async save(req, res) {
    req.body.company_portal_id = req.headers.site_id;
    req.body.updated_at = new Date()
    req.body.slug = req.body.slug || '/';
    //unique code checking
    let check_code = await this.model.findOne({
      where: { slug: req.body.slug, company_portal_id: req.headers.site_id },
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
    req.body.slug = req.body.slug || '/';
    //unique code checking
    let check_code = await this.model.findOne({
      where: { slug: req.body.slug, company_portal_id: req.headers.site_id, id: { [Op.ne]: req.params.id } },
    });
    if (check_code) {
      this.throwCustomError("Slug already in use.", 409);
    }
    let response = await super.update(req);
    return {
      status: true,
      message: "Page updated.",
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
  //page preview
  async preview(req, res) {
    let id = req.params.id;
    let page_details = await Page.findAll({
      where: {
        id: id,
      },
    });

    //fetch layout details
    let layout_details = await Layout.findAll({
      where: {
        id: page_details[0].layout_id,
      },
    });
    let layout_content = "";
    let layout_value = layout_details[0].layout_json.body["value"];

    layout_value.forEach(async (value) => {
      if (value.code == "{{content}}") {
        // layout_content = layout_content+value.code+' '
        layout_content = layout_content + page_details[0].html + " ";
      } else {
        let component_code = value.code.replaceAll("{", "");
        component_code = component_code.replaceAll("}", "");
        let component_details = await Component.findAll({
          where: {
            code: component_code,
          },
        });
        layout_content = layout_content + " " + component_details[0].html;
        // layout_content = layout_content+"${convert_component('"+component_code+"')} "
        console.log(value.code);
        console.log(component_details[0].html);
      }
    });
    var page_body = page_details[0].html;
    console.log("layout_content", layout_content);
    // layout_content = layout_content.replace("{{content}}", page_body);
    let page_content = eval("`" + layout_content + "`");

    // res.json({
    //   result:page_content
    // })
    res.render("page", { page_content: page_content });
  }
}

module.exports = PageController;
