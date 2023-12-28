const Controller = require('./Controller');
const { Op } = require('sequelize');
const {
  Member,
  NewsReaction,
  MemberNotification,
} = require('../../models/index');
const FileHelper = require('../../helpers/fileHelper');

class NewsController extends Controller {
  constructor() {
    super('News');
    this.save = this.save.bind(this);
    this.update = this.update.bind(this);
    this.memberNotificationOnNewsPublish =
      this.memberNotificationOnNewsPublish.bind(this);
  }

  //overridding save api
  async save(req, res) {
    let request_data = req.body;
    let company_portal_id = req.headers.site_id;
    req.body.company_portal_id = company_portal_id;

    let existingSubject = await this.model.findOne({
      where: { subject: req.body.subject },
      company_portal_id: req.body.company_portal_id,
    });
    if (existingSubject) {
      return {
        status: false,
        message: 'Duplicate subject',
      };
    }

    if (request_data.image_type == 'file' && req.files) {
      let files = [];
      files[0] = req.files.image;
      const fileHelper = new FileHelper(files, 'news', req);
      const file_name = await fileHelper.upload();
      req.body.image = file_name.files[0].filename;
    }
    delete req.body.image_type;
    req.body.slug = req.body.subject.toLowerCase().replaceAll(' ', '-');
    if (request_data.status == 'published') {
      req.body.published_at = new Date();
      this.memberNotificationOnNewsPublish({
        subject: req.body.subject,
        company_portal_id,
      });
    }
    let response = await super.save(req);
    return { status: true, data: response };
  }

  //overridding update api
  async update(req, res) {
    let request_data = req.body;
    let company_portal_id = req.headers.site_id;
    req.body.company_portal_id = company_portal_id;
    let model = await this.model.findByPk(req.params.id);
    if (request_data.image_type == 'file' && req.files) {
      let files = [];
      files[0] = req.files.image;
      const fileHelper = new FileHelper(files, 'news', req);
      const file_name = await fileHelper.upload();
      req.body.image = file_name.files[0].filename;

      let prev_image = model.image;
      if (prev_image && prev_image != '') {
        let file_delete = await fileHelper.deleteFile(
          prev_image.replace(process.env.S3_BUCKET_OBJECT_URL, '')
        );
      }
    } else {
      req.body.image = model.image.replace(
        process.env.S3_BUCKET_OBJECT_URL,
        ''
      );
    }

    if (req.body.subject !== '' && req.body.subject !== model.subject) {
      let existingSubject = await this.model.findOne({
        where: {
          subject: req.body.subject,
          company_portal_id: req.body.company_portal_id,
          id: { [Op.ne]: req.params.id },
        },
      });
      if (existingSubject) {
        return {
          status: false,
          message: 'Duplicate subject',
        };
      }
      req.body.slug = req.body.subject.toLowerCase().replaceAll(' ', '-');
    } else req.body.slug = model.slug;

    if (request_data.status !== 'published') req.body.published_at = null;
    if (request_data.status == 'published') {
      req.body.published_at = new Date();
      this.memberNotificationOnNewsPublish({
        subject: req.body.subject,
        company_portal_id,
      });
    }
    delete req.body.image_type;
    let response = await super.update(req);
    return { status: true, data: response };
  }

  //member notification for news publish
  async memberNotificationOnNewsPublish(news) {
    const all_members = await Member.findAll({
      attributes: ['id'],
      where: { status: 'member' },
      company_portal_id: news.company_portal_id,
    });
    let notification_verbose = 'News published-' + news.subject;
    let notification_action = 'news';

    let notify_obj = all_members.map((member) => {
      return {
        member_id: member.id,
        verbose: notification_verbose,
        action: notification_action,
        is_read: 0,
      };
    });
    let model = await MemberNotification.bulkCreate(notify_obj, {
      ignoreDuplicates: true,
    });
  }
}

module.exports = NewsController;
