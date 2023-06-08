const Controller = require('./Controller');
const {
  PaymentMethodAllowedCountry,
  PaymentMethodExcludedMember,
  Country,
  Member,
  PaymentMethod,
} = require('../../models/index');
const { sequelize } = require('../../models/index');
class PaymentConfigurationController extends Controller {
  constructor() {
    super('PaymentMethod');
    this.list = this.list.bind(this);
    this.add = this.add.bind(this);
    // this.update = this.update.bind(this);
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
    let fields = { ...response.fields };
    // let country_list = await Country.getAllCountryList();

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

    response.fields = fields;
    response.country_list = country_list;
    response.member_list = member_list;
    return response;
  }
  //override save function
  async save(req, res) {
    try {
      req.body.company_portal_id = req.headers.site_id;
      const updated_country_list = req.body.updated_country_list;
      const updated_member_list = req.body.updated_country_list;
      const { error, value } = this.model.validate(req);

      if (error) {
        let message = error.details.map((err) => err.message).join(', ');
        this.throwCustomError(message, 401);
      }
      let response = await super.save(req);
      if (response.result.id) {
        if (updated_country_list.length > 0) {
          let country_data = [];
          country_data = updated_country_list.map((country) => {
            return {
              payment_method_id: response.result.id,
              country_id: country,
            };
          });

          const insert_country = await PaymentMethodAllowedCountry.bulkCreate(
            country_data
          );
        }
        if (updated_member_list.length > 0) {
          let member_data = [];
          member_data = updated_member_list.map((member) => {
            return {
              payment_method_id: response.result.id,
              member_id: member,
            };
          });

          const insert_member = await PaymentMethodExcludedMember.bulkCreate(
            member_data
          );
        }
      }
      return {
        status: true,
        message: 'Payment method added.',
        id: response.result.id,
      };
    } catch (err) {
      this.throwCustomError('Unable to save data', 500);
    }
  }
  //override update function
  async update(req, res) {
    try {
      const { error, value } = this.model.validate(req);

      if (error) {
        let message = error.details.map((err) => err.message).join(', ');
        this.throwCustomError(message, 401);
      }
    } catch (err) {
      this.throwCustomError('Unable to save data', 500);
    }
  }
}

module.exports = PaymentConfigurationController;

// update payment_method_credentials set deleted_at = NULL where id > 0
