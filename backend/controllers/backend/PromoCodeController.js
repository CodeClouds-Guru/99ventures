const Controller = require('./Controller');

class PromoCodeController extends Controller {
  constructor() {
    super('PromoCode');
  }
  //override save function
  async save(req, res) {
    req.body.company_portal_id = req.headers.site_id;
    req.body.slug = req.body.code.replace(' ', '_').toLowerCase();

    //unique code checking
    let check_code = await this.model.findOne({
      where: { slug: req.body.slug, company_portal_id: req.headers.site_id },
    });
    if (check_code) {
      this.throwCustomError('Slug already in use.', 409);
    }
    let response = await super.save(req);
    return {
      status: true,
      message: 'Promo code added.',
      id: response.result.id,
    };
  }
  //override update function
  async update(req, res) {
    req.body.company_portal_id = req.headers.site_id;
    req.body.slug = req.body.code.replace(' ', '_').toLowerCase();

    //unique code checking
    let check_code = await this.model.findOne({
      where: {
        slug: req.body.slug,
        company_portal_id: req.headers.site_id,
        id: { [Op.ne]: req.params.id },
      },
    });
    if (check_code) {
      this.throwCustomError('Slug already in use.', 409);
    }
    let response = await super.update(req);
    return {
      status: true,
      message: 'Promo code updated.',
    };
  }
}

module.exports = PromoCodeController;
