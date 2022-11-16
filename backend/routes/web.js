const express = require('express')
const router = express.Router()
const PageParser = require('../helpers/PageParser')
router.get('/:slug?', async (req, res) => {
  console.log(req.params.slug || '/');
  var pagePerser = new PageParser(req.params.slug || '/');
  try {
    var page_content = await pagePerser.preview();
  } catch (e) {
    switch (e.statusCode) {
      case 404:
        res.redirect('/404');
        return;
      default:
        res.redirect('/500');
        return;
    }
    page_content = await pagePerser.preview();
  }
  res.render('page', { page_content });
});
module.exports = {
  prefix: '/',
  router,
}
