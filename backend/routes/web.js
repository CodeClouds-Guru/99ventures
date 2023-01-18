const express = require('express');
const router = express.Router();
const PageParser = require('../helpers/PageParser');
const Lucid = require('../helpers/Lucid');

router.get('/test-lucid', async (req, res) => {
  const lucidObj = new Lucid();
  // const data = await lucidObj.suppliers();
  const definitions_data = await lucidObj.allocatedSurveys();

  res.json(definitions_data);
});

router.get('/:slug?', async (req, res) => {
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
        console.error(e);
        return;
    }
    page_content = await pagePerser.preview();
  }
  res.render('page', { page_content });
});

module.exports = {
  prefix: '/',
  router,
};
