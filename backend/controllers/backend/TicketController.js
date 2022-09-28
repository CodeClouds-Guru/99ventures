const Controller = require("./Controller");
const {
  Ticket,
  TicketAttachment,
  TicketConversation,
  Member,
  sequelize,
} = require("../../models/index");

const { Op } = require("sequelize");
const moment = require("moment");

class TicketController {
  constructor() {
    this.isRead = this.isRead.bind(this);

  }

  async list(req, res) {
    //header data
    let company_id = req.headers.company_id;
    let company_portal_id = req.headers.site_id;
    //query param data
    let sort_field = req.query.sort || "id";
    let sort_order = req.query.sort_order || "desc";
    let limit = parseInt(req.query.show) || 10; // per page record
    let page = req.query.page || 1;
    let date_range = req.query.date_range || null;
    let status = req.query.status || null;
    try {
      let start_date = moment("2022-09-20").startOf("day").format();
      let end_date = moment("2022-09-26").endOf("day").format();
      // console.log(start_date, "=============================", end_date);

      let options = {};

      let offset = (page - 1) * limit;
      options.attributes = ["subject", "created_at", "status"];
      options.limit = limit;
      options.offset = offset;
      options.where = { [Op.and]: { company_portal_id: company_portal_id } };
      options.where = {
        ...options.where,
        ...(status !== null && { [Op.and]: { status: status } }),
      };
      options.where = {
        ...options.where,
        ...(date_range !== null && {
          created_at: {
            [Op.between]: [start_date, end_date],
          },
        }),
      };

      options.include = [
        {
          model: Member,
          as: "username",
          attributes: ["first_name", "last_name", "email", "status"],
        },
      ];
      options.order = [[sort_field, sort_order]];

      let result = await Ticket.findAndCountAll(options);
      let pages = Math.ceil(result.count / limit);

      for (let i = 0; i < result.rows.length; i++) {
        result.rows[i].setDataValue(
          "username",
          result.rows[i].username.first_name +
            " " +
            result.rows[i].username.first_name
        );
      }
      var unread_ticket_count = await Ticket.getTicketCount(
        0,
        company_portal_id
      );
      // console.log("unread_ticket_count", unread_ticket_count);
      return {
        result: {
          data: result.rows,
          pages,
          total: result.count,
          unread: unread_ticket_count,
        },
        fields: Ticket.fields,
      };
    } catch (error) {
      throw error;
    }
  }

  async view(req, res) {}

  async isRead(req, res) {
    let status = req.query.status || null;
    let ticket_id = req.query.id || null;
    console.log(status,ticket_id,'--------------')
    try {
      if (status !== null && ticket_id !== null) {
        var is_read = await Ticket.changeIsReadStatus(status, ticket_id);
        res
          .status(200)
          .json(
            { 
            status: false, message: "Data updated successfully" 
          });
      } else {
        res.status(401).json({ status: false, errors: "Data not updated" });
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TicketController;
