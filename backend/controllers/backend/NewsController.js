const Controller = require('./Controller');
const { Op } = require('sequelize');
const { Member } = require('../../models/index');
const FileHelper = require('../../helpers/fileHelper');

class NewsController extends Controller {
  constructor() {
    super('News');
  }

  //overridding save api
  async save(req, res) {
    let request_data = req.body;
    let company_portal_id = req.headers.site_id;
    req.body.company_portal_id = company_portal_id;
    if (request_data.image_type == 'file' && req.files) {
      console.log(req.files);
      let files = [];
      files[0] = req.files.image;
      const fileHelper = new FileHelper(files, 'news', req);
      console.log('fileHelper', fileHelper);
      const file_name = await fileHelper.upload();
      console.log('file_name', file_name);
      request_data.image = file_name.files[0].filename;
    }
    delete req.body.image_type;
    req.body.slug = req.body.subject.replace(' ', '_').toLowerCase();
    if (request_data.status == 'published') req.body.published_at = new Date();
    let response = await super.save(req);
    return response;
  }

  //overridding update api
  async update(req, res) {
    let request_data = req.body;
    let company_portal_id = req.headers.site_id;
    let model = await this.model.findByPk(req.params.id);
    if (request_data.image_type == 'file' && req.files) {
      let files = [];
      files[0] = req.files.image;
      const fileHelper = new FileHelper(files, 'news', req);
      const file_name = await fileHelper.upload();
      request_data.image = file_name.files[0].filename;

      let prev_image = model.image;
      if (prev_image != '') {
        let file_delete = await fileHelper.deleteFile(
          prev_image.replace(process.env.S3_BUCKET_OBJECT_URL, '')
        );
      }
    }
    req.body.slug = model.slug;
    delete req.body.image_type;
    let response = await super.update(req);
    return response;
  }
}

module.exports = NewsController;
