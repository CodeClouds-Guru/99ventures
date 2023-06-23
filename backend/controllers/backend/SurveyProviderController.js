const Controller = require('./Controller');
const MemberSurveyControllerClass = require('./MemberSurveyController')

class SurveyProviderController extends Controller {
  constructor() {
    super('SurveyProvider');
  }
  async list(req,res){
    let action = req.query.module
    var response = {}
    switch(action){
      case 'completed-surveys':
        const MemberSurveyController = new MemberSurveyControllerClass();
        response = await MemberSurveyController.list(req,res) 
        break;
      default:
        response = await super.list(req);
        break;

    }
    return response;
  }
}
module.exports = SurveyProviderController;
