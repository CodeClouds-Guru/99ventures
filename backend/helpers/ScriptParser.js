const Models = require('../models');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const safeEval = require('safe-eval');
const util = require("util");
const { ceil } = require('lodash');
class ScriptParser {
  constructor() {
    this.parseScript = this.parseScript.bind(this);
    this.getModuleWhere = this.getModuleWhere.bind(this);
    // this.getOfferWallList = this.getOfferWallList.bind(this);
    // this.getTicketList = this.getTicketList.bind(this);
  }
  async parseScript(script_id, user, params) {
    var data = [];
    var page_count = 0
    var script_html = '';
    let script = await Models.Script.findOne({ where: { code: script_id } });
    if (script) {
      script_html = script.script_html;
      if (script.module) {
        switch (script.action_type) {
          case 'list':
            const perPage = 'perpage' in params ? parseInt(params.perpage) : 12;
            const orderBy = 'orderby' in params ? params.orderby : 'id';
            const order = 'order' in params ? params.order : 'desc';
            const pageNo = 'pageno' in params ? parseInt(params.pageno) : 1;
            // console.log({
            //   ...where,
            //   order: [[Sequelize.literal(orderBy), order]],
            //   limit: perPage,
            //   offset: (pageNo - 1) * perPage,
            //   include: { all: true }
            // })
            const param_where =
              'where' in params
                ? JSON.parse(params.where)
                : null;

            let where = this.getModuleWhere(script.module, user);

            if (param_where)
              where.where = {
                ...where.where,
                ...param_where,
              };

            // console.log(where);
            data = await Models[script.module].findAll({
              subQuery: false,
              order: [[Sequelize.literal(orderBy), order]],
              limit: perPage,
              offset: (pageNo - 1) * perPage,
              ...where,
            });
            var data_count = await Models[script.module].findAndCountAll({...where})
            page_count = Math.ceil(data_count.count/perPage)
            // console.log(data);

            //pagination
            if('pagination' in params && params.pagination === 'true'){
              script_html = await this.appendPagination(script_html,script_id,pageNo) 
            }
            break;
          case 'profile_update':
            const member_where = this.getModuleWhere(script.module, user);
            data = await Models[script.module].findOne({
              ...member_where,
            });
            let email_alerts = await Models.EmailAlert.getEmailAlertList(
              user.id
            );
            data.setDataValue('email_alerts', email_alerts);
            let country_list = await Models.Country.getAllCountryList();
            data.setDataValue('country_list', country_list);
            // console.log(data.country_id);
            break;
        }
      }
    }
    
    return {
      data: JSON.parse(JSON.stringify(data)),
      script_html,
      page_count
    };
  }
  getModuleWhere(module, user) {
    switch (module) {
      case 'Ticket':
        return { where: { member_id: user.id } };
      case 'MemberTransaction':
        return {
          include: { model: Models.Member },
          attributes: [
            'created_at',
            'id',
            'amount',
            [Sequelize.literal('Member.avatar'), 'avatar'],
            [Sequelize.literal('Member.username'), 'username'],
          ],
          where: { type: 'credited' },
        };
      case 'Member':
        return {
          where: { id: user.id },
          include: { model: Models.MembershipTier, attributes: ['name'] },
        };
      case 'Shoutbox':
        return {
          attributes: ['verbose','created_at'],
        };
      case 'MemberReferral':
        return{
          include: {model: Models.Member,attributes: ['first_name','last_name']}
        }
      default:
        return null;
    }
  }
  //append pagination
  async appendPagination(script_html,script_id,page_no){
    script_html = script_html + `<div class="pagination-sec d-flex justify-content-center justify-content-md-end mt-0 mt-lg-3 mt-xl-4 py-2 py-lg-0">\
    <nav aria-label="Page navigation example">\
      <ul class="pagination mb-0">\
      <li class="page-item">\
        <a href="#" aria-label="Previous" class="page-link"><svg fill="#D6D6D6" width="16" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 16 16" class="bi bi-chevron-left">\
        <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" fill-rule="evenodd">\
        </path>\
        </svg></a>\
      </li>\
      {{#for 1 page_count 1}}\
      <li data-page="{{this}}" class="page-item" data-id="`+script_id+`-{{this}}">\
        <a href="javascript:void(0)" class="page-link">{{this}}</a>\
      </li>\
      {{/for}}\
      <li class="page-item">\
        <a href="#" aria-label="Next" class="page-link"><svg fill="#D6D6D6" width="16" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 16 16" class="bi bi-chevron-right">\
        <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" fill-rule="evenodd">\
        </path>\
        </svg></a>\
      </li>\
      </ul>\
    </nav>\
    </div>\
    <script>\
	    $(document).ready(function () {\
        $(document).on("click",".page-item",function(e) {\
          e.stopImmediatePropagation();\
          var page = $(this).data("page");\
          var div_element = document.querySelector("[data-script='`+script_id+`']");\
          $(div_element).data("pageno",page);\
          callPagination(div_element);\
        });\
        function callPagination(element) {\
          var dataAttrs = $(element).data();\
          var params = {pageno: 1,perpage: 10,orderby: null,order: null,script: "",member: null,...dataAttrs};\
          $.ajax({\
            url: '/get-scripts/',\
            type: "GET",\
            data: params,\
            success: function (res) {\
              if (res.status) {\
                $(element).html(res.html);\
                var page_element = document.querySelector("[data-id='`+script_id+`-`+page_no+`']");\
                $(page_element).addClass("active");\
              }\
            }
          })\
        }
      });\
  </script>`; 
  return script_html;
  }
}
module.exports = ScriptParser;
