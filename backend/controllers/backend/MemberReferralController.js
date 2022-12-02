const Controller = require("./Controller");
const { Op } = require("sequelize");
const moment = require("moment");
class MemberReferralController extends Controller {
  constructor() {
    super("MemberReferral");
  }
  //override list function
  async list(req,res){
    let response = await super.list(req)
    // let ref_list = { ...response.result.data };
    let ref_list = []
    let temp_list = []
    let date_group = ''
    let count = 0
    response.result.data.forEach(function (record,key) {
      console.log('key',key)
      if(date_group != moment(record.dataValues.activity_date).format('YYYY-MM')){
        if(date_group != ''){
          ref_list[count]['data'] = temp_list
          count++
          temp_list = []
        }
        date_group = moment(record.dataValues.activity_date).format('YYYY-MM')
        ref_list[count] = {
          date_group : moment(record.dataValues.activity_date).format('MMMM YYYY'),
          data:[]
        }
      }
      temp_list.push(record.dataValues)
      if(key == response.result.total - 1){
        ref_list[count]['data'] = temp_list
      }
    })
    return {
      result:{
        data:ref_list,
        pages:response.result.pages,
        total:response.result.total
      },
      fields: response.fields
    }
  }
  
}
module.exports = MemberReferralController;