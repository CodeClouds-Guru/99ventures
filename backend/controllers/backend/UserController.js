const Controller = require('./Controller')
const { Group } = require('../../models/index')
const { CompanyUser,Invitation } = require('../../models/index')
const { InvitationCont} = require("../../controllers/backend/InvitationController")
const bcrypt = require('bcryptjs')
class UserController extends Controller {
  constructor() {
    super('User')
  }
  //override add function
  async add(req, res) {
    let response = await super.add(req);
    let fields = response.fields
    let groups = await Group.findAll({ attributes: ['id', 'name'] });
    fields.groups.options = groups.map(group => {
      return {
        key: group.name,
        value: group.id,
        label: group.name
      }
    })
    return {
          status: true,
          fields,
    }
  }
  //override store function
  async save(req,res){
    let response = await super.save(req)
    let new_user = response.result
    //get company id
    let company_id = req.headers.company_id ?? 1;
    let user = req.user
  //update user group
  if (typeof req.body.groups !== 'undefined') {
    if (req.body.groups.length > 0) {
      let all_groups = [];
      for (const val of req.body.groups) {
        all_groups.push({
          user_id: new_user.id,
          company_id: company_id,
          group_id: val
        })
      }
      //bulck create company users
      await CompanyUser.bulkCreate(all_groups);
    }
  }
  var expired_at = new Date();
  // add a day
  expired_at.setDate(expired_at.getDate() + 1);
  //save invitation
  let new_invitation = await Invitation.create({
      user_id: new_user.id,
      email: new_user.email,
      expired_at: expired_at,
      created_by: user.id
  })
  let token = { id: new_user.id, email: new_user.email,invitation_id: new_invitation.id,expired_at:expired_at}
  token = JSON.stringify(token)
  let base64data = Buffer.from(token, 'utf8')
  token = base64data.toString('base64')
  //update token
  let update_token = await Invitation.update({token:token},{where:{id:new_invitation.id}})

    return {
      message: response.message,
      result: response.result,
      link:process.env.CLIENT_ORIGIN + '/sign-up?token=' + token
    }
  }
  //override the edit function
  async edit(req, res) {
    try {
      let model = await this.model.findByPk(req.params.id);
      let fields = this.model.fields;
      //group options
      if(model){
        let groups = await Group.findAll({ attributes: ['id', 'name'] });
        fields.groups.options = groups.map(group => {
          return {
            key: group.name,
            value: group.id,
            label: group.name
          }
        })
        let company_id = req.headers.company_id ?? 1;
        let group_ids = await model.getGroups()
        group_ids = group_ids.map(group=>{
          return group.id
        })
        // model['groups'] = group_ids;
        model.setDataValue('groups',group_ids)
        model.password = ''
        return {
          status: true,
          result: model,
          fields,
          message:'User details'
        }
      } else {
        this.throwCustomError('User not found',404);
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
      let message = error.details.map((err) => err.message).join(', ');
      this.throwCustomError(message,422);
    }
    if(!req.headers.company_id){
      this.throwCustomError('Company id is required',401);
    }
    try {
      request_data.updated_by = req.user.id;
      /****
       * 
       */
      request_data.company_id = req.headers.company_id;
      //unset blank password key
      if (typeof request_data.password !== 'undefined' && request_data.password == '') {
        delete request_data.password;
      } else if (typeof request_data.password !== 'undefined' && request_data.password != '') {
        const salt = await bcrypt.genSalt(10)
        request_data.password = await bcrypt.hash(request_data.password, salt)
      }

      await this.model.update(request_data, { where: { id } });

      //update user group
      if (typeof request_data.groups !== 'undefined') {
        //delete previous record
        await CompanyUser.destroy({ where: { user_id: id, company_id: request_data.company_id } });
        if (request_data.groups.length > 0) {
          let all_groups = [];
          for (const val of request_data.groups) {
            all_groups.push({
              user_id: id,
              company_id: request_data.company_id,
              group_id: val
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
