const {
    Script,
    OfferWall,
    Ticket
  } = require('../models');
  const util = require("util");
  const { QueryTypes, Op } = require('sequelize');
const { off } = require('process');
  class ScriptParser {
    constructor() {
        this.parseScript = this.parseScript.bind(this);
        this.getOfferWallList = this.getOfferWallList.bind(this);
        this.getTicketList = this.getTicketList.bind(this);
    }
    async parseScript(script_id){
      console.log('script_id',script_id)
        let script_html = await Script.findOne({where:{'code': script_id}})
        console.log(script_html)
        if(script_html){
          console.log('script_html')
          var data = {}
          if(script_html.module){
            
            switch(script_html.module) {
              case 'offerwall':
                data = await this.getOfferWallList()
                break;
              case 'ticketlist':
                data = await this.getTicketList()
                break;
              default:
                data = {msg:'custom msg'}
                // code block
            }
          }
          return{
            data: data,
            script_html:script_html
          }
        }
    }
    //offerwall list
    async getOfferWallList(){
      try{
        var offer_walls = await OfferWall.findAll({ where: { status: '1' } });
        return offer_walls
      }catch(err){
        console.log(err)
        return
      }
    }
    //member ticket list
    async getTicketList(){
      try{
        var tickets = await Ticket.findAll({ where: { member_id: req.session.member.id } });
        return tickets
      }catch(err){
        console.log(err)
        return
      }
    }
  }
  module.exports = ScriptParser;
  