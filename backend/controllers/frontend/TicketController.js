const Controller = require('../backend/Controller');
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
} = require('../../models/index');

const { Op } = require('sequelize');
const moment = require('moment');
const FileHelper = require('../../helpers/fileHelper');
const mime = require('mime-types');
const path = require('path');

class TicketController extends Controller {
  constructor() {
    super('Ticket');
    this.list = this.list.bind(this);
    this.view = this.view.bind(this);
    this.update = this.update.bind(this);
    this.saveTicketConversations = this.saveTicketConversations.bind(this);
  }

  async list(req, res) {
    var options = super.getQueryOptions(req);
    var option_where = options.where || {};
    var query_where = req.query.where || '{}';
    let company_portal_id = req.session.company_portal.id
    query_where = JSON.parse(query_where);
    options.include = [
      {
        model: Member,
        attributes: ['username'],
      },
    ];
    var new_option = {};
    var and_query = {
      company_portal_id: company_portal_id,
      member_id: req.session.member.id
    //   created_at: {
    //     [Op.between]: query_where.created_at,
    //   },
    };
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
      result.rows[i].setDataValue('username', result.rows[i].Member.username);
    }
    res.json({ results: { data: result.rows, pages, total: result.count } });
  }

  //ticket view
  async view(req, res) {
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
          [TicketConversation, 'created_at', 'DESC'],
          [Member, MemberNote, 'created_at', 'DESC'],
        ];
        options.include = [
          {
            model: TicketConversation,
            attributes: ['message', 'member_id', 'user_id', 'created_at'],
            include: [
              {
                model: TicketAttachment,
                attributes: ['file_name', 'mime_type'],
              },
              {
                model: Member,
                attributes: ['first_name', 'last_name', 'username'],
              },
              {
                model: User,
                attributes: ['first_name', 'last_name', 'alias_name'],
              },
            ],
          },
          {
            model: Member,
            // as: "username",
            attributes: [
              'first_name',
              'last_name',
              'email',
              'status',
              'username',
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
                  {
                    model: Member,
                    attributes: ['first_name', 'last_name', 'username'],
                  },
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
        });

        //all auto responders
        let auto_responders = await AutoResponder.findAll({
          attributes: ['name', 'body'],
        });
        // console.log(auto_responders);
        result.setDataValue('previous_tickets', prev_tickets);
        result.setDataValue('auto_responders', auto_responders);

        return {
          status: true,
          data: result,
        };
      } catch (error) {
        this.throwCustomError('Unable to get data', 500);
      }
    } else {
      this.throwCustomError('Unable to get data', 500);
    }
  }

  //update for all type of updation
  async update(req, res) {
    const type = req.body.type || '';
    let change = false;
    // console.log(req.files);
    try {
      switch (type) {
        case 'ticket_chat':
          change = await this.saveTicketConversations(req);
          break;
        default:
          const errorObj = new Error('Request failed.');
          throw errorObj;
      }
    } catch (error) {
      console.error(error);
      this.throwCustomError('Unable to get data', 500);
    } finally {
      if (change)
        return {
          status: true,
          message: 'Data updated.',
        };
    }
  }

  async saveTicketConversations(req) {
    let value = req.body.ticket_content || '';
    let subject = req.body.ticket_subject || '';
    let ticket_id = req.params.id || null;
    let member_id = req.session.member.id || null;
    let attachments = req.files ? req.files.ticket_file : null;

    try {
        if(member_id){
            if(!ticket_id){
                let savedTicket = await Ticket.create({
                    company_portal_id: req.session.company_portal.id,
                    member_id: member_id,
                    subject: subject
                });
                ticket_id = savedTicket.id
            }
            let data = {
                ticket_id: ticket_id,
                message: value,
            };
            data.member_id = member_id;
            let savedTicketConversation = await TicketConversation.create(data);

            if (savedTicketConversation.id > 0 && attachments) {
                let files = [];
                if (attachments.length > 1) files = attachments;
                else files[0] = attachments;
                let fileHelper = new FileHelper(
                files,
                'tickets/' + savedTicketConversation.id,
                req
                );
                let file_name = await fileHelper.upload();
                console.log(file_name);
                let dataFiles = file_name.files.map((values) => {
                return {
                    ticket_conversation_id: savedTicketConversation.id,
                    file_name: values.filename,
                    mime_type: mime.lookup(path.basename(values.filename)),
                };
                });

                let savedfiles = await TicketAttachment.bulkCreate(dataFiles);
            }
        }
        res.redirect('back')
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TicketController;
