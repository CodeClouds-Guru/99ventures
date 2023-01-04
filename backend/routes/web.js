const express = require('express')
const router = express.Router()
const PageParser = require('../helpers/PageParser')
router.get('/', async (req, res) => {
  var pagePerser = new PageParser('/');
  try {
    var page_content = await pagePerser.preview();
  } catch (e) {
    switch (e.statusCode) {
      case 404:
        res.redirect('/404');
        return;
      default:
        res.redirect('/500');
        console.error(e)
        return;
    }
    page_content = await pagePerser.preview();
  }
  res.render('page', { page_content });
});

router.get('/preview/:slug?', async (req, res) => {
  console.log(req.params.slug || '/');
  var pagePerser = new PageParser(req.params.slug || '/');
  try {
    var page_content = await pagePerser.preview();
  } catch (e) {
    switch (e.statusCode) {
      case 404:
        res.redirect('/preview/404');
        return;
      default:
        res.redirect('/preview/500');
        console.error(e)
        return;
    }
    page_content = await pagePerser.preview();
  }
  res.render('page', { page_content });
});

router.get('/test-crypt', async (req, res) => {
  const Crypt = require("../helpers/Crypt");
  const obj = {
    email: 'sourabh@mailinator.com',
    id: 1,
    company_portal_id: 1,
    company_id: 1
  }
  let cryptic = new Crypt(JSON.stringify(obj));
  let str = cryptic.encrypt();
  res.send(str);
});
module.exports = {
  prefix: '/',
  router,
}
