const Controller = require('./Controller');
const { Op } = require('sequelize');
const {
  Member,
  NewsReaction,
  MemberNotification,
  CompanyPortal,
} = require('../../models/index');
const FileHelper = require('../../helpers/fileHelper');

class NewsController extends Controller {
  constructor() {
    super('News');
    this.save = this.save.bind(this);
    this.update = this.update.bind(this);
    this.list = this.list.bind(this);
    this.edit = this.edit.bind(this);
    this.view = this.view.bind(this);
    this.memberNotificationOnNewsPublish =
      this.memberNotificationOnNewsPublish.bind(this);
  }

  //overridding save api
  async save(req, res) {
    let request_data = req.body;
    let company_portal_id = req.headers.site_id;
    req.body.company_portal_id = company_portal_id;

    let existingSubject = await this.model.findOne({
      where: { slug: req.body.slug },
      company_portal_id: req.body.company_portal_id,
    });
    if (existingSubject) {
      return {
        status: false,
        message: 'Duplicate slug',
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
    // req.body.slug = req.body.subject.toLowerCase().replaceAll(' ', '-');
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
    model = JSON.parse(JSON.stringify(model));
    // console.log('req', req);
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
      req.body.image =
        req.body.image !== 'null'
          ? req.body.image
          : model.image.replaceAll(process.env.S3_BUCKET_OBJECT_URL, '');
    }

    if (req.body.slug !== '' && req.body.slug !== model.slug) {
      let existingSubject = await this.model.findOne({
        where: {
          slug: req.body.slug,
          company_portal_id: req.body.company_portal_id,
          id: { [Op.ne]: req.params.id },
        },
      });
      if (existingSubject) {
        return {
          status: false,
          message: 'Duplicate slug',
        };
      }
      // req.body.slug = req.body.subject.toLowerCase().replaceAll(' ', '-');
    }
    // else req.body.slug = model.slug;

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

  //overridding list api
  async list(req, res) {
    var options = super.getQueryOptions(req);
    options.include = {
      model: NewsReaction,
      include: {
        model: Member,
        attributes: ['id', 'username'],
      },
      require: false,
    };
    // options.logging = console.log;
    // console.log(options);
    const { docs, pages, total } = await this.model.paginate(options);
    docs.forEach(async function (record, key) {
      record.dataValues.likes_count = record.dataValues.NewsReactions.length;
    });
    return {
      result: { data: docs, pages, total },
      fields: {
        ...this.model.fields,
        // Added this object to show the likes Count in the table
        likes: {
          field_name: 'likes',
          db_name: 'likes',
          type: 'text',
          placeholder: 'Likes',
          listing: true,
          show_in_form: false,
          sort: false,
          required: false,
          value: '',
          width: '50',
          searchable: false,
        },
        // Added this object to show the likes Report in the table
        report: {
          field_name: 'report',
          db_name: 'report',
          type: 'text',
          placeholder: 'Report',
          listing: true,
          show_in_form: false,
          sort: false,
          required: false,
          value: '',
          width: '50',
          searchable: false,
        },
      },
    };
  }

  //override edit function
  async edit(req, res) {
    let model = await this.model.findOne({ where: { id: req.params.id } });

    let fields = this.model.fields;
    model = JSON.parse(JSON.stringify(model));
    const imageURL =
      process.env.CLIENT_API_PUBLIC_URL ||
      'http://127.0.0.1:4000' + '/images/no-img.jpg';
    if (model.image.includes(imageURL)) {
      model.image = '';
    }
    return { result: model, fields, company_portal };
  }

  //override view function
  async view(req, res) {
    let model = await this.model.findOne({
      where: { id: req.params.id },
      include: {
        model: NewsReaction,
        include: {
          model: Member,
          attributes: ['id', 'username'],
        },
        require: false,
      },
    });
    return { status: true, result: model };
  }
}

module.exports = NewsController;
