const Controller = require('./Controller');
const { Country, Member, PaymentMethod } = require('../../models/index');
const db = require('../../models/index');
const { sequelize } = require('../../models/index');
const queryInterface = sequelize.getQueryInterface();
const { QueryTypes } = require('sequelize');
class PaymentConfigurationController extends Controller {
  constructor() {
    super('PaymentMethod');
    this.list = this.list.bind(this);
    this.add = this.add.bind(this);
    this.update = this.update.bind(this);
    this.save = this.save.bind(this);
    this.insertAllowedCountries = this.insertAllowedCountries.bind(this);
    this.insertExcludedMembers = this.insertExcludedMembers.bind(this);
  }

  //override list function
  async list(req, res) {
    req.query.where = JSON.stringify({
      company_portal_id: req.headers.site_id,
    });
    return await super.list(req);
  }
  //override add function
  async add(req, res) {
    let response = await super.add(req);
    let fields = response.fields;
    let country_list = await Country.getAllCountryList();

    let member_list = await Member.findAll({
      attributes: [
        'id',
        [
          sequelize.fn(
            'concat',
            sequelize.col('first_name'),
            ' ',
            sequelize.col('last_name')
          ),
          'member_name',
        ],
        'username',
      ],
      where: { company_portal_id: req.headers.site_id, status: 'member' },
    });
    return {
      status: true,
      fields,
      data: {
        country_list,
        member_list,
      },
    };
  }
  //override edit function
  async edit(req, res) {
    const site_id = req.header('site_id');
    let response = await super.edit(req);
    let country_list = await Country.findAll({
      attributes: ['id', ['nicename', 'name'], 'phonecode'],
      include: {
        model: PaymentMethod,
        as: 'allowed_countries',
        where: { id: req.params.id },
        required: false,
        attributes: ['id'],
      },
    });

    let member_list = await Member.findAll({
      attributes: [
        'id',
        [
          sequelize.fn(
            'concat',
            sequelize.col('first_name'),
            ' ',
            sequelize.col('last_name')
          ),
          'member_name',
        ],
        'username',
      ],
      where: { company_portal_id: site_id, status: 'member' },
      include: {
        model: PaymentMethod,
        as: 'excluded_members',
        where: { id: req.params.id },
        required: false,
        attributes: ['id'],
      },
    });

    let result = response.result;
    result.setDataValue('country_list', country_list);
    result.setDataValue('member_list', member_list);

    // resp.result.country_list = country_list;
    // resp.result.member_list = member_list;
    console.log(result);
    return {
      status: true,
      result,
      fields: response.fields,
    };
    return response;
  }
  //override save function
  async save(req, res) {
    try {
      req.body.company_portal_id = req.headers.site_id;
      const updated_country_list = req.body.country_list;
      const updated_member_list = req.body.member_list;
      req.body.withdraw_redo_interval =
        req.body.withdraw_redo_interval === ''
          ? null
          : req.body.withdraw_redo_interval;
      const name = req.body.name || '';
      req.body.slug = name.replace(' ', '_').toLowerCase();
      let payment_method_exist = await this.model.findOne({
        attributes: ['id'],
        where: { slug: req.body.slug },
      });
      // console.log(payment_method_exist);
      if (payment_method_exist) {
        this.throwCustomError('This payment method already exist', 500);
      }
      delete req.body.country_list;
      delete req.body.member_list;
      const { error, value } = this.model.validate(req);

      if (error) {
        let message = error.details.map((err) => err.message).join(', ');
        this.throwCustomError(message, 401);
      }
      if (
        req.body.past_withdrawal_options !== '' &&
        req.body.past_withdrawal_count === ''
      )
        this.throwCustomError('Past Withdrawal Count required', 500);

      let response = await super.save(req);
      if (response.result.id) {
        if (updated_country_list.length > 0) {
          await this.insertAllowedCountries(
            updated_country_list,
            response.result.id
          );
        }
        if (updated_member_list.length > 0) {
          await this.insertExcludedMembers(
            updated_member_list,
            response.result.id
          );
        }
      }
      return {
        status: true,
        message: 'Payment method added.',
        id: response.result.id,
      };
    } catch (err) {
      console.log(err);
      this.throwCustomError('Unable to save data', 500);
    }
  }
  //override update function
  async update(req, res) {
    try {
      console.log('==================================================');
      req.body.company_portal_id = req.headers.site_id;
      const updated_country_list = req.body.country_list;
      const updated_member_list = req.body.member_list;
      req.body.withdraw_redo_interval =
        req.body.withdraw_redo_interval === ''
          ? null
          : req.body.withdraw_redo_interval;
      delete req.body.country_list;
      delete req.body.member_list;
      let payment_method = await this.model.findOne({
        where: { id: req.params.id },
      });
      req.body.name = payment_method.name;
      req.body.slug = payment_method.slug;
      const { error, value } = this.model.validate(req);
      if (error) {
        let message = error.details.map((err) => err.message).join(', ');
        this.throwCustomError(message, 401);
      }
      if (req.body.minimum_amount) req.body.fixed_amount = 0;
      if (req.body.fixed_amount) req.body.minimum_amount = 0;
      let response = await super.update(req);
      if (req.params.id) {
        if (updated_country_list.length > 0) {
          //remove existing data
          let country_del = await db.sequelize.query(
            `DELETE FROM allowed_country_payment_method WHERE payment_method_id=?`,
            {
              replacements: [req.params.id],
              type: QueryTypes.DELETE,
            }
          );
          await this.insertAllowedCountries(
            updated_country_list,
            req.params.id
          );
        }
        if (updated_member_list.length > 0) {
          let country_del = await db.sequelize.query(
            `DELETE FROM excluded_member_payment_method WHERE payment_method_id=?`,
            {
              replacements: [req.params.id],
              type: QueryTypes.DELETE,
            }
          );
          await this.insertExcludedMembers(updated_member_list, req.params.id);
        }
      }
      return {
        status: true,
        message: 'Payment method updated.',
      };
    } catch (err) {
      console.log(err);
      this.throwCustomError('Unable to save data', 500);
    }
  }

  async insertAllowedCountries(updated_country_list, payment_method_id) {
    let country_data = [];
    country_data = updated_country_list.map((country) => {
      return {
        payment_method_id: payment_method_id,
        country_id: country,
      };
    });
    console.log('country_data', country_data);
    await queryInterface.bulkInsert(
      'allowed_country_payment_method',
      country_data
    );
  }

  async insertExcludedMembers(updated_member_list, payment_method_id) {
    let member_data = [];
    member_data = updated_member_list.map((member) => {
      return {
        payment_method_id: payment_method_id,
        member_id: member,
      };
    });
    console.log('member_data', member_data);
    await queryInterface.bulkInsert(
      'excluded_member_payment_method',
      member_data
    );
  }
}

module.exports = PaymentConfigurationController;

// update payment_method_credentials set deleted_at = NULL where id > 0
