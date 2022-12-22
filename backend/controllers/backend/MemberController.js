const Controller = require('./Controller')
const { QueryTypes, Op } = require('sequelize')
const {
  MembershipTier,
  IpLog,
  Country,
  MemberNote,
  MemberTransaction,
  MemberPaymentInformation,
  PaymentMethod,
  MemberReferral,
  MemberBalance,
  Member,
  User,
  CompanyPortal,
  Survey,
  SurveyProvider,
  Company,
  sequelize,
} = require('../../models/index')
const db = require('../../models/index')
const FileHelper = require('../../helpers/fileHelper')
class MemberController extends Controller {
  constructor() {
    super('Member')
    this.view = this.view.bind(this)
    this.update = this.update.bind(this)
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
      })

      if (existing_email_or_username > 0) {
        const errorObj = new Error(
          'Sorry! this username or email has already been taken'
        )
        errorObj.statusCode = 422
        errorObj.data = ['Sorry! this username or email has already been taken']
        throw errorObj
      } else {
        req.body.membership_tier_id = 1
        let files = []
        if (req.files) {
          files[0] = req.files.avatar
          const fileHelper = new FileHelper(
            files,
            'members/' + req.params.username,
            req
          )
          const file_name = await fileHelper.upload()
          req.body.avatar = file_name.files[0].filename
        }
        const res = await super.save(req)
        //send mail
        const eventBus = require('../../eventBus')
        let member_details = await Member.findOne({
          where: { email: req.body.email },
        })
        await MemberBalance.bulkCreate([
          {
            member_id: member_details.id,
            amount: 0.0,
            amount_type: 'cash',
            created_by: req.user.id,
          },
          {
            member_id: member_details.id,
            amount: 0.0,
            amount_type: 'point',
            created_by: req.user.id,
          },
        ])
        let evntbus = eventBus.emit('send_email', {
          action: 'Welcome',
          data: {
            email: req.body.email,
            details: { members: member_details },
          },
          req: req,
        })

        return res
      }
    } catch (error) {
      console.error('error saving member', error)
      this.throwCustomError('Unable to save data', 500)
    }
  }

  async view(req, res) {
    let company_id = req.headers.company_id
    let company_portal_id = req.headers.site_id
    let member_id = req.params.id || null
    // let type = req.body.type || null;
    if (member_id) {
      try {
        let options = {}
        options.attributes = [
          'id',
          'first_name',
          'last_name',
          'email',
          'country_code',
          'username',
          'status',
          'zip_code',
          'phone_no',
          'avatar',
          'address_1',
          'address_2',
          'address_3',
          'last_active_on',
          'country_id',
          'referral_code',
          'member_referral_id',
          'gender',
        ]

        options.where = { id: member_id }
        options.include = [
          {
            model: MembershipTier,
            attributes: ['name'],
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
              attributes: ['referral_code', 'first_name', 'last_name', 'email'],
            },
          },
        ]
        // options.include = [{ all: true, nested: true }];
        let result = await this.model.findOne(options)
        let country_list = await Country.getAllCountryList()

        //get total earnings
        let total_earnings = await this.getTotalEarnings(member_id)

        let survey_list = await MemberTransaction.findAll({
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
        })
        for (let i = 0; i < survey_list.length; i++) {
          survey_list[i].setDataValue(
            'name',
            survey_list[i].Surveys[0].SurveyProvider.name
          )
          survey_list[i].Surveys = null
        }

        result.setDataValue('country_list', country_list)
        result.setDataValue('total_earnings', total_earnings)
        result.setDataValue('survey', survey_list)

        return {
          status: true,
          data: result,
        }
      } catch (error) {
        console.error(error)
        this.throwCustomError('Unable to get data', 500)
      }
    } else {
      console.error(error)
      this.throwCustomError('Unable to get data', 500)
    }
  }

  async update(req, res) {
    let id = req.params.id
    let request_data = req.body
    try {
      let result = false
      if (req.body.type == 'basic_details') {
        delete req.body.type
        let member = await this.model.findOne({ where: { id: req.params.id } })
        req.body.username = member.username
        const { error, value } = this.model.validate(req)
        if (error) {
          const errorObj = new Error('Validation failed.')
          errorObj.statusCode = 422
          errorObj.data = error.details.map((err) => err.message)
          throw errorObj
        }
        result = this.updateBasicDetails(req, member)
      } else if (req.body.type == 'member_status') {
        result = await this.model.changeStatus(req)
        delete req.body.type
      } else if (req.body.type == 'admin_adjustment') {
        result = await this.adminAdjustment(req)
        delete req.body.type
      } else {
        console.error(error)
        this.throwCustomError('Type is required', 401)
      }
      if (result) {
        return {
          status: true,
          message: 'Record has been updated successfully',
        }
      } else {
        this.throwCustomError('Unable to save data', 500)
      }
    } catch (error) {
      console.error(error)
      this.throwCustomError('Unable to save data', 500)
    }
  }

  //override list function
  async list(req, res) {
    const options = this.getQueryOptions(req)
    let company_id = req.headers.company_id
    let site_id = req.headers.site_id
    // req.query.where = JSON.stringify({
    //   filters: [
    //     { column: "username", match: "substring", search: "Debosmita" },
    //     // { column: "email", match: "substring", search: "codeclouds" },
    //   ],
    //   // status: ["validating", "suspended"],
    // });
    // let search_options = {};
    var query_where = JSON.parse(req.query.where)
    var temp = {}
    var status_filter = {}
    if (query_where) {
      if (query_where.filters) {
        temp = query_where.filters.map((filter) => {
          return {
            [filter.column]: {
              [Op[filter.match]]: filter.search,
            },
          }
        })
      }
    }
    options.where = {
      ...(temp && { [Op.and]: temp }),
      ...(query_where.status &&
        query_where.status.length > 0 && {
        status: { [Op.in]: query_where.status },
      }),
    }
    let roles = req.user.roles.map((role) => {
      if (role.id == 1) return role.id
    })
    let fields = this.model.fields
    options.include = [
      {
        model: IpLog,
        attributes: ['ip', 'isp', 'geo_location', 'browser'],
        // order: [['id', 'DESC']],
        // limit: 1,
        // as: 'IpLogs',
      },
    ]
    if (roles == 1) {
      options.include.push({ model: CompanyPortal, attributes: ['name'] })
    } else {
      options.where = {
        ...options.where,
        company_portal_id: site_id,
      }
    }
    console.dir(options.include)
    let page = req.query.page || 1
    let limit = parseInt(req.query.show) || 10 // per page record
    let offset = (page - 1) * limit
    options.limit = limit
    options.offset = offset

    let result = await this.model.findAndCountAll(options)
    let pages = Math.ceil(result.count / limit)

    for (let i = 0; i < result.rows.length; i++) {
      if (roles == 1) {
        result.rows[i].setDataValue(
          'company_portal_id',
          result.rows[i].CompanyPortal.name
        )
        fields.company_portal_id.listing = true
      } else {
        fields.company_portal_id.listing = false
      }
      if (result.rows[i].IpLogs) {
        result.rows[i].setDataValue('ip', result.rows[i].IpLogs[0].ip)
      } else {
        result.rows[i].setDataValue('ip', '')
      }
    }

    return {
      result: { data: result.rows, pages, total: result.count },
      fields: fields,
    }
  }
  //update member details and avatar
  async updateBasicDetails(req, member) {
    let request_data = req.body
    try {
      request_data.updated_by = req.user.id
      if (req.files) {
        // let member = await this.model.findOne({ where: { id: req.params.id } });
        let pre_avatar = member.avatar
        let files = []
        files[0] = req.files.avatar
        const fileHelper = new FileHelper(
          files,
          'members/' + req.params.id,
          req
        )
        const file_name = await fileHelper.upload()
        request_data.avatar = file_name.files[0].filename

        if (pre_avatar != '') {
          let file_delete = await fileHelper.deleteFile(pre_avatar)
        }
      } else request_data.avatar = null
      let model = await this.model.update(request_data, {
        where: { id: req.params.id },
      })
      return true
    } catch (error) {
      console.error(error)
      this.throwCustomError('Unable to get data', 500)
    }
  }

  //get member total balance
  async getTotalEarnings(member_id) {
    let result = {}
    let total_earnings = await db.sequelize.query(
      'SELECT id, amount as total_amount, amount_type FROM `member_balances` WHERE member_id=?',
      {
        replacements: [member_id],
        type: QueryTypes.SELECT,
      }
    )
    let total_adjustment = await db.sequelize.query(
      "SELECT SUM(amount) as total_adjustment FROM `member_transactions` WHERE  amount_action='admin_adjustment' AND member_id=?",
      {
        replacements: [member_id],
        type: QueryTypes.SELECT,
      }
    )
    result.earnings = total_earnings

    // result.total_adjustment = total_adjustment
    result.total_adjustment =
      total_adjustment[0].total_adjustment &&
        total_adjustment[0].total_adjustment == null
        ? 0
        : total_adjustment[0].total_adjustment

    return result
  }
  //get transaction details
  async adminAdjustment(req) {
    try {
      let member_id = req.params.id
      let admin_amount = req.body.admin_amount || 0
      let admin_note = req.body.admin_note || ''
      // let total_earnings = await this.getTotalEarnings(member_id);
      let total_earnings = await db.sequelize.query(
        "SELECT id, amount as total_amount, amount_type FROM `member_balances` WHERE member_id=? AND amount_type='cash'",
        {
          replacements: [member_id],
          type: QueryTypes.SELECT,
        }
      )

      let modified_total_earnings =
        parseFloat(total_earnings[0].total_amount) + parseFloat(admin_amount)
      let transaction_data = {
        type: parseFloat(admin_amount) > 0 ? 'credited' : 'withdraw',
        amount: parseFloat(admin_amount),
        status: 2,
        note: admin_note,
        created_by: req.user.id,
        member_id: member_id,
        amount_action: 'admin_adjustment',
        completed_at: new Date(),
      }

      let transaction = await MemberTransaction.create(transaction_data, {
        silent: true,
      })
      let balance = await MemberBalance.update(
        { amount: modified_total_earnings },
        {
          where: { id: total_earnings[0].id },
        }
      )
      if (transaction && balance) {
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error(error)
      this.throwCustomError('Unable to get data', 500)
    }
  }

  async add(req, res) {
    let roles = req.user.roles.find((role) => role.id === 1)
    let companies = []
    if (roles) {
      companies = await Company.findAll({
        attributes: ['id', 'name'],
        include: {
          model: CompanyPortal,
          attributes: ['id', 'name', 'domain'],
        },
      })
    }
    let country_list = await Country.getAllCountryList()

    return {
      status: true,
      fields: this.model.fields,
      companies,
      country_list,
    }
  }
}

module.exports = MemberController
