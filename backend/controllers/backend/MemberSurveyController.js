const Controller = require("./Controller");
const {
    MemberSurvey,
    SurveyProvider,
    MemberTransaction,
    Member
  } = require('../../models/index');
class MemberSurveyController extends Controller{
    constructor() {
        super("MemberSurvey");
    }
    async list(req, res) {
        var options = await this.getQueryOptions(req); 
        options.include = [
            {
              model: SurveyProvider,
              attributes: ["name"],
            },
            {
                model: MemberTransaction,
                attributes: ["transaction_id"],
                include:[
                    {
                        model: Member,
                        attributes: ['username']
                    }
                ]
              },
          ];
          let page = req.query.page || 1;
          let limit = parseInt(req.query.show) || 10; // per page record
          let offset = (page - 1) * limit;
          options.limit = limit;
          options.offset = offset;
          let result = await this.model.findAndCountAll(options);
          let pages = Math.ceil(result.count / limit);
          result.rows.map(row => {
            if(row.SurveyProvider){
              row.setDataValue('SurveyProvider.name', row.SurveyProvider.name);
            }else{
              row.setDataValue('SurveyProvider.name', '');
            }
            if(row.MemberTransaction.transaction_id){
              row.setDataValue('Member.username', row.MemberTransaction.Member.username);
            }else{
              row.setDataValue('Member.username', '');
            }
          })
          return {
            result: { data: result.rows, pages, total: result.count },
            fields: this.model.fields,
          };
    }
}
module.exports = MemberSurveyController;