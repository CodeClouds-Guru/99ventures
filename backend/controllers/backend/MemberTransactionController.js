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
      fields: this.model.fields
    }
  }
}
module.exports = MemberTransactionController;