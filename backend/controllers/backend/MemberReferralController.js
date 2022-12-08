const Controller = require("./Controller");
const { Op } = require("sequelize");
const moment = require("moment");
const {
  Member
} = require("../../models/index");
class MemberReferralController extends Controller {
  constructor() {
    super("MemberReferral");
  }
  //override list function
  async list(req,res){
    var options = super.getQueryOptions(req);
    options.include = {
      model: Member,
      required: false,
      // as: "referee",
      attributes: ["id", "first_name", "last_name", "email","avatar"],
      // where: {
      //   referral_id: {
      //     [Op.ne]: null,
      //   },
      // },
    }
    const { docs, pages, total } = await this.model.paginate(options);
    // return docs
    // let response = await super.list(req)
    // let ref_list = { ...response.result.data };
    let ref_list = []
    let temp_list = []
    let date_group = ''
    let count = 0
    docs.forEach(function (record,key) {
      if(record.dataValues.Member != null && record.dataValues.Member.dataValues.avatar != ''){
        record.dataValues.Member.dataValues.avatar = record.dataValues.Member.dataValues.avatar
      }
      if(record.dataValues.join_date == ''){
        record.dataValues.status = 'Pending';
      }else if(record.dataValues.activity_date != ''){
        record.dataValues.status = 'Success';
      }else{
        record.dataValues.status = 'Accepted';
      }
      if(date_group != moment(record.dataValues.created_at).format('YYYY-MM')){
        if(date_group != ''){
          ref_list[count]['data'] = temp_list
          count++
          temp_list = []
        }
        date_group = moment(record.dataValues.created_at).format('YYYY-MM')
        ref_list[count] = {
          date_group : moment(record.dataValues.created_at).format('MMMM YYYY'),
          data:[]
        }
      }
      temp_list.push(record.dataValues)
      if(key == total - 1){
        ref_list[count]['data'] = temp_list
      }
    })
    return {
      result:{
        data:ref_list,
        pages:pages,
        total:total
      },
      fields: this.model.fields
    }
  }
  
}
module.exports = MemberReferralController;