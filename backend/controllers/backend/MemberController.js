const Controller = require('./Controller');
const { QueryTypes, Op } = require('sequelize');
const {
  MembershipTier,
  IpLog,
  Country,
  EmailAlert,
  MemberNote,
  MemberPaymentInformation,
  PaymentMethod,
  MemberReferral,
  MemberBalance,
  MemberTransaction,
  Member,
  User,
  CompanyPortal,
  Survey,
  SurveyProvider,
  Company,
  WithdrawalRequest,
  sequelize,
} = require('../../models/index');
const queryInterface = sequelize.getQueryInterface();
const db = require('../../models/index');
const FileHelper = require('../../helpers/fileHelper');
const { cryptoEncryption, cryptoDecryption } = require('../../helpers/global');
// const membertransaction = require('../../models/membertransaction');
const util = require('util');
// const withdrawalrequest = require('../../models/withdrawalrequest');
const moment = require('moment');
const CsvHelper = require('../../helpers/CsvHelper');
class MemberController extends Controller {
  constructor() {
    super('Member');
    this.view = this.view.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.deleteMemberNotes = this.deleteMemberNotes.bind(this);
    this.export = this.export.bind(this);
    this.generateFields = this.generateFields.bind(this);
    this.getMembersList = this.getMembersList.bind(this);
    this.fieldConfig = {
      id: 'ID',
      username: 'Username',
      first_name: 'First name',
      last_name: 'Last Name',
      created_at: 'Join date',
      last_active_on: 'Last active date',
      'MemberReferral.referral_email': 'Referral',
      email: 'Registration email ',
      'MemberPaymentInformations.value': 'Payment emails',
      'IpLogs.ip': 'Current IP',
      'IpLogs.geo_location': 'Geo location',
      'IpLogs.isp': 'Geo ISP',
      'IpLogs.browser': 'Browser',
      'IpLogs.browser_language': 'Browser Language',
      status: 'Status',
      'MembershipTier.name': 'Membership level',
      address: 'Address',
      phone_no: 'Telephone',
      'MemberEmailAlerts.slug': 'Email marketing opt in',
      'MemberTransactions.balance': 'Current Balance',
      'MemberTransactions.amount': 'Total Earnings',
      'WithdrawalRequests.amount': 'Withdrawal - total paid',
      'WithdrawalRequests.created_at': 'Withdrawal - last cash out (date)',
      admin_status: 'Verified/unverified',
    };
  }
  async save(req, res) {
    try {
      const existing_email_or_username = await Member.count({
        where: {
          company_portal_id: req.body.company_portal_id,
          [Op.or]: {
            email: req.body.email,
            username: req.body.username,
          },
        },
      });

      if (existing_email_or_username > 0) {
        const errorObj = new Error(
          'Sorry! this username or email has already been taken'
        );
        errorObj.statusCode = 422;
        errorObj.data = [
          'Sorry! this username or email has already been taken',
        ];
        throw errorObj;
      } else {
        req.body.membership_tier_id = 1;
        let files = [];
        if (req.files) {
          files[0] = req.files.avatar;
          const fileHelper = new FileHelper(files, 'members', req);
          const file_name = await fileHelper.upload();
          req.body.avatar = file_name.files[0].filename;
        }

        const res = await super.save(req);
        // console.log("---------------res", res.result.id);
        //send mail
        const eventBus = require('../../eventBus');
        let member_details = await Member.findOne({
          where: { email: req.body.email },
        });

        let evntbus = eventBus.emit('send_email', {
          action: 'Welcome',
          data: {
            email: req.body.email,
            details: { members: member_details },
          },
          req: req,
        });

        return res;
      }
    } catch (error) {
      console.error('error saving member', error);
      this.throwCustomError(error.data, 402);
    }
  }

  async view(req, res) {
    let company_id = req.headers.company_id;
    let company_portal_id = req.headers.site_id;
    let member_id = req.params.id || null;
    let type = req.query.type || null;
    // console.log(type);
    // let type = req.body.type || null;
    if (member_id) {
      let country_list = [];
      let email_alerts = [];
      let total_earnings = {};
      let survey_list = [];
      let result = {};
      try {
        if (type !== 'email_alert') {
          let options = {};
          options.attributes = [
            'id',
            'first_name',
            'last_name',
            'email',
            'country_code',
            'username',
            'status',
            'admin_status',
            'zip_code',
            'phone_no',
            'avatar',
            'address_1',
            'address_2',
            'city',
            'last_active_on',
            'country_id',
            'referral_code',
            'member_referral_id',
            'gender',
          ];

          options.where = { id: member_id };

          options.include = [
            {
              model: MembershipTier,
              attributes: ['id', 'name'],
            },
            {
              model: Country,
              attributes: [['nicename', 'name']],
            },
            {
              model: IpLog,
              attributes: [
                'geo_location',
                'ip',
                'isp',
                'browser',
                'browser_language',
              ],
              limit: 1,
              order: [['created_at', 'DESC']],
            },
            {
              model: MemberNote,
              attributes: [
                'user_id',
                'member_id',
                'previous_status',
                'current_status',
                'note',
                'created_at',
                'id',
              ],
              limit: 20,
              order: [['created_at', 'DESC']],
              include: {
                model: User,
                attributes: ['first_name', 'last_name', 'alias_name'],
              },
            },
            {
              model: MemberTransaction,
              attributes: ['member_payment_information_id'],
              limit: 1,
              where: {
                member_id: member_id,
                status: 2,
                type: 'credited',
              },
              order: [['created_at', 'DESC']],
              include: {
                model: MemberPaymentInformation,
                attributes: ['name', 'value'],
              },
            },
            {
              model: MemberReferral,
              attributes: ['referral_email', 'ip', 'member_id'],
              include: {
                model: Member,
                as: 'member_referrer',
                attributes: [
                  'referral_code',
                  'first_name',
                  'last_name',
                  'email',
                ],
              },
            },
            {
              model: MemberPaymentInformation,
              attributes: ['name', 'value'],
              where: { status: [1, '1'] },
              limit: 1,
            },
          ];
          result = await this.model.findOne(options);
          country_list = await Country.getAllCountryList();
          let admin_status = result.admin_status.replaceAll(' ', '_');

          //get total earnings
          total_earnings = await this.getTotalEarnings(member_id);

          survey_list = await MemberTransaction.findAll({
            attributes: ['amount', 'completed_at'],
            limit: 5,
            order: [['completed_at', 'DESC']],
            where: {
              type: 'credited',
              status: 2,
              amount_action: 'survey',
              member_id: member_id,
            },
            include: {
              model: Survey,
              attributes: ['id'],
              include: { model: SurveyProvider, attributes: ['name'] },
            },
          });
          // console.log('survey_list', survey_list);
          for (let i = 0; i < survey_list.length; i++) {
            if (survey_list[i].Surveys && survey_list[i].Surveys.length > 0)
              survey_list[i].setDataValue(
                'name',
                survey_list[i].Surveys[0].SurveyProvider.name
              );
            else survey_list[i].setDataValue('name', null);
            survey_list[i].Surveys = null;
          }
          let membership_tier = await MembershipTier.findAll({
            attributes: ['id', 'name'],
          });
          //get member referrer name
          var member_referrer = '';
          if (result.member_referral_id) {
            member_referrer = await this.model.findOne({
              where: { id: result.member_referral_id },
            });
            // console.log(member_referrer);
            member_referrer =
              member_referrer.first_name + ' ' + member_referrer.last_name;
            // console.log(referrer_name);
          }
          // console.log(req.headers);
          var referral_link =
            req.headers.host +
            '/login?referral_code=' +
            result.referral_code +
            '#signup';
          result.setDataValue('country_list', country_list);
          result.setDataValue('total_earnings', total_earnings);
          result.setDataValue('survey', survey_list);
          result.setDataValue('membership_tier', membership_tier);
          result.setDataValue('member_referrer', member_referrer);
          result.setDataValue('referral_link', referral_link);
          // result.setDataValue('admin_status', admin_status.toLowerCase());
        } else {
          //get all email alerts
          email_alerts = await EmailAlert.getEmailAlertList(member_id);
          result.email_alert_list = email_alerts;
        }

        return {
          status: true,
          data: result,
        };
      } catch (error) {
        console.error(error);
        this.throwCustomError('Unable to get data', 500);
      }
    } else {
      console.error(error);
      this.throwCustomError('Unable to get data', 500);
    }
  }

  async update(req, res) {
    let id = req.params.id || null;
    let request_data = req.body;
    try {
      let result = false;
      if (req.body.type == 'basic_details') {
        delete req.body.type;
        let member = await this.model.findOne({ where: { id: req.params.id } });
        if (!req.body.username) {
          req.body.username = member.username;
        }
        const { error, value } = this.model.validate(req);
        if (error) {
          const errorObj = new Error('Validation failed.');
          errorObj.statusCode = 422;
          errorObj.data = error.details.map((err) => err.message);
          throw errorObj;
        }
        //check member username
        let member_username = await this.model.findOne({
          where: {
            username: req.body.username,
            id: { [Op.ne]: req.params.id },
          },
        });
        if (member_username) {
          this.throwCustomError('Username already exists.', 422);
        }
        result = this.updateBasicDetails(req, member);
      } else if (req.body.type == 'member_status') {
        result = await this.model.changeStatus(req);
        delete req.body.type;
      } else if (req.body.type == 'admin_status') {
        result = await this.model.changeAdminStatus(req);
        delete req.body.type;
      } else if (req.body.type == 'admin_adjustment') {
        result = await this.adminAdjustment(req);
        delete req.body.type;
      } else if (req.body.type == 'email_alerts') {
        let member_id = req.params.id;
        let email_alerts = req.body.email_alerts;
        result = await EmailAlert.saveEmailAlerts(member_id, email_alerts);
        delete req.body.type;
      } else if (req.body.type == 'payment_email') {
        result = await MemberPaymentInformation.updatePaymentInformation({
          member_id: req.params.id,
          member_payment_info: [
            { field_name: 'email', field_value: req.body.email },
          ],
          // payment_email: req.body.email,
        });
        delete req.body.type;
      } else {
        // console.error(error);
        this.throwCustomError('Type is required', 401);
      }
      if (result) {
        return {
          status: true,
          message: 'Record has been updated successfully',
        };
      } else {
        this.throwCustomError('Unable to save data', 500);
      }
    } catch (error) {
      console.error(error);
      if (error.data && Array.isArray(error.data)) {
        this.throwCustomError(error.data[0], 500);
      } else {
        this.throwCustomError(error.data, 500);
      }
    }
  }

  //override list function 
  async list(req, res) {
    // The purpose of this IF statement is to populate excluded members dropdown on Payment Configuration tab.
    if (
      req.query.source_module &&
      req.query.source_module === 'paymentconfiguration'
    ) {
      return this.getMembersList(req, res);
    }
    const options = this.getQueryOptions(req);
    let company_id = req.headers.company_id;
    let site_id = req.headers.site_id;
    var query_where = JSON.parse(req.query.where);
    var temp = {};
    var status_filter = {};
    if (query_where) {
      if (query_where.filters) {
        temp = query_where.filters.map((filter) => {
          return {
            [filter.column]: {
              [Op[filter.match]]: filter.search,
            },
          };
        });
      }
    }
    options.where = {
      ...(temp && { [Op.and]: temp }),
      ...(query_where.status &&
        query_where.status.length > 0 && {
          status: { [Op.in]: query_where.status },
        }),
    };

    // Do not delete these variables, these are using dynamically
    const IpLogs = IpLog;
    const MemberPaymentInformations = MemberPaymentInformation;
    const WithdrawalRequests = WithdrawalRequest;
    const MemberTransactions = MemberTransaction;

    const includesModel = [
      {
        model: IpLog,
        // attributes: ['ip', 'isp', 'geo_location', 'browser'],
        order: [['id', 'DESC']],
      }
    ];

    // Dynamically generating Model Relationships
    const fields = req.query.fields;
    for(let field of fields) {
      const mdl = field.split('.');
      if(mdl.length >1 && mdl[0] !== 'MemberEmailAlerts') {
        let indx = includesModel.findIndex(el => el.model == eval(mdl[0]));
        if(indx !== -1){
          if(includesModel[indx].attributes)
            includesModel[indx].attributes = [...new Set([...includesModel[indx].attributes, mdl[1]])];
          else 
            includesModel[indx].attributes = [mdl[1]];
        } else {
          includesModel.push({
            model: eval(mdl[0]),
            attributes: [mdl[1]]
          })
        }
      }
      else if(mdl.length >1 && mdl[0] === 'MemberEmailAlerts') {
        includesModel.push({
          model: EmailAlert,
          as: 'MemberEmailAlerts',
          attributes: [mdl[1]]
        })
      }
    }
    
    options.include = includesModel;
    options.where = {
      ...options.where,
      company_portal_id: site_id,
    };
    let page = req.query.page || 1;
    let limit = parseInt(req.query.show) || 10; // per page record
    let offset = (page - 1) * limit;
    options.limit = limit;
    options.offset = offset;
    options.subQuery = false;
    options.distinct = true;
    options.attributes = req.query.fields || ['id', 'first_name', 'username'];
    options.group = 'Member.id';

    let result = await this.model.findAndCountAll(options);
    let pages = Math.ceil(result.count.length / limit);
    result.rows.map((row) => {
      let ip = '';
      let geo_location = '';
      let isp = '';
      let browser = '';
      let browser_language = '';
      let membership_tier_name = '';
      // let opted_for_email_alerts = row.MemberEmailAlerts.length > 0 ? 'Yes' : 'No';
      let member_account_balance = 0.0;
      let member_total_earnings = 0.0;
      let total_paid = 0.0;
      let cashout_date = 'N/A';
      if (row.IpLogs && row.IpLogs.length > 0) {
        let last_row = row.IpLogs[0];
        ip = last_row.ip;
        geo_location = last_row.geo_location;
        isp = last_row.isp;
        browser = last_row.browser;
        browser_language = last_row.browser_language;
      }
      if (row.MembershipTier) {
        membership_tier_name = row.MembershipTier.name;
      }
      if (row.MemberTransactions && row.MemberTransactions.length > 0) {
        member_account_balance = row.MemberTransactions[0].balance;
        member_total_earnings = row.MemberTransactions.reduce((sum, item) => {
          if (item.type === 'credited') sum += item.amount;
          return sum;
        }, 0.0);
      }
      if (row.WithdrawalRequests && row.WithdrawalRequests > 0) {
        cashout_date = moment(row.WithdrawalRequests[0].created_at).format(
          'YYYY-MM-DD'
        );
        total_paid = row.MemberTransactions.reduce((sum, item) => {
          if (item.status === 'approved') sum += item.amount;
          return sum;
        }, 0.0);
      }
      if(fields.includes('IpLogs.ip')){
        row.setDataValue('IpLogs.ip', ip);
      }
      if(fields.includes('IpLogs.geo_location')){
        row.setDataValue('IpLogs.geo_location', geo_location);
      }
      if(fields.includes('IpLogs.isp')){
        row.setDataValue('IpLogs.isp', isp);
      }
      if(fields.includes('IpLogs.browser')){
        row.setDataValue('IpLogs.browser', browser);
      }
      if(fields.includes('IpLogs.browser_language')){
        row.setDataValue('IpLogs.browser_language', browser_language);
      }

      if(fields.includes('MembershipTier.name')){
        row.setDataValue('MembershipTier.name', membership_tier_name);
      }
      if(fields.includes('MemberTransactions.balance')){
        row.setDataValue('MemberTransactions.balance', member_account_balance);
      }
      if(fields.includes('MemberTransactions.amount')){
        row.setDataValue('MemberTransactions.amount', member_total_earnings);
      }
      if(fields.includes('WithdrawalRequests.amount')){
        row.setDataValue('WithdrawalRequests.amount', total_paid);
      } 
      if(fields.includes('WithdrawalRequests.created_at')){
        row.setDataValue('WithdrawalRequests.created_at', cashout_date);
      }
      if(fields.includes('MemberEmailAlerts.slug')){
         let opted_for_email_alerts = row.MemberEmailAlerts.length > 0 ? 'Yes' : 'No';
        row.setDataValue('MemberEmailAlerts.slug', opted_for_email_alerts);
      }
      if(fields.includes('MemberPaymentInformations.value')){
        let email = row.MemberPaymentInformations.length ? row.MemberPaymentInformations[0].value : ''
        row.setDataValue('MemberPaymentInformations.value', email);
      }
      // row.setDataValue('MemberEmailAlerts.slug', opted_for_email_alerts);
      // row.setDataValue('MemberTransactions.balance', member_account_balance);
      // row.setDataValue('MemberTransactions.amount', member_total_earnings);
      // row.setDataValue('WithdrawalRequests.amount', total_paid);
      // row.setDataValue('WithdrawalRequests.created_at', cashout_date);
      return row;
    });

    return {
      result: { data: result.rows, pages, total: result.count.length },
      fields: this.generateFields(req.query.fields || []),
    };
  }

  generateFields(header_fields) {
    var fields = {};
    for (const key of header_fields) {
      fields[key] = {
        field_name: key,
        db_name: key,
        listing: true,
        placeholder:
          key in this.fieldConfig ? this.fieldConfig[key] : 'Unknown Col',
      };
    }
    return fields;
  }

  async export(req, res) {
    req.query.show = 100000;
    let { fields, result } = await this.list(req);
    var header = [];
    for (const head of Object.values(fields)) {
      header.push({ id: head.field_name, title: head.placeholder });
    }
    const rows = JSON.parse(JSON.stringify(result.data));
    const csv_helper = new CsvHelper(rows, header);
    csv_helper.generateAndEmailCSV(req.user.email);
    return {
      status: true,
      message: 'The CSV will be sent to your email address shortly.',
    };
  }

  //update member details and avatar
  async updateBasicDetails(req, member) {
    let request_data = req.body;
    try {
      request_data.updated_by = req.user.id;
      if (req.files) {
        // let member = await this.model.findOne({ where: { id: req.params.id } });
        let pre_avatar = member.avatar;
        let files = [];
        files[0] = req.files.avatar;
        const fileHelper = new FileHelper(files, 'members', req);
        const file_name = await fileHelper.upload();
        request_data.avatar = file_name.files[0].filename;

        if (pre_avatar != '') {
          let file_delete = await fileHelper.deleteFile(
            pre_avatar.replace(process.env.S3_BUCKET_OBJECT_URL, '')
          );
        }
      } else request_data.avatar = null;
      let model = await this.model.update(request_data, {
        where: { id: req.params.id },
      });
      return true;
    } catch (error) {
      console.log(error);
      if (error.data && Array.isArray(error.data)) {
        this.throwCustomError(error.data[0], 500);
      } else {
        this.throwCustomError(error.data, 500);
      }
    }
  }

  //get member total balance
  async getTotalEarnings(member_id) {
    let result = {};
    let total_earnings = await db.sequelize.query(
      'SELECT id, amount as total_amount, amount_type FROM `member_balances` WHERE member_id=?',
      {
        replacements: [member_id],
        type: QueryTypes.SELECT,
      }
    );
    let total_adjustment = await db.sequelize.query(
      "SELECT SUM(amount) as total_adjustment FROM `member_transactions` WHERE  amount_action='admin_adjustment' AND member_id=?",
      {
        replacements: [member_id],
        type: QueryTypes.SELECT,
      }
    );
    let total_earnings_credited = await db.sequelize.query(
      "SELECT SUM(amount) as total FROM `member_transactions` WHERE type='credited' AND member_id=?",
      {
        replacements: [member_id],
        type: QueryTypes.SELECT,
      }
    );
    result.earnings = total_earnings;
    result.total = total_earnings_credited[0].total;

    // result.total_adjustment = total_adjustment
    result.total_adjustment =
      total_adjustment[0].total_adjustment &&
      total_adjustment[0].total_adjustment == null
        ? 0
        : total_adjustment[0].total_adjustment;

    return result;
  }
  //get transaction details
  async adminAdjustment(req) {
    try {
      let member_id = req.params.id;
      let admin_amount = req.body.admin_amount || 0;
      let admin_note = req.body.admin_note || '';
      // let total_earnings = await this.getTotalEarnings(member_id);

      let result = await MemberTransaction.updateMemberTransactionAndBalance({
        member_id,
        amount: admin_amount,
        note: admin_note,
        type: parseFloat(admin_amount) > 0 ? 'credited' : 'withdraw',
        amount_action: 'admin_adjustment',
        created_by: req.user.id,
        status: 2,
      });
      if (result.status) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
      this.throwCustomError('Unable to get data', 500);
    }
  }

  async add(req, res) {
    let roles = req.user.roles.find((role) => role.id === 1);
    let companies = [];
    if (roles) {
      companies = await Company.findAll({
        attributes: ['id', 'name'],
        include: {
          model: CompanyPortal,
          attributes: ['id', 'name', 'domain'],
        },
      });
    }
    let country_list = await Country.getAllCountryList();

    return {
      status: true,
      fields: this.model.fields,
      companies,
      country_list,
    };
  }

  async delete(req, res) {
    var resp = {
      status: true,
      message: 'Action executed successfully',
    };
    try {
      switch (req.body.module) {
        case 'member_notes':
          await this.deleteMemberNotes(req);
          break;
        default:
          await super.delete(req);
          break;
      }
    } catch (e) {
      console.error(e);
      resp = {
        status: false,
        message: 'Oops! Something went wrong',
        error: e,
      };
    } finally {
      return resp;
    }
  }

  async deleteMemberNotes(req) {
    await MemberNote.destroy({ where: { id: req.body.ids } });
    return true;
  }

  /**
   * Get Member List.
   * This Fn is using only for the dropdown purpose
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async getMembersList(req, res) {
    const options = this.getQueryOptions(req);
    let company_id = req.headers.company_id;
    let site_id = req.headers.site_id;
    let page = req.query.page || 1;
    let limit = parseInt(req.query.show) || 10; // per page record
    let offset = (page - 1) * limit;
    options.attributes = ['id', 'username', 'email'];
    options.limit = limit;
    options.offset = offset;

    var query_where = JSON.parse(req.query.where);
    var temp = {};
    if (query_where) {
      if (query_where.filters) {
        temp = query_where.filters.map((filter) => {
          return {
            [filter.column]: {
              [Op[filter.match]]: filter.search,
            },
          };
        });
      }
    }
    options.where = {
      ...(temp && { [Op.and]: temp }),
      ...(query_where.status &&
        query_where.status.length > 0 && {
          status: { [Op.in]: query_where.status },
        }),
      company_portal_id: site_id,
    };

    const { docs, pages, total } = await this.model.paginate(options);
    return {
      result: { data: docs, pages, total },
    };
  }
}

module.exports = MemberController;
