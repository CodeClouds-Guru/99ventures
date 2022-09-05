const Controller = require("./Controller");
const {
  CompanyPortal,
  PaymentMethodCredential,
  PaymentMethod
} = require("../../models/index");

class PaymentMethodController extends Controller {
  constructor() {
    super("PaymentMethod");
    this.list = this.list.bind(this);
    this.update = this.update.bind(this);
  }

  async list(req, res) {
    try {
      const site_id = req.header("site_id") || 1;
      const company_id = req.header("company_id") || 1;
      // let payment_method = await PaymentMethodCredential.findAll();
      let payment_method_list = await PaymentMethod.findAll({
        attributes: ["name", "slug"],
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
        // payment_method,
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
      const update_credentials = req.body.credentials || [];
      let data = [];
      data = update_credentials.map((values) => {
        return {
          value: values.value,
          id: values.id,
        };
      });
      console.log(data);
      const insertNewData = PaymentMethodCredential.bulkCreate(data, {
        updateOnDuplicate: ["id", "value"],
        ignoreDuplicates: true,
      });
      if (insertNewData) {
        return res.status(200).json({
          status: true,
          message: "Data Saved",
        });
      } else {
        return res.status(500).json({
          status: false,
          errors: "Unable to save data",
        });
      }
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




// update payment_method_credentials set deleted_at = NULL where id > 0