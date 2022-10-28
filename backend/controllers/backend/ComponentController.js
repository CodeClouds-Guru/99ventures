const Controller = require('./Controller')
const { Op } = require("sequelize");
class ComponentController extends Controller {
  constructor() {
    super('Component')
  }
  //override save function
  async save(req, res) {
    req.body.company_portal_id = req.headers.site_id;
    //unique code checking
    let check_code = await this.model.findOne({
      where: { code: req.body.code },
    });
    if (check_code) {
      this.throwCustomError("Code already in use.", 409);
    }
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
    //unique code checking
    let check_code = await this.model.findOne({
      where: { code: req.body.code,id: { [Op.ne]: req.params.id } },
    });
    if (check_code) {
      this.throwCustomError("Code already in use.", 409);
    }
    let response = await super.update(req);
    return {
      status: true,
      message: "Component updated."
    };
  }
  //override delete function
  async delete(req, res) {
    let response = await super.delete(req);
  }
}

module.exports = ComponentController