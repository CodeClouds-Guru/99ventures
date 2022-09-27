const Controller = require("./Controller");
const { Ticket, sequelize } = require("../../models/index");

const { Op } = require("sequelize");

class TicketController extends Controller {
  constructor() {
    super("Ticket");
  }

  async list(req, res) {
    const options = this.getQueryOptions(req);
    let company_id = req.headers.company_portal_id;
    options.include = [
      {
        all: true,
        nested: ["id", "action"],
      },
    ];
    let page = req.query.page || 1;
    let limit = parseInt(req.query.show) || 10; // per page record
    let offset = (page - 1) * limit;
    options.limit = limit;
    options.offset = offset;
    let result = await this.model.findAndCountAll(options);
    let pages = Math.ceil(result.count / limit);
    return {
      result: { data: result.rows, pages, total: result.count },
      fields: this.model.fields,
    };
  }

  async view(req, res) {}
}

module.exports = TicketController;
