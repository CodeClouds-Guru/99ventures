const express = require('express')
const router = express.Router()
const PageParser = require('../helpers/PageParser')
router.get('/', async (req, res) => {
  var pagePerser = new PageParser('products-a');
  try {
    var page_content = await pagePerser.preview();
  } catch (e) {
    switch (e.statusCode) {
      case 404:
        pagePerser = new PageParser('404');
        break;
      default:
        pagePerser = new PageParser('500');
        break;
    }
    page_content = await pagePerser.preview();
  }
  res.render('page', { page_content });
});
module.exports = {
  prefix: '/',
  router,
}
