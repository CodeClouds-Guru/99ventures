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

class TicketController {
  constructor() {
    this.update = this.update.bind(this);
    this.saveTicketConversations = this.saveTicketConversations.bind(this);
  }

  //update for all type of updation
  async update(req, res) {
    const type = req.body.type || '';
    let change = false;
    // console.log(req.files);
    try {
      switch (type) {
        case 'ticket_chat':
          change = await this.saveTicketConversations(req, res);
          break;
        case 'ticket_status':
          let field_name = req.body.field_name;
          let value = req.body.value;
          let ticket_id = req.body.ticket_id;
          let update = await Ticket.changeStatus(field_name, value, ticket_id);
          break;
        default:
          req.session.flash = { error: 'Request Failed.' };
      }
    } catch (error) {
      console.error(error);
      req.session.flash = { error: 'Unable to save data.' };
    } finally {
      if (change)
        req.session.flash = {
          message: 'Record updated.',
          success_status: true,
        };
    }
  }

  async saveTicketConversations(req, res) {
    let company_portal_id = req.session.company_portal.id;
    req.headers.site_id = company_portal_id;
    let company_id = req.session.company_portal.company_id;
    req.headers.company_id = company_id;

    let value = req.body.ticket_content || '';
    let subject = req.body.ticket_subject || '';
    let ticket_id = req.body.ticket_id || null;
    let member_id = req.session.member.id || null;
    let attachments = req.files ? req.files.ticket_file : null;

    try {
      if (!ticket_id) {
        let savedTicket = await Ticket.create({
          company_portal_id: req.session.company_portal.id,
          member_id: member_id,
          subject: subject,
          status: 'open',
        });
        ticket_id = savedTicket.id;
      }
      let data = {
        ticket_id: ticket_id,
        message: value,
        member_id: member_id,
      };
      let savedTicketConversation = await TicketConversation.create(data);

      if (savedTicketConversation.id > 0 && attachments) {
        let files = [];
        if (attachments.length > 1) files = attachments;
        else files[0] = attachments;
        // console.log('files',files)
        let fileHelper = new FileHelper(
          files,
          'tickets/' + savedTicketConversation.id,
          req
        );
        let file_name = await fileHelper.upload();
        // console.log(file_name);
        let dataFiles = file_name.files.map((values) => {
          return {
            ticket_conversation_id: savedTicketConversation.id,
            file_name: values.filename,
            mime_type: mime.lookup(path.basename(values.filename)),
          };
        });

        let savedfiles = await TicketAttachment.bulkCreate(dataFiles);
      }
      req.session.flash = {
        message: 'Ticket submitted successfully.',
        success_status: true,
      };
    } catch (error) {
      req.session.flash = { error: 'Unable to submit ticket.' };
    } finally {
      res.redirect('back');
    }
  }
}

module.exports = TicketController;
