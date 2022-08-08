const Controller = require('./Controller')
const { Role, Group } = require('../../models')
class GroupController extends Controller {
  constructor() {
    super('Group')
    this.populateRoles = this.populateRoles.bind(this)
  }

  async add(req, res) {
    const resp = await super.add(req, res)
    resp.fields = await this.populateRoles(resp.fields)
    return resp
  }

  async save(req, res) {
    try {
      const roles = req.body.roles
      delete req.body.roles
      const resp = await super.save(req, res)
      if (resp.result) {
        resp.result.setRoles(roles)
      }
      return resp
    } catch (e) {
      throw e
    }
  }

  async populateRoles(fields) {
    const roles = await Role.findAll({
      attributes: [
        ['name', 'key'],
        ['id', 'value'],
        ['slug', 'label'],
      ],
    })
    fields.roles.options = roles
    return fields
  }

  async edit(req, res) {
    try {
      const resp = await super.edit(req, res)
      resp.fields = await this.populateRoles(resp.fields)
      let group_roles = await resp.result.getRoles({ joinTableAttributes: [] })
      group_roles = group_roles.map((item) => item.id)
      resp.result.setDataValue('roles', group_roles)
      return resp
    } catch (e) {
      throw e
    }
  }

  async update(req, res) {
    try {
      let id = req.params.id
      let request_data = req.body
      if ('roles' in request_data) {
        const group = await Group.findByPk(id)
        if (group) {
          await group.setRoles(request_data.roles)
        }
        return {
          message: 'Roles associated to this group has been updated',
        }
      } else {
        return await super.update(req, res)
      }
    } catch (e) {
      throw e
    }
  }
}

module.exports = new GroupController()
