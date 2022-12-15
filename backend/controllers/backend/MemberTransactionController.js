const Controller = require("./Controller");
const { Op } = require("sequelize");
const {
  Member
} = require("../../models/index");
class MemberTransactionController extends Controller {
  constructor() {
    super("MemberTransaction");
  }
  // override save function
  async list(req, res) {
    var options = super.getQueryOptions(req);
    let fields = { ...this.model.fields };
    var query_where = req.query.where ? JSON.parse(req.query.where) : null;
    if(query_where != null && query_where.type != undefined && query_where.type == 'withdraw'){
      fields.transaction_id.listing = false
      fields.note.listing = false
    }
    // if(req.params.transaction_date_from !='' && req.params.transaction_date_to !=''){
    //   let transaction_date_from = req.params.transaction_date_from+' 00:00'
    //   let transaction_date_to = req.params.transaction_date_to+' 23:59'
    //   if ("where" in options){
    //     // && Op.and in options['where']
       
    //     options['where'] = {
    //       [Op.and]: {
    //         ...options['where'][Op.and],
    //         created_at: {
    //           [Op.between]: [transaction_date_from,transaction_date_to],
    //         },
    //       }
    //     }
    //   }
    //   else{
    //     options.where = {
    //       created_at: {
    //         [Op.between]: [req.params.transaction_date_from+' 00:00',req.params.transaction_date_to+"23:59"],
    //       },
    //     };
    //   }
    // }
    options.include = {
      model: Member,
      required: false,
      attributes: ["id", "first_name", "last_name", "email","avatar"],
    }
    const { docs, pages, total } = await this.model.paginate(options);
    
    let transaction_list = []
    docs.forEach(function (record,key) {
      if(record.dataValues.Member != null && record.dataValues.Member.dataValues.avatar != ''){
        record.dataValues.Member.dataValues.avatar = process.env.S3_BUCKET_OBJECT_URL+record.dataValues.Member.dataValues.avatar
      }
      switch(record.dataValues.status) {
        case 1:
          record.dataValues.status = 'processing'
          break;
        case 2:
          record.dataValues.status = 'completed'
          break;
        case 3:
          record.dataValues.status = 'failed'
          break;
        case 4:
          record.dataValues.status = 'declined'
          break;
        default:
          record.dataValues.status = 'initiated'
      }
      transaction_list.push(record.dataValues)
    })
    return {
      result:{
        data:transaction_list,
        pages:pages,
        total:total
      },
      fields: fields
    }
  }
}
module.exports = MemberTransactionController;