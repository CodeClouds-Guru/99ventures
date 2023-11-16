const Controller = require("./Controller");
const { Op } = require("sequelize");
class IpLogController extends Controller {
  constructor() {
    super("IpLog");
    this.generateFields = this.generateFields.bind(this);
    this.fieldConfig = {
      'id': 'ID',
      'geo_location': 'Geo Location',
      'ip': 'IP',
      'isp': 'ISP',
      'browser': 'Browser',
      'browser_language': 'Browser Language',
      'fraud_score': 'Fraud Score',
      'tor': 'Tor',
      'vpn': 'VPN',
      'proxy': 'Proxy'
    };
  }
  //get list
  async list(req, res) {
    const options = this.getQueryOptions(req);
    options.attributes = req.query.fields ;
    options.paranoid = false
    const { docs, pages, total } = await this.model.paginate(options);
    return {
      result: { data: docs, pages, total },
      fields: this.generateFields(req.query.fields),
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
}
module.exports = IpLogController;