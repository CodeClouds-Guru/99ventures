const Controller = require('./Controller');
const { Op } = require('sequelize');
const {
  Member,
  CampaignMember,
  CompanyPortal,
  IpLog,
  sequelize,
} = require('../../models/index');
const util = require('util');
const csv = require('../../helpers/CsvHelper');
const fs = require('fs');
class CampaignController extends Controller {
  constructor() {
    super('Campaign');
  }

  async list(req, res) {
    let options = await this.getQueryOptions(req);
    let company_portal_id = req.headers.site_id;

    // var query_where = JSON.parse(req.query.where);
    // var temp = {};
    // var status_filter = {};
    // if (query_where) {
    //   if (query_where.filters) {
    //     temp = query_where.filters.map((filter) => {
    //       return {
    //         [filter.column]: {
    //           [Op[filter.match]]: filter.search,
    //         },
    //       };
    //     });
    //   }
    // }
    // options.where = {
    //   ...options.where,
    //   company_portal_id: company_portal_id,
    //   ...(temp && { [Op.and]: temp }),
    // };
    var query_str =
      'FROM campaign_member WHERE campaign_member.campaign_id = Campaign.id';

    var fields = Object.keys(this.model.fields).filter(
      (x) => !this.model.extra_fields.includes(x)
    );
    options.attributes = fields.concat([
      [sequelize.literal(`(SELECT COUNT(*)` + query_str + `)`), 'users'],
      [
        sequelize.literal(
          `(SELECT COUNT(if(campaign_member.is_condition_met=1,1,null)) ` +
            query_str +
            `)`
        ),
        'leads',
      ],
      [
        sequelize.literal(
          `(SELECT COUNT(if(campaign_member.is_reversed=1,1,null)) ` +
            query_str +
            `)`
        ),
        'reversals',
      ],
    ]);
    let page = req.query.page || 1;
    let limit = parseInt(req.query.show) || 10; // per page record
    let offset = (page - 1) * limit;
    options.limit = limit;
    options.offset = offset;
    // console.log(
    //   util.inspect(options, { showHidden: false, depth: null, colors: true })
    // );
    let result = await this.model.findAndCountAll(options);
    let pages = Math.ceil(result.count / limit);
    return {
      result: { data: result.rows, pages, total: result.count },
      fields: this.model.fields,
    };
  }
  //view campaign
  async view(req, res) {
    let member_id = req.query.member_id;
    let report = req.query.report;
    let where = { campaign_id: req.params.id };
    let export_csv = req.query.export_csv || false;
    if (member_id) {
      where['member_id'] = { member_id: member_id };
    }
    let model = await this.model.findOne({
      where: { id: req.params.id },
      include: {
        model: CompanyPortal,
        // required: false,
        attributes: ['domain'],
      },
    });
    //view url section
    let campaign_link = {};
    if (model.CompanyPortal && model.CompanyPortal.domain) {
      let home_page_url =
        model.CompanyPortal.domain +
        '/?cid=' +
        req.params.id +
        '&track=' +
        model.track_id;
      let registration_page_url =
        model.CompanyPortal.domain +
        '/?members/register.php?cid=' +
        req.params.id +
        '&track=' +
        model.track_id;

      let referral_link =
        "Replace 'scripteed' within the below campaign links with the username of the member you would like to use.";
      let ref_home_page_url =
        model.CompanyPortal.domain +
        '/?ref=scripteed&cid=' +
        req.params.id +
        '&track=' +
        model.track_id;
      let ref_registration_page_url =
        model.CompanyPortal.domain +
        '/?members/register.php?/?ref=scripteed&cid=' +
        req.params.id +
        '&track=' +
        model.track_id;
      // console.log("========", home_page_url, "========", registration_page_url);
      campaign_link = {
        home_page_url,
        registration_page_url,
        referral_link,
        ref_home_page_url,
        ref_registration_page_url,
      };
    }
    let fields = {};
    if (parseInt(report) == 1) {
      //filter parameters
      var campaign_status = req.query.campaign_status; //0 = not met, 1 = postback triggered, 2 = postback not triggered, 3 = condition met (reversed)
      var custom_where = req.query.where ? JSON.parse(req.query.where) : {};
      if (campaign_status != '') {
        if (parseInt(campaign_status) == 0) {
          custom_where['is_condition_met'] = 0;
        } else if (parseInt(campaign_status) == 3) {
          custom_where['is_condition_met'] = 1;
          custom_where['is_reversed'] = 1;
        } else if (parseInt(campaign_status) == 1) {
          custom_where['is_condition_met'] = 1;
          custom_where['is_postback_triggered'] = 1;
        } else if (parseInt(campaign_status) == 2) {
          custom_where['is_condition_met'] = 1;
          custom_where['is_postback_triggered'] = 0;
        }
        req.query.where = JSON.stringify(custom_where);
      }
      fields = {
        id: {
          field_name: 'id',
          db_name: 'id',
          type: 'text',
          placeholder: 'Id',
          listing: true,
          show_in_form: false,
          sort: true,
          required: false,
          value: '',
          width: '50',
          searchable: false,
        },
        name: {
          field_name: 'name',
          db_name: 'name',
          type: 'text',
          placeholder: 'Name',
          listing: false,
          show_in_form: false,
          sort: true,
          required: false,
          value: '',
          width: '50',
          searchable: false,
        },
        member_id: {
          field_name: 'member_id',
          db_name: 'member_id',
          type: 'text',
          placeholder: 'User ID',
          listing: true,
          show_in_form: false,
          sort: true,
          required: false,
          value: '',
          width: '50',
          searchable: true,
        },
        username: {
          field_name: 'username',
          db_name: 'username',
          type: 'text',
          placeholder: 'Username',
          listing: true,
          show_in_form: false,
          sort: true,
          required: false,
          value: '',
          width: '50',
          searchable: true,
        },
        created_at: {
          field_name: 'created_at',
          db_name: 'created_at',
          type: 'text',
          placeholder: 'Signup Date',
          listing: true,
          show_in_form: false,
          sort: true,
          required: true,
          value: '',
          width: '50',
          searchable: true,
        },
        status: {
          field_name: 'status',
          db_name: 'status',
          type: 'text',
          placeholder: 'Status',
          listing: true,
          show_in_form: true,
          sort: true,
          required: true,
          value: '',
          width: '50',
          searchable: true,
        },
        cash: {
          field_name: 'payout_amount',
          db_name: 'payout_amount',
          type: 'text',
          placeholder: 'Cash',
          listing: true,
          show_in_form: true,
          sort: true,
          required: false,
          value: '',
          width: '50',
          searchable: true,
        },
        points: {
          field_name: 'payout_point',
          db_name: 'payout_amount',
          type: 'text',
          placeholder: 'Points',
          listing: false,
          show_in_form: true,
          sort: true,
          required: false,
          value: '',
          width: '50',
          searchable: true,
        },
        combained: {
          field_name: 'combained',
          db_name: 'combained',
          type: 'text',
          placeholder: 'Combained',
          listing: false,
          show_in_form: true,
          sort: true,
          required: true,
          value: '',
          width: '50',
          searchable: true,
        },
        ip: {
          field_name: 'ip',
          db_name: 'ip',
          type: 'text',
          placeholder: 'IP',
          listing: true,
          show_in_form: true,
          sort: false,
          required: true,
          value: '',
          width: '50',
          searchable: false,
        },
        track_id: {
          field_name: 'track_id',
          db_name: 'track_id',
          type: 'text',
          placeholder: 'Tracking ID',
          listing: true,
          show_in_form: true,
          sort: true,
          required: true,
          value: '',
          width: '50',
          searchable: true,
        },
      };
      // return req.query
      var options = await this.getQueryOptions(req, fields);
      options.attributes = [
        'id',
        'member_id',
        'campaign_id',
        'track_id',
        [
          sequelize.literal(
            'CASE WHEN `is_condition_met` = 0 THEN 0 WHEN `is_condition_met` = 1 AND `is_reversed` = 1 THEN 3 WHEN `is_condition_met` = 1 AND `is_postback_triggered` = 1 THEN 1 WHEN `is_condition_met` = 1 AND `is_postback_triggered` = 0 THEN 2 ELSE 0 END'
          ),
          'campaign_status',
        ],
      ];
      options.include = {
        model: Member,
        // required: false,
        attributes: [
          'id',
          'first_name',
          'last_name',
          'email',
          'username',
          'created_at',
          'status',
        ],
        include:{
          model: IpLog,
          attributes: [
            "ip",
          ],
          limit: 1,
          order: [["created_at", "DESC"]],
        }
      };
      
      const { docs, pages, total } = await CampaignMember.paginate(options);
      
      let report_details = [];
      docs.forEach(function (record, key) {
        if (record.dataValues.Member != null) {
          record.dataValues.Member.dataValues.avatar =
            record.dataValues.Member.dataValues.avatar;
          var member_ip = ''
          if(record.dataValues.Member.dataValues.IpLogs.length){
            member_ip = record.dataValues.Member.dataValues.IpLogs[0].ip
          }
          report_details.push({
            id: record.dataValues.id,
            name: model.dataValues.name,
            member_id: record.dataValues.member_id,
            username: record.dataValues.Member.dataValues.username,
            created_at: record.dataValues.Member.dataValues.created_at,
            status: record.dataValues.Member.dataValues.status,
            payout_amount: model.dataValues.payout_amount,
            payout_point: model.dataValues.payout_amount,
            combained: model.dataValues.payout_amount,
            track_id: record.dataValues.track_id,
            campaign_status: record.dataValues.campaign_status,
            ip: member_ip
          });
        }
      });

      if (export_csv) {
        delete options.page;
        delete options.paginate;
        options.where = { campaign_id: req.params.id };
        options.include.include = {
          model: IpLog,
          attributes: ['ip', 'created_at'],
          limit: 1,
          order: [['created_at', 'DESC']],
        };
        let report_data = await CampaignMember.findAll(options);
        let csv_class = new csv();
        const csv_response_filename = await csv_class.generateDataForCsv(
          report_data,
          model
        );
        console.log(
          'fs.existsSync(path)',
          fs.existsSync(csv_response_filename)
        );

        return {
          downloadable_file: {
            contentType: 'text/csv',
            fileName: csv_response_filename,
            toBeDeletedAfterDownload: true,
          },
        };
      }

      // console.log('==============', options);

      return {
        status: true,
        result: { data: report_details, campaign_details: model, pages, total },
        fields: fields,
      };
    } else {
      model.setDataValue('campaign_link', campaign_link);
      fields = this.model.fields;
      return { status: true, result: model, fields };
    }
  }
  //generate query
  async getQueryOptions(req, fields_custom) {
    let page = req.query.page || 1;
    let show = parseInt(req.query.show) || 10; // per page record
    var search = req.query.search || '';
    let sort_field = req.query.sort || 'id';
    let sort_order = req.query.sort_order || 'desc';
    let fields = CampaignMember.fields;
    let extra_fields = CampaignMember.extra_fields || [];
    let attributes = Object.values(fields)
      .filter((attr) => extra_fields.indexOf(attr.db_name) == -1)
      .map((attr) => attr.db_name);

    let searchable_fields = [];
    for (const key in fields) {
      if ('searchable' in fields[key] && fields[key].searchable) {
        searchable_fields.push(key);
      }
    }

    let options = {
      attributes,
      page,
      paginate: show,
      order: [[sort_field, sort_order]],
    };
    if (search != '') {
      options['where'] = {
        [Op.or]: searchable_fields.map((key) => {
          let obj = {};
          obj[key] = { [Op.like]: `%${search}%` };
          return obj;
        }),
      };
    }
    var query_where = req.query.where ? JSON.parse(req.query.where) : null;
    for(let where_field in query_where){
      if(where_field in fields){
        if(where_field=='created_at' && Array.isArray(query_where[where_field])){
          
        }
      }else{
        delete query_where[where_field]
      }
    }
    if ('where' in options && query_where) {
      options['where'] = {
        [Op.and]: {
          ...query_where,
          ...options['where'],
        },
      };
    } else if (query_where != null) {
      options['where'] = {
        ...query_where,
      };
    }
    return options;
  }

  //override save
  async save(req, res) {
    req.body.company_portal_id = req.headers.site_id;
    let model = await super.save(req);
    return {
      status: true,
      message: 'Record has been created successfully',
      result: model,
    };
  }
}

module.exports = CampaignController;
