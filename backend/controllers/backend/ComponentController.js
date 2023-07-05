const Controller = require('./Controller');
const { Op } = require('sequelize');
const { Component } = require('../../models/index');
class ComponentController extends Controller {
  constructor() {
    super('Component');
    this.componentRevisionUpdate = this.componentRevisionUpdate.bind(this);
  }
  //override save function
  async save(req, res) {
    req.body.company_portal_id = req.headers.site_id;

    let response = await super.save(req);
    return {
      status: true,
      message: 'Component added.',
      id: response.result.id,
    };
  }
  //override update function
  async update(req, res) {
    req.body.company_portal_id = req.headers.site_id;

    //modification
    let rev_component_id = req.body.rev_component_id || null; //2
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
    if (rev_component_id !== null) {
      current = await this.model.findByPk(rev_component_id);
    } else {
      current = req.body;
    }
    let response = await this.componentRevisionUpdate(req, current, previous);

    //end of modification

    // let response = await super.update(req);
    return {
      status: true,
      message: 'Component updated.',
    };
  }
  //override delete function
  async delete(req, res) {
    let response = await super.delete(req);
    return {
      status: true,
      message: 'Component deleted.',
    };
  }

  //override list function
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

  //override edit function
  async edit(req, res) {
    try {
      let company_portal_id = req.headers.site_id;

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
        revisions: allBackups,
      };
    } catch (error) {
      throw error;
    }
  }

  //Function for Component Revision Update

  async componentRevisionUpdate(req, current, previous) {
    let rev_component_id = req.body.rev_component_id || null;

    if (rev_component_id === null) {
      //updating the existing row with new modification
      let update_data = {
        name: current.name,
        html: current.html,
        code: previous.code,
        component_json: current.component_json,
        updated_by: req.user.id,
        // created_at: new Date(),
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
        component_json: previous.component_json,
        code: previous.code + '-rev-' + (parseInt(req.countBackups) + 1),
        company_portal_id: req.headers.site_id,
        created_by: req.user.id,
        created_at: previous.created_at,
        // updated_at: previous.created_at,
      };
      // console.log('==================', create_data);
      let model = await Component.create(create_data);
      // let saveResponse = await super.save(createData);
    } else {
      //Updating the current row with selected row
      let update_data = {
        name: current.name,
        html: current.html,
        code: current.code,
        component_json: current.component_json,
        updated_by: req.user.id,
        updated_at: current.updated_at,
        created_at: current.created_at,
      };

      let model_update = this.model.update(update_data, {
        where: {
          id: req.params.id, //1
        },
        individualHooks: true,
      });

      //Updating the selected row with working id
      let update_previous_data = {
        name: previous.name,
        html: previous.html,
        component_json: previous.component_json,
        code: previous.code,
        updated_by: req.user.id,
        updated_at: previous.updated_at,
        created_at: previous.created_at,
      };
      let prev_update = this.model.update(update_previous_data, {
        where: {
          id: rev_component_id, //1
        },
      });
    }

    return true;
  }
}

module.exports = ComponentController;
