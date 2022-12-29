const Controller = require('./Controller')
const {
  Member,
  sequelize,
} = require("../../models/index");
class CampaignController extends Controller {
  constructor() {
    super('Campaign')
  }
  //view campaign
  async view(req, res){
    let model = await this.model.findOne({where:{id:req.params.id},
                                          include:{ 
                                            model: Member,
                                            required: false,
                                            attributes: ["id", "first_name", "last_name", "email"],}
                                        });
    let fields = this.model.fields;
    return { result: model, fields };
  }
}

module.exports = CampaignController
