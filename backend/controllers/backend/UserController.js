const Controller = require('./Controller')
const { Group } = require('../../models/index')
const { CompanyUser } = require('../../models/index')
const bcrypt = require('bcryptjs')
class UserController extends Controller {
  constructor() {
    super('User')
  }

  //override the edit function
  async edit(req, res) {
    try {
      let model = await this.model.findByPk(req.params.id);
      let fields = this.model.fields;
      //group options
      if(model){
        // model.password = '';
        let groups = await Group.findAll({attributes: ['id', 'name']});
        fields.groups.options = groups.map(group=>{
          return {
            key:group.name,
            value:group.id,
            label:group.name
          }
        })
        res.status(200).json({
          status: true,
          result: model,
          fields,
          message:'User details'
        })
      }else{
        res.status(404).json({
          status: false,
          errors: "User not found",
        })
      }
    } catch (error) {
      throw error;
    }
  }

  //override the update function
  async update(req, res) {

    let id = req.params.id;
    let request_data = req.body;
    const { error, value } = this.model.validate(req);
    if (error) {
      const errorObj = new Error("Validation failed.");
      errorObj.statusCode = 422;
      errorObj.data = error.details.map((err) => err.message);
      throw errorObj;
    }
    try {
      request_data.updated_by = req.user.id;
      /****
       * 
       */
      request_data.company_id = 1;
      //unset blank password key
      if(typeof request_data.password !== 'undefined' && request_data.password == ''){
        delete request_data.password;
      }else if(typeof request_data.password !== 'undefined' && request_data.password !=''){
        const salt = await bcrypt.genSalt(10)
        request_data.password = await bcrypt.hash(request_data.password, salt)
      }
      
      await this.model.update(request_data, { where: { id } });
      
      //update user group
      if(typeof request_data.groups !== 'undefined'){
        //delete previous record
        await CompanyUser.destroy({ where: { user_id: id, company_id: request_data.company_id} });
        if(request_data.groups.length > 0){
          let all_groups = [];
          for(const val of request_data.groups) {
              all_groups.push({
                user_id: id, 
                company_id: request_data.company_id,
                group_id:val
              })
          }
          //bulck create company users
          await CompanyUser.bulkCreate(all_groups);
        }
      }
      return {
        message: "Record has been updated successfully",
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserController()
