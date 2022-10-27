const Controller = require('./Controller')
const { Setting } = require('../../models/index')

class SettingController extends Controller {
  constructor() {
    super('Setting')
  }

  async update(req, res) {
    console.log(req)
    let request_data = req.body;
    let id = request_data.id;
    
    try {
      request_data.updated_by = req.user.id;
      let model = await Setting.update(request_data, { where: { id } });
      return {
        message: "Record has been updated successfully",
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SettingController
