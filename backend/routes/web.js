const express = require('express');
const router = express.Router();
const PageParser = require('../helpers/PageParser');
const Lucid = require('../helpers/Lucid');
const Cint = require('../helpers/Cint');

const MemberAuthControllerClass = require("../controllers/frontend/MemberAuthController");
const MemberAuthController = new MemberAuthControllerClass();

router.get('/test-lucid', async (req, res) => {
  const lucidObj = new Lucid();
  const definitions_data = await lucidObj.allocatedSurveys();
  res.json(definitions_data);
});

router.get('/test-cint', async (req, res) => {
  const cintObj = new Cint();
});

//ROUTES FOR FRONTEND
router.post("/login", MemberAuthController.login);
router.get("/profile", MemberAuthController.profile);
router.post("/signup", MemberAuthController.signup);

router.get('/:slug?', async (req, res) => {
  var pagePerser = new PageParser(req.params.slug || '/');
  console.log(req.session.flash)
  try {
    var page_content = await pagePerser.preview(req);
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
