const Controller = require('./Controller');
const { Op } = require('sequelize');
const { OfferWall } = require('../../models/index');
class OfferWallController extends Controller {
  constructor() {
    super('OfferWall');
  }
  //save
  async save(req, res) {}

  //list
  async list(req, res) {}
}
module.exports = OfferWallController;
