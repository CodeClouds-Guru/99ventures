const Controller = require("./Controller");
const {
  CompanyPortal,
  PaymentMethodCredential,
  PaymentMethod,
} = require("../../models/index");
const bcrypt = require("bcryptjs");
class PaymentConfigurationController extends Controller {
  constructor() {
    super("PaymentMethod");
    this.list = this.list.bind(this);
    this.update = this.update.bind(this);
  }

  async list(req, res) {
    try {
      const site_id = req.header("site_id") || 1;
      const company_id = req.header("company_id") || 1;
      const mask_auth = req.query.auth || false;
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
      // console.log('==================',typeof mask_auth, mask_auth)
      if (mask_auth === true || mask_auth === "true") {
        return {
          status: true,
          payment_method_list,
        };
      } else {
        // if (mask_auth === "false" || mask_auth === false) {
        for (let i = 0; i < payment_method_list.length; i++) {
          for (let j = 0; j < payment_method_list[i].credentials.length; j++) {
            let cred = payment_method_list[i].credentials[j].value;

            let count = cred.length - (cred.length - 4);
            let count1 = cred.length - 4;
            let str = "";
            while (count1 >= 0) {
              str += "X";
              count1--;
            }
            payment_method_list[i].credentials[j].value =
              cred.substring(0, count) + str;
          }
        }
        return {
          status: true,
          data: payment_method_list,
        };
      }
    } catch (err) {
      this.throwCustomError('Unable to get data', 500);
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
      // console.log(data);
      const insertNewData = await PaymentMethodCredential.bulkCreate(data, {
        updateOnDuplicate: ["id", "value"],
        ignoreDuplicates: true,
      });
      if (insertNewData) {
        return{
          status: true,
          message: "Data Saved",
        }
      } else {
        this.throwCustomError('Unable to save data', 500);
      }
    } catch (err) {
      this.throwCustomError('Unable to save data', 500);
    }
  }
}

module.exports = PaymentConfigurationController;

// update payment_method_credentials set deleted_at = NULL where id > 0
