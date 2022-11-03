const Controller = require('./Controller')
const { Op } = require("sequelize");
class ComponentController extends Controller {
  constructor() {
    super('Component')
  }
  //override save function
  async save(req, res) {
    req.body.company_portal_id = req.headers.site_id;
    
    let response = await super.save(req);
    return {
      status: true,
      message: "Component added.",
      id: response.result.id,
    };
  }
  //override update function
  async update(req, res) {
    req.body.company_portal_id = req.headers.site_id;
    
    let response = await super.update(req);
    return {
      status: true,
      message: "Component updated."
    };
  }
  //override delete function
  async delete(req, res) {
    let response = await super.delete(req);
    return {
      status: true,
      message: "Component deleted.",
    };
  }
}

module.exports = ComponentController