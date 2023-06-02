const Controller = require('./Controller');
const { Setting } = require('../../models/index');

class SettingController extends Controller {
  constructor() {
    super('Setting');
  }

  async update(req, res) {
    // console.log(req);
    const update_data = req.body.config_data || [];
    const site_id = req.header('site_id') || 1;
    const company_id = req.header('company_id') || 1;

    try {
      let data = [];
      data = update_data.map((values) => {
        return {
          settings_value: values.value,
          settings_key: values.key,
          id: values.id,
        };
      });

      // await Setting.destroy({
      //   where: { company_portal_id: site_id },
      // });
      // console.log(data);

      let model = await Setting.bulkCreate(data, {
        updateOnDuplicate: ['id', 'settings_key', 'settings_value'],
        ignoreDuplicates: true,
      });

      return {
        status: true,
        message: 'Record has been updated successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async list(req, res) {
    try {
      const site_id = req.header('site_id') || 1;
      const company_id = req.header('company_id') || 1;
      let type = req.query.type || '';
      let where = {
        company_portal_id: site_id,
      };
      if (type == 'member') {
        where['settings_key'] = ['referral_percentage', 'registration_bonus','referral_status'];
      } else {
        where['settings_key'] = [
          'file_manager_configuration',
          'max_file_size',
          'max_no_of_uploads',
        ];
      }
      let config_data = await Setting.findAll({
        // attributes: [
        //   "id",
        //   ["settings_key", "key"],
        //   ["settings_value", "value"],
        // ],
        where: where,
      });

      return {
        status: true,
        data: { config_data },
      };
    } catch (err) {
      this.throwCustomError('Unable to get data', 500);
    }
  }
}

module.exports = SettingController;
