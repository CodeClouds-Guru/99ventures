const Controller = require('./Controller')
const { Op } = require("sequelize");
class LayoutController extends Controller {
  constructor() {
    super('Page')
  }
  //override save function
  async save(req, res) {
    req.body.company_portal_id = req.headers.site_id;
    //unique code checking
    let check_code = await this.model.findOne({
      where: { slug: req.body.slug },
    });
    if (check_code) {
      this.throwCustomError("Slug already in use.", 409);
    }
    let response = await super.save(req);
    return {
      status: true,
      message: "Page added.",
      id: response.result.id,
    };
  }
  //override update function
  async update(req, res) {
    req.body.company_portal_id = req.headers.site_id;
    //unique code checking
    let check_code = await this.model.findOne({
      where: { slug: req.body.slug,id: { [Op.ne]: req.params.id } },
    });
    if (check_code) {
      this.throwCustomError("Slug already in use.", 409);
    }
    let response = await super.update(req);
    return {
      status: true,
      message: "Page updated."
    };
  }
  //override delete function
  async delete(req, res) {
    let response = await super.delete(req);
    return {
      status: true,
      message: "Page deleted.",
    };
  }
}

module.exports = LayoutController