const Models = require('../models');
const Sequelize = require("sequelize");
class ScriptParser {
  constructor() {
    this.parseScript = this.parseScript.bind(this);
    this.getModuleWhere = this.getModuleWhere.bind(this);
    // this.getOfferWallList = this.getOfferWallList.bind(this);
    // this.getTicketList = this.getTicketList.bind(this);
  }
  async parseScript(script_id, user, params) {
    var data = [];
    var script_html = '';
    let script = await Models.Script.findOne({ where: { 'code': script_id } })
    if (script) {
      script_html = script.script_html;
      if (script.module) {
        switch (script.action_type) {
          case 'list':
            const perPage = 'perPage' in params ? params.perpage : 12;
            const orderBy = 'orderBy' in params ? params.orderby : 'id';
            const order = 'order' in params ? params.order : 'desc';
            const pageNo = 'pageNo' in params ? params.pageno : 1;
            const where = this.getModuleWhere(script.module, user);
            data = await Models[script.module].findAll({
              where: where,
              order: [[Sequelize.literal(orderBy), order]],
              limit: perPage,
              offset: (pageNo - 1) * perPage
            });
            break;
        }
      }
    }
    return {
      data: JSON.parse(JSON.stringify(data)),
      script_html
    }
  }
  getModuleWhere(module, user) {
    switch (module) {
      case 'Ticket':
        return { member_id: user.id }
      default:
        return null;
    }
  }

  //offerwall list
  // async getOfferWallList(){
  //   try{
  //     var offer_walls = await OfferWall.findAll({ where: { status: '1' } });
  //     return offer_walls
  //   }catch(err){
  //     console.log(err)
  //     return
  //   }
  // }
  // //member ticket list
  // async getTicketList(){
  //   try{
  //     var tickets = await Ticket.findAll({ where: { member_id: req.session.member.id } });
  //     return tickets
  //   }catch(err){
  //     console.log(err)
  //     return
  //   }
  // }
}
module.exports = ScriptParser;
