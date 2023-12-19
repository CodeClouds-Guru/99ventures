const Controller = require('./Controller');
const { Op } = require('sequelize');
const { Member } = require('../../models/index');

class NewsController extends Controller {
  constructor() {
    super('News');
  }
}

module.exports = NewsController;
