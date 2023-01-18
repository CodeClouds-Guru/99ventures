const Controller = require('./Controller');
const { Op } = require('sequelize');
const { Layout, Component } = require('../../models/index');
class LayoutController extends Controller {
  constructor() {
    super('Layout');
    this.layoutRevisionUpdate = this.layoutRevisionUpdate.bind(this);
  }
  //override save function
  async save(req, res) {
    req.body.company_portal_id = req.headers.site_id;
    let layout_html = req.body.html;
    if (layout_html.includes('{{content}}')) {
      let response = await super.save(req);
      return {
        status: true,
        message: 'Layout added.',
        id: response.result.id,
      };
    } else {
      this.throwCustomError('{{content}} is missing.', 401);
    }
  }
  //override update function
  async update(req, res) {
    req.body.company_portal_id = req.headers.site_id;
    let layout_html = req.body.html;
    let rev_layout_id = req.body.rev_layout_id || null; //5

    if (rev_layout_id || layout_html.includes('{{content}}')) {
      let previous = await this.model.findByPk(req.params.id); //1
      const countBackups = await this.model.count({
        where: {
          code: {
            [Op.like]: previous.code + '-rev-%',
          },
        },
      });
      req.countBackups = countBackups;
      let current = {};
      if (rev_layout_id !== null) {
        current = await this.model.findByPk(rev_layout_id);
      } else {
        current = req.body;
      }
      let response = await this.layoutRevisionUpdate(req, current, previous);

      return {
        status: true,
        message: 'Layout updated.',
      };
    } else {
      this.throwCustomError('{{content}} is missing.', 401);
    }
  }

  //override add function
  async add(req, res) {
    let company_portal_id = req.headers.site_id;
    let components = await Component.findAll({
      attributes: ['name', 'html', 'code', 'component_json'],
      where: {
        company_portal_id: company_portal_id,
        code: {
          [Op.notLike]: '%-rev-%',
        },
      },
    });
    return {
      status: true,
      fields: this.model.fields,
      components,
    };
  }

  //override edit function
  async edit(req, res) {
    try {
      let company_portal_id = req.headers.site_id;
      let components = await Component.findAll({
        attributes: ['name', 'html', 'code', 'component_json'],
        where: { company_portal_id: company_portal_id },
      });
      let model = await this.model.findByPk(req.params.id);

      const allBackups = await this.model.findAndCountAll({
        attributes: ['id', 'name', 'created_at', 'updated_at'],
        where: {
          code: {
            [Op.like]: model.code + '-rev-%',
          },
        },
        order: [['created_at', 'DESC']],
      });

      let fields = this.model.fields;
      return {
        status: true,
        result: model,
        fields,
        components,
        revisions: allBackups,
      };
    } catch (error) {
      throw error;
    }
  }
  //override delete function
  async delete(req, res) {
    let response = await super.delete(req);
    return {
      status: true,
      message: 'Layout deleted.',
    };
  }

  async list(req, res) {
    var options = super.getQueryOptions(req);
    if ('where' in options) {
      if (Op.and in options['where']) {
        options['where'] = {
          [Op.and]: {
            ...options['where'][Op.and],
            code: {
              [Op.notLike]: '%-rev-%',
            },
          },
        };
      } else {
        options['where'] = {
          [Op.and]: {
            ...options['where'],
            code: {
              [Op.notLike]: '%-rev-%',
            },
          },
        };
      }
    } else {
      options.where = {
        code: {
          [Op.notLike]: '%-rev-%',
        },
      };
    }
    const { docs, pages, total } = await this.model.paginate(options);

    return {
      result: { data: docs, pages, total },
      fields: this.model.fields,
    };
  }

  //Function for Layout Revision Update
  async layoutRevisionUpdate(req, current, previous) {
    let rev_layout_id = req.body.rev_layout_id || null;

    if (rev_layout_id === null) {
      //updating the existing row with new modification
      let update_data = {
        name: current.name,
        html: current.html,
        layout_json: current.layout_json,
        updated_by: req.user.id,
        created_at: new Date(),
      };

      let model_update = this.model.update(update_data, {
        where: {
          id: req.params.id, //1
        },
      });

      //Creating a new row for backup
      let create_data = {
        name: previous.name,
        html: previous.html,
        layout_json: previous.layout_json,
        code: previous.code + '-rev-' + (parseInt(req.countBackups) + 1),
        company_portal_id: req.headers.site_id,
        created_by: req.user.id,
        created_at: previous.created_at,
        // updated_at: previous.created_at,
      };
      console.log('==================', create_data);
      let model = await Layout.create(create_data);
      // let saveResponse = await super.save(createData);
    } else {
      //Updating the current row with selected row
      let update_data = {
        name: current.name,
        html: current.html,
        layout_json: current.layout_json,
        updated_by: req.user.id,
        updated_at: current.updated_at,
        created_at: current.created_at,
      };

      let model_update = this.model.update(update_data, {
        where: {
          id: req.params.id, //1
        },
      });

      //Updating the selected row with working id
      let update_previous_data = {
        name: previous.name,
        html: previous.html,
        layout_json: previous.layout_json,
        updated_by: req.user.id,
        updated_at: previous.updated_at,
        created_at: previous.created_at,
      };

      let prev_update = this.model.update(update_previous_data, {
        where: {
          id: rev_layout_id, //1
        },
      });
    }

    return true;
  }
}

module.exports = LayoutController;
