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
  User,
} = require("../../models/index");

const { Op } = require("sequelize");
const moment = require("moment");
const FileHelper = require("../../helpers/fileHelper");
const mime = require("mime-types");
const path = require("path");

class TicketController extends Controller {
  constructor() {
    super("Ticket");
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
    let company_portal_id = req.headers.site_id;
    query_where = JSON.parse(query_where);
    var new_option = {};
    var and_query = {
      company_portal_id: company_portal_id,
      created_at: {
        [Op.between]: query_where.created_at,
      },
    };
    if ("status" in query_where) {
      and_query.status = query_where.status;
    }
    if (Object.keys(query_where).length > 0) {
      new_option[Op.and] = {
        ...option_where,
        ...and_query,
      };
    }
    options.where = new_option;
    options.include = [
      {
        model: Member,
        attributes: ["username"],
      },
    ];

    const { docs, pages, total } = await this.model.paginate(options);
    docs.forEach((element, index) => {
      docs[index].setDataValue("username", element.Member.username);
    });
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
    // console.log(ticket_id);
    if (ticket_id) {
      try {
        let options = {};
        options.attributes = [
          "id",
          "subject",
          "created_at",
          "status",
          "member_id",
          "is_read",
        ];
        options.where = { [Op.and]: { id: ticket_id } };
        options.include = [
          {
            model: TicketConversation,
            attributes: ["message", "member_id", "user_id", "created_at"],
            include: [
              {
                model: TicketAttachment,
                attributes: ["file_name", "mime_type"],
              },
              {
                model: Member,
                attributes: ["first_name", "last_name", "username"],
              },
              {
                model: User,
                attributes: ["first_name", "last_name", "username"],
              },
            ],
          },
          {
            model: Member,
            // as: "username",
            attributes: [
              "first_name",
              "last_name",
              "email",
              "status",
              "username",
            ],
            include: [
              {
                model: MemberNote,
                attributes: [
                  "user_id",
                  "member_id",
                  "previous_status",
                  "current_status",
                  "note",
                  "created_at",
                ],
                include: [
                  {
                    model: Member,
                    attributes: ["first_name", "last_name", "username"],
                  },
                  {
                    model: User,
                    attributes: ["first_name", "last_name", "username"],
                  },
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
        result.Member.setDataValue("total_earnings", 0);
        // console.log(result);

        //previous tickets
        let prev_tickets = await Ticket.findAll({
          attributes: ["subject", "status", "is_read", "created_at"],
          where: {
            [Op.and]: { member_id: result.member_id },
            id: { [Op.ne]: ticket_id },
          },
          // include: {
          //   model: TicketConversation,
          //   attributes: ["message", "member_id", "user_id", "created_at"],
          // },
        });

        //all auto responders
        let auto_responders = await AutoResponder.findAll({
          attributes: ["name", "body"],
        });
        // console.log(auto_responders);
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
  async update(req, res) {
    console.log(req);
    const value = req.body.value || "";
    const field_name = req.body.field_name || "";
    const ticket_id = req.body.id || null;
    const member_id = req.body.member_id || null;
    // const user_id = req.body.user_id || null;
    // const attachments = req.files ? req.files.attachments : [];
    const type = req.body.type || "";
    const notes = req.body.member_notes || null;

    let change = false;
    // console.log(req.files);
    try {
      switch (type) {
        case "is_read":
          change = await this.changeStatus(value, field_name, ticket_id);
          break;
        case "ticket_status":
          change = await this.changeStatus(value, field_name, ticket_id);
          break;
        case "member_status":
          let member = await Member.findOne({
            attributes: ["status"],
            where: { id: member_id },
          });
          // console.log("-----------------------member", member);
          change = await Member.changeStatus(field_name, value, member_id);
          if (notes !== null) {
            let data = {
              user_id: req.user.id,
              member_id: member_id,
              previous_status: member.status,
              current_status: value,
              note: notes,
            };

            change = await MemberNote.create(data);
          }
          break;
        case "ticket_chat":
          change = await this.saveTicketConversations(req);
          break;
        default:
          const errorObj = new Error("Request failed.");
          throw errorObj;
      }
    } catch (error) {
      this.throwCustomError("Unable to get data", 500);
    } finally {
      if (change)
        return {
          status: true,
          message: "Data updated.",
        };
    }
  }

  // //update for all type of updation

  async changeStatus(value, field_name, ticket_id) {
    // console.log(value, field_name, ticket_id, "--------------");
    try {
      let update = await Ticket.changeStatus(field_name, value, ticket_id);
      // console.log(update);
      if (update > 0) return true;
    } catch (error) {
      throw error;
    }
  }

  async saveTicketConversations(req) {
    const value = req.body.value || "";
    const field_name = req.body.field_name || "";
    const ticket_id = req.body.id || null;
    const member_id = req.body.member_id || null;
    const user_id = req.body.user_id || null;
    const attachments = req.files ? req.files.attachments : [];

    console.log(req, "--------------");
    try {
      const data = {
        ticket_id: ticket_id,
        message: value,
      };
      if (member_id !== null) data.member_id = member_id;
      if (user_id !== null) data.user_id = user_id;

      let savedTicketConversation = await TicketConversation.create(data);
console.log('---------------------TicketConversation',savedTicketConversation)
console.log('---------------------attachments',attachments)
      if (savedTicketConversation.id > 0 && attachments) {
        let files = [];
        if (attachments.length > 1) files = attachments;
        else files[0] = attachments;
        const fileHelper = new FileHelper(files, "tickets/" + savedTicketConversation.id, req);
        const file_name = await fileHelper.upload();

        const dataFiles = file_name.files.map((values) => {
          return {
            ticket_conversation_id: savedTicketConversation.id,
            file_name: values.filename.replace(/ /g, "_"),
            mime_type: mime.lookup(path.basename(values.filename)),
          };
        });

        let savedfiles = await TicketAttachment.bulkCreate(dataFiles);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TicketController;
