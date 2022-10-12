const Controller = require("./Controller");
const {
  Ticket,
  TicketAttachment,
  TicketConversation,
  Member,
  MemberNote,
  MembershipTier,
  AutoResponder,
  sequelize,
} = require("../../models/index");

const { Op } = require("sequelize");
const moment = require("moment");

class TicketController extends Controller {
  constructor() {
    super('Ticket');
    // this.changeStatus = this.changeStatus.bind(this);
  }


  /**
  //ticket listing
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
      options.attributes = ["id", "subject", "created_at", "status"];
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
          // as: "username",
          attributes: ["first_name", "last_name", "email", "status"],
        },
      ];
      options.order = [[sort_field, sort_order]];

      let result = await Ticket.findAndCountAll(options);
      let pages = Math.ceil(result.count / limit);

      for (let i = 0; i < result.rows.length; i++) {
        result.rows[i].setDataValue(
          "username",
          result.rows[i].Member.first_name +
            " " +
            result.rows[i].Member.first_name
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
      this.throwCustomError("Unable to get data", 500);
    }
  }
  */

  async list(req, res) {
    var options = super.getQueryOptions(req);
    var option_where = options.where || {};
    var query_where = req.query.where || "{}";
    let company_portal_id = req.headers.site_id
    query_where = JSON.parse(query_where);
    var new_option = {}
    var and_query = {
      company_portal_id: company_portal_id,
      created_at: {
        [Op.between] : query_where.created_at
      }
    }
    if('status' in query_where) {
      and_query.status = query_where.status
    }
    if(Object.keys(query_where).length > 0) {
      new_option[Op.and] = {
        ...option_where,
        ...and_query
      }
    }
    options.where = new_option;
    console.log('options', options);

    const { docs, pages, total } = await this.model.paginate(options);
    return {
      result: { data: docs, pages, total },
      fields: this.model.fields,
    };
  }


  //ticket view
  async view(req, res) {
    //header data
    let company_id = req.headers.company_id;
    let company_portal_id = req.headers.site_id;
    let ticket_id = req.params.id || null;

    if (ticket_id) {
      try {
        let options = {};
        options.attributes = [
          "id",
          "subject",
          "created_at",
          "status",
          "member_id",
        ];
        options.where = { [Op.and]: { id: ticket_id } };
        options.include = [
          {
            model: TicketConversation,
            attributes: ["message", "member_id", "user_id"],
            include: {
              model: TicketAttachment,
              attributes: ["file_name", "mime_type"],
            },
          },
          {
            model: Member,
            // as: "username",
            attributes: ["first_name", "last_name", "email", "status"],
            include: [
              {
                model: MemberNote,
                attributes: [
                  "user_id",
                  "member_id",
                  "previous_status",
                  "current_status",
                  "note",
                ],
              },
              {
                model: MembershipTier,
                attributes: ["name"],
              },
            ],
          },
        ];
        //final query to get ticket details
        let result = await Ticket.findOne(options);
        // console.log(result);

        //previous tickets
        let prev_tickets = await Ticket.findAll({
          attributes: ["subject", "status", "is_read"],
          where: {
            [Op.and]: { member_id: result.member_id },
            id: { [Op.ne]: ticket_id },
          },
          include: {
            model: TicketConversation,
            attributes: ["message", "member_id", "user_id"],
          },
        });

        //all auto responders
        let auto_responders = await AutoResponder.findAll({
          attributes: ["name", "body"],
        });
        console.log(auto_responders);
        result.setDataValue("previous_tickets", prev_tickets);
        result.setDataValue("auto_responders", auto_responders);

        return {
          status: true,
          data: result,
        };
      } catch (error) {
        this.throwCustomError("Unable to get data", 500);
      }
    } else {
      this.throwCustomError("Unable to get data", 500);
    }
  }

  //update for all type of updation
  // async update(req, res) {
  //   let value = req.body.value || null;
  //   let field_name = req.body.field_name || null;
  //   let ticket_id = req.body.id || null;

  //   const type = req.body.type || "";
  //   let change = false;
  //   switch (type) {
  //     case "is_read":
  //       change = await this.changeStatus(value, field_name, ticket_id);
  //       break;
  //     case "ticket_status":
  //     case "member_status":
  //       console.log("Mangoes and papayas are $2.79 a pound.");
  //       // expected output: "Mangoes and papayas are $2.79 a pound."
  //       break;
  //     default:
  //       this.throwCustomError("Unable to get data", 500);
  //   }
  //   if (change)
  //     return {
  //       status: true,
  //       message: "Email template updated.",
  //     };
  // }

  // //update for all type of updation
  // async save(req, res) {}

  // async changeStatus(value, field_name, ticket_id) {
  //   console.log(value, field_name, ticket_id, "--------------");
  //   try {
  //     let update = await Ticket.changeIsReadStatus(
  //       field_name,
  //       value,
  //       ticket_id
  //     );
  //     console.log(update);
  //     if (update > 0) return true;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}

module.exports = TicketController;
