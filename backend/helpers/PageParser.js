const {
  Layout,
  Component,
  Page,
  CompanyPortalMetaTag,
  CompanyPortalAdditionalHeader,
} = require('../models');
const util = require('util');
const { QueryTypes, Op } = require('sequelize');
const defaultAddOns = require('../config/frontend_static_files.json');
const safeEval = require('safe-eval');
const Handlebars = require('handlebars');
const ScriptParser = require('./ScriptParser');
const moment = require('moment');
class PageParser {
  constructor(slug, staticContent) {
    this.sessionUser = null;
    this.companyPortal = null;
    this.sessionMessage = '';
    this.sessionFlash = {};
    this.slug = slug;
    this.staticContent = staticContent;
    this.page = null;
    this.pageLayout = null;
    this.preview = this.preview.bind(this);
    this.getPageNLayout = this.getPageNLayout.bind(this);
    this.generateHtml = this.generateHtml.bind(this);
    this.convertComponentToHtml = this.convertComponentToHtml.bind(this);
    this.convertScriptToHtml = this.convertScriptToHtml.bind(this);
    this.addDefaultAddOns = this.addDefaultAddOns.bind(this);
    this.getSessionUser = this.getSessionUser.bind(this);
    this.getFlashMessage = this.getFlashMessage.bind(this);
    this.getCompanyPortal = this.getCompanyPortal.bind(this);
    this.getFlashObject = this.getFlashObject.bind(this);
    Handlebars.registerHelper('format', function (options) {
      return options.fn(this) ? moment(options.fn(this)).format('llll') : '';
    });
    Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
      switch (operator) {
        case '==':
          return v1 == v2 ? options.fn(this) : options.inverse(this);
        case '===':
          return v1 === v2 ? options.fn(this) : options.inverse(this);
        case '!=':
          return v1 != v2 ? options.fn(this) : options.inverse(this);
        case '!==':
          return v1 !== v2 ? options.fn(this) : options.inverse(this);
        case '<':
          return v1 < v2 ? options.fn(this) : options.inverse(this);
        case '<=':
          return v1 <= v2 ? options.fn(this) : options.inverse(this);
        case '>':
          return v1 > v2 ? options.fn(this) : options.inverse(this);
        case '>=':
          return v1 >= v2 ? options.fn(this) : options.inverse(this);
        case '&&':
          return v1 && v2 ? options.fn(this) : options.inverse(this);
        case '||':
          return v1 || v2 ? options.fn(this) : options.inverse(this);
        default:
          return options.inverse(this);
      }
    });
  }

  async getPageNLayout() {
    const page = await Page.findOne({
      where: { slug: this.slug },
      include: 'Layout',
    });
    this.pageLayout = page ? page.Layout : null;
    this.page = page;
    if (!this.pageLayout) {
      const portal = this.getCompanyPortal();
      this.pageLayout = await Layout.findByPk(portal.site_layout_id);
    }
    if (!this.page || !this.pageLayout) {
      const errorObj = new Error('Sorry! Page not found');
      errorObj.statusCode = 404;
      throw errorObj;
    }
    if (this.page.auth_required === 1 && !this.sessionUser) {
      const errorObj = new Error('Access Denied! Please Log in');
      errorObj.statusCode = 401;
      throw errorObj;
    }
  }

  async preview(req) {
    if ('company_portal' in req.session) {
      this.companyPortal = req.session.company_portal;
    }
    if ('member' in req.session) {
      this.sessionUser = req.session.member;
    }
    if ('flash' in req.session && req.session.flash) {
      this.sessionFlash = req.session.flash;
      this.sessionMessage = req.session.flash.error;
      if ('access_error' in req.session.flash) {
        this.sessionMessage = req.session.flash.access_error.error_message;
      }
      delete req.session.flash;
    }
    const page_content = await this.generateHtml();
    return page_content;
  }

  async generateHtml() {
    await this.getPageNLayout();
    let layout_html = this.pageLayout.html;
    const page_title = this.page.name;
    let content = this.staticContent ? this.staticContent : this.page.html;
    const page_keywords = this.page.keywords;
    const page_descriptions = this.page.descriptions;
    const page_meta_code = this.page.meta_code || '';
    const user = this.getSessionUser();
    const error_message = this.getFlashMessage() || '';
    let layout_keywords = await CompanyPortalMetaTag.findOne({
      where: {
        tag_name: 'Keywords',
        company_portal_id: this.page.company_portal_id,
      },
    });
    let layout_descriptions = await CompanyPortalMetaTag.findOne({
      where: {
        tag_name: 'Description',
        company_portal_id: this.page.company_portal_id,
      },
    });
    let additional_headers = await CompanyPortalAdditionalHeader.findOne({
      where: { company_portal_id: this.page.company_portal_id },
    });
    layout_keywords = layout_keywords ? layout_keywords.tag_content : '';
    additional_headers = additional_headers
      ? additional_headers.tag_content
      : '';
    layout_descriptions = layout_descriptions
      ? layout_descriptions.tag_content
      : '';

    const default_scripted_codes = this.addDefaultAddOns();
    layout_html = layout_html.replaceAll('{{content}}', content);
    layout_html = layout_html.replaceAll(
      '${additional_header_script}',
      additional_headers
    );
    layout_html = await this.convertComponentToHtml(layout_html);

    layout_html = safeEval('`' + layout_html + '`', {
      page_title,
      page_keywords,
      page_descriptions,
      page_meta_code,
      layout_keywords,
      layout_descriptions,
      default_scripted_codes,
    });
    const template = Handlebars.compile(layout_html);
    const flash = this.getFlashObject();
    layout_html = template({
      user,
      error_message,
      flash
    });
    this.sessionMessage = '';

    // console.log(user);
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

  //convert script ids to html
  async convertScriptToHtml(layout_html) {
    // var regex_match = layout_html.match(/{{[s]\d+-+\d+}}/g);
    var regex_match = layout_html.match(/\${do_script(.*?)}/g);
    console.log('regex_match', regex_match);

    if (regex_match) {
      await regex_match.forEach(async (script_id) => {
        // layout_html = await scriptParser.parseScript(layout_html,script_id);
      });
    }
    return layout_html;
  }
  addDefaultAddOns() {
    var str = '';
    defaultAddOns.forEach((item) => {
      switch (item.type) {
        case 'script':
          str += `<script src="${process.env.CLIENT_API_PUBLIC_URL}${item.src}"></script>`;
          break;
        case 'css':
          str += `<link rel="stylesheet" href="${process.env.CLIENT_API_PUBLIC_URL}${item.src}">`;
          break;
        default:
          break;
      }
    });
    return str;
  }

  getSessionUser() {
    return this.sessionUser;
  }
  getCompanyPortal() {
    return this.companyPortal;
  }
  getFlashMessage() {
    return this.sessionMessage;
  }
  getFlashObject() {
    return this.sessionFlash;
  }
}
module.exports = PageParser;
