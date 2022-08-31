const Controller = require("./Controller");
const {
  CompanyPortal,
  PaymentMethodCredential,
} = require("../../models/index");

class PaymentMethodController extends Controller {
  constructor() {
    super("PaymentMethod");
    this.list = this.list.bind(this);
  }

  async list(req, res) {
    try {
      const site_id = req.header("site_id") || 1;
      const company_id = req.header("company_id") || 1;

      let payment_method_list = await this.model.findAll({
        attributes: [ "name", "slug"],
        include: {
          model: PaymentMethodCredential,
          required: false,
          as: "credentials",
          attributes: ["id", "name", "slug", "value"],
          where: {
            company_portal_id: site_id,
          },
        },
      });

      return res.status(200).json({
        status: true,
        payment_method_list,
      });
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({
        status: false,
        errors: "Unable to get data",
      });
    }
  }
  async update(req, res) {
    try {
      return res.status(200).json({
        status: true,
        message: "hello update",
      });
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({
        status: false,
        errors: "Unable to get data",
      });
    }
  }
}

module.exports = PaymentMethodController;
