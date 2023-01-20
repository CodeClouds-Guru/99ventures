const {
  Layout,
  Component,
  Page,
  CompanyPortalMetaTag,
  CompanyPortalAdditionalHeader,
} = require("../models");
const { QueryTypes, Op } = require("sequelize");

const defaultAddOns = [
  {
    type: 'script',
    src: 'https://99-ventures-bucket.s3.us-east-2.amazonaws.com/Resources/jquery-v1.js'
  },
  {
    type: 'script',
    src: 'https://99-ventures-bucket.s3.us-east-2.amazonaws.com/Resources/socket.io.js'
  }
];
class PageParser {
  constructor(slug) {
    this.slug = slug;
    this.page = null;
    this.preview = this.preview.bind(this);
    this.getPageNLayout = this.getPageNLayout.bind(this);
    this.generateHtml = this.generateHtml.bind(this);
    this.convertComponentToHtml = this.convertComponentToHtml.bind(this);
    this.addDefaultAddOns = this.addDefaultAddOns.bind(this);
  }

  async getPageNLayout() {
    this.page = await Page.findOne({
      where: { slug: this.slug },
      include: "Layout",
    });
    if (!this.page || !this.page.Layout) {
      const errorObj = new Error("Sorry! Page not found");
      errorObj.statusCode = 404;
      throw errorObj;
    }
  }

  async preview() {
    const page_content = await this.generateHtml();
    return page_content;
  }

  async generateHtml() {
    await this.getPageNLayout();
    let layout_html = this.page.Layout.html;
    const page_title = this.page.name;
    let content = this.page.html;
    const page_keywords = this.page.keywords;
    const page_descriptions = this.page.descriptions;
    const page_meta_code = this.page.meta_code || "";
    let layout_keywords = await CompanyPortalMetaTag.findOne({
      where: {
        tag_name: "Keywords",
        company_portal_id: this.page.company_portal_id,
      },
    });
    let layout_descriptions = await CompanyPortalMetaTag.findOne({
      where: {
        tag_name: "Description",
        company_portal_id: this.page.company_portal_id,
      },
    });
    let additional_headers = await CompanyPortalAdditionalHeader.findOne({
      where: { company_portal_id: this.page.company_portal_id },
    });
    layout_keywords = layout_keywords ? layout_keywords.tag_content : "";
    additional_headers = additional_headers ? additional_headers.tag_content : "";
    layout_descriptions = layout_descriptions
      ? layout_descriptions.tag_content
      : "";

    const default_scripted_codes = this.addDefaultAddOns();
    layout_html = layout_html.replaceAll("{{content}}", content);
    layout_html = layout_html.replaceAll("${additional_header_script}", additional_headers);
    layout_html = await this.convertComponentToHtml(layout_html);
    layout_html = eval("`" + layout_html + "`");
    return layout_html;
  }

  async convertComponentToHtml(layout_html) {
    var regex_match = layout_html.match(/{{\s*[\w\-*.]+\s*}}/g);
    if (regex_match) {
      var components = regex_match.map((x) => x.match(/[\w\-*.]+/)[0]);
      let matched_components = await Component.findAll({
        where: {
          code: {
            [Op.in]: components,
          },
        },
      });
      matched_components.forEach((item) => {
        layout_html = layout_html.replaceAll(`{{${item.code}}}`, item.html);
      });
    }
    return layout_html;
  }

  addDefaultAddOns() {
    var str = '';
    defaultAddOns.forEach(item => {
      switch (item.type) {
        case 'script':
          str += `<script src="${item.src}"></script>`
          break;
        case 'css':
          str += `<link rel="stylesheet" href="${item.src}">`
          break;
        default:
          break;
      }
    });
    return str;
  }
}
module.exports = PageParser;
