/**
 * @description All General functionalities are here in this Controller.
 * @author Debosmita
 */

const { IpConfiguration, CompanyPortal } = require("../../models/index");

class IpConfigurationController {
  constructor() {}

  async getIpData(req, res) {
    try {
      const site_id = req.header("site_id") || 1;
      const company_id = req.header("company_id") || 1;

      const getIpData = await IpConfiguration.findAll({
        where: { status: "whitelisted" },
        attributes: ["ip"],
        include: ["CompanyPortal", {attributes: ['name']}],
      });
      return res.status(200).json({
        status: true,
        data: getIpData,
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

module.exports = IpConfigurationController;
