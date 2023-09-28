const Controller = require('./Controller');
const util = require('util');
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
  MemberNotification,
} = require('../../models/index');

const { Op, QueryTypes } = require('sequelize');
const moment = require('moment');
const FileHelper = require('../../helpers/fileHelper');
const mime = require('mime-types');
const path = require('path');

class TicketController extends Controller {
  constructor() {
    super('Ticket');
    // this.changeStatus = this.changeStatus.bind(this);
  }

  async list(req, res) {
    var options = super.getQueryOptions(req);
    var option_where = options.where || {};
    var query_where = req.query.where || '{}';
    let company_portal_id = req.headers.site_id;
    query_where = JSON.parse(query_where);
    options.include = [
      {
        model: Member,
        attributes: ['username'],
        paranoid: false,
      },
    ];
    var new_option = {};
    var and_query = {
      company_portal_id: company_portal_id,
      updated_at: {
        [Op.between]: query_where.created_at,
      },
    };
    delete option_where.created_at;
    if ('status' in query_where) {
      and_query.status = query_where.status;
    }
    if (Object.keys(query_where).length > 0) {
      if (Op.and in option_where) {
        new_option[Op.and] = {
          ...option_where[Op.and],
          ...and_query,
        };
      } else {
        new_option[Op.and] = {
          ...option_where,
          ...and_query,
        };
      }
    }
    options.where = new_option;
    let page = req.query.page || 1;
    let limit = parseInt(req.query.show) || 10; // per page record
    let offset = (page - 1) * limit;
    options.limit = limit;
    options.offset = offset;
    options.subQuery = false;

    let result = await this.model.findAndCountAll(options);
    let pages = Math.ceil(result.count / limit);
    for (let i = 0; i < result.rows.length; i++) {
      // console.log(
      //   util.inspect(result.rows[i], {
      //     showHidden: false,
      //     depth: null,
      //     colors: true,
      //   })
      // );
      if (result.rows[i].Member)
        result.rows[i].setDataValue(
          'username',
          result.rows[i].Member.username || ''
        );
      else result.rows[i].setDataValue('username', '');
    }

    return {
      result: { data: result.rows, pages, total: result.count },
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
          'id',
          'subject',
          'created_at',
          'status',
          'member_id',
          'is_read',
        ];
        options.where = { [Op.and]: { id: ticket_id } };
        options.order = [
          [TicketConversation, 'created_at', 'ASC'],
          [Member, MemberNote, 'created_at', 'DESC'],
        ];
        options.include = [
          {
            model: TicketConversation,
            attributes: ['id', 'message', 'member_id', 'user_id', 'created_at'],
            include: [
              {
                model: TicketAttachment,
                attributes: ['file_name', 'mime_type'],
              },
              {
                model: Member,
                paranoid: false,
                attributes: [
                  'first_name',
                  'last_name',
                  'username',
                  'id',
                  'deleted_at',
                ],
              },
              {
                model: User,
                attributes: ['first_name', 'last_name', 'alias_name'],
              },
            ],
          },
          {
            model: Member,
            paranoid: false,
            // as: "username",
            attributes: [
              'first_name',
              'last_name',
              'email',
              'status',
              'username',
              'deleted_at',
            ],
            include: [
              {
                model: MemberNote,

                attributes: [
                  'user_id',
                  'member_id',
                  'previous_status',
                  'current_status',
                  'note',
                  'created_at',
                  'id',
                ],
                include: [
                  /*{
                    model: Member,
                    attributes: ['first_name', 'last_name', 'username'],
                  },*/
                  {
                    model: User,
                    attributes: ['first_name', 'last_name', 'alias_name'],
                  },
                ],
              },
              {
                model: MembershipTier,
                attributes: ['name'],
              },
            ],
          },
        ];

        //final query to get ticket details
        let result = await Ticket.findOne(options);
        result.Member.setDataValue('total_earnings', 0);
        // console.log(result);

        //previous tickets
        let prev_tickets = await Ticket.findAll({
          attributes: ['subject', 'status', 'is_read', 'created_at', 'id'],
          where: {
            [Op.and]: { member_id: result.member_id },
            id: { [Op.ne]: ticket_id },
          },
          // include: {
          //   model: TicketConversation,
          //   attributes: ["message", "member_id", "user_id", "created_at"],
          // },
        });

        //Count Opened Tickets
        let count_opened_tkt = await sequelize.query(
          'SELECT COUNT(id) AS total_ticket FROM `tickets` WHERE status = ? AND deleted_at IS NULL',
          { replacements: ['open'], type: QueryTypes.SELECT }
        );

        //all auto responders
        let auto_responders = await AutoResponder.findAll({
          attributes: ['name', 'body'],
        });
        // console.log(auto_responders);
        result.setDataValue('previous_tickets', prev_tickets);
        result.setDataValue('auto_responders', auto_responders);
        result.setDataValue('opended_ticket', count_opened_tkt[0].total_ticket);

        return {
          status: true,
          data: result,
        };
      } catch (error) {
        console.error(error);
        this.throwCustomError('Unable to get data', 500);
      }
    } else {
      this.throwCustomError('Unable to get data', 500);
    }
  }

  //update for all type of updation
  async update(req, res) {
    const member_id = req.body.member_id || null;
    // const user_id = req.body.user_id || null;
    // const attachments = req.files ? req.files.attachments : [];
    const type = req.body.type || '';

    let change = false;
    // console.log(req.files);
    try {
      switch (type) {
        case 'is_read':
          change = await this.changeStatus(req);
          break;
        case 'ticket_status':
          change = await this.changeStatus(req);
          break;
        case 'member_status':
          // console.log("-----------------------member", member);
          change = await Member.changeStatus(req);
          break;
        case 'ticket_chat':
          change = await this.saveTicketConversations(req);
          break;
        case 'ticket_chat_update':
          change = await this.updateTicketConversations(req);
          break;
        case 'ticket_chat_delete':
          change = await this.deleteTicketConversations(req);
          break;
        default:
          const errorObj = new Error('Request failed.');
          throw errorObj;
      }
    } catch (error) {
      console.error(error);
      this.throwCustomError('Unable to get data', 500);
    } finally {
      return {
        status: true,
        message: 'Data updated.',
      };
    }
  }

  // //update for all type of updation

  async changeStatus(req) {
    try {
      let field_name = req.body.field_name;
      let value = req.body.value;
      let ticket_id = req.body.id;
      let update = await Ticket.changeStatus(field_name, value, ticket_id);
      // console.log(update);
      if (update > 0) return true;
    } catch (error) {
      throw error;
    }
  }

  async saveTicketConversations(req) {
    const value = req.body.value || '';
    const field_name = req.body.field_name || '';
    const ticket_id = req.body.id || null;
    const member_id = req.body.member_id || null;
    const user_id = req.body.user_id || null;
    const attachments = req.files ? req.files.attachments : null;

    try {
      const data = {
        ticket_id: ticket_id,
        message: value,
      };
      if (member_id !== null) data.member_id = member_id;
      if (user_id !== null) data.user_id = user_id;

      let savedTicketConversation = await TicketConversation.create(data);
      // console.log(user_id);
      if (user_id) {
        let ticket = await Ticket.findOne({ where: { id: ticket_id } });

        await MemberNotification.addMemberNotification({
          member_id: ticket.member_id,
          verbose:
            'You have a new response on your ticket, subject : ' +
            ticket.subject,
          action: 'ticket_reply',
        });
      }
      if (savedTicketConversation.id > 0 && attachments) {
        let files = [];
        if (attachments.length > 1) files = attachments;
        else files[0] = attachments;
        const fileHelper = new FileHelper(
          files,
          'tickets/' + savedTicketConversation.id,
          req
        );
        const file_name = await fileHelper.upload();
        // console.log(file_name);
        const dataFiles = file_name.files.map((values) => {
          return {
            ticket_conversation_id: savedTicketConversation.id,
            file_name: values.filename,
            mime_type: mime.lookup(path.basename(values.filename)),
          };
        });

        let savedfiles = await TicketAttachment.bulkCreate(dataFiles);
      }
      req.body.field_name = 'status';
      req.body.value = 'pending';
      await this.changeStatus(req);
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete Ticket Attachment using CRON
   */
  async removeAttachments() {
    try {
      await TicketAttachment.destroy({
        where: {
          created_at: {
            [Op.lt]: new Date(new Date().setDate(new Date().getDate() - 30)), // 30days before
          },
        },
        //force: true
      });
    } catch (error) {
      const logger = require('../../helpers/Logger')(`cron.log`);
      logger.error(error);
    } finally {
      return {
        message: 'Success',
      };
    }
  }

  async updateTicketConversations(req) {
    const value = req.body.value || '';
    const field_name = req.body.field_name || '';
    const ticket_id = req.body.id || null;
    const member_id = req.body.member_id || null;
    const user_id = req.body.user_id || null;
    const ticket_conversation_id = req.body.ticket_conversation_id || null;
    const attachments = req.files ? req.files.attachments : null;

    try {
      // const data = {
      //   ticket_id: ticket_id,
      //   message: value,
      // };
      // if (member_id !== null) data.member_id = member_id;
      // if (user_id !== null) data.user_id = user_id;
      let ticket_conversation = await TicketConversation.update(
        { message: value },
        {
          where: { id: ticket_conversation_id },
        }
      );
      // let savedTicketConversation = await TicketConversation.create(data);
      // console.log(user_id);
      // if (user_id) {
      //   let ticket = await Ticket.findOne({ where: { id: ticket_id } });

      //   await MemberNotification.addMemberNotification({
      //     member_id: ticket.member_id,
      //     verbose:
      //       'You have a new response on your ticket, subject : ' +
      //       ticket.subject,
      //     action: 'ticket_reply',
      //   });
      // }
      await TicketAttachment.destroy({
        where: {
          ticket_conversation_id: ticket_conversation_id,
        },
        //force: true
      });
      if (ticket_conversation_id && attachments) {
        let files = [];
        if (attachments.length > 1) files = attachments;
        else files[0] = attachments;
        const fileHelper = new FileHelper(
          files,
          'tickets/' + ticket_conversation_id,
          req
        );
        const file_name = await fileHelper.upload();
        // console.log(file_name);
        const dataFiles = file_name.files.map((values) => {
          return {
            ticket_conversation_id: ticket_conversation_id,
            file_name: values.filename,
            mime_type: mime.lookup(path.basename(values.filename)),
          };
        });

        let savedfiles = await TicketAttachment.bulkCreate(dataFiles);
      }
      req.body.field_name = 'status';
      req.body.value = 'pending';
      await this.changeStatus(req);
      return true;
    } catch (error) {
      throw error;
    }
  }
  async deleteTicketConversations(req) {
    try {
      const ticket_conversation_id = req.body.ticket_conversation_id || null;
      let resp = await TicketConversation.destroy({
        where: { id: ticket_conversation_id },
      });
      await TicketAttachment.destroy({
        where: {
          ticket_conversation_id: ticket_conversation_id,
        },
        //force: true
      });
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TicketController;
