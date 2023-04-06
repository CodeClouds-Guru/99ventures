const express = require('express');
const router = express.Router();
const PageParser = require('../helpers/PageParser');
const SqsHelper = require('../helpers/SqsHelper');
const { OfferWall } = require('../models');

router.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /');
});

const MemberAuthControllerClass = require('../controllers/frontend/MemberAuthController');
const MemberAuthController = new MemberAuthControllerClass();
const SurveyControllerClass = require('../controllers/frontend/SurveyController');
const SurveyController = new SurveyControllerClass();
const StaticPageControllerClass = require('../controllers/frontend/StaticPageController');
const StaticPageController = new StaticPageControllerClass();
const PureSpectrumControllerClass = require('../controllers/frontend/PureSpectrumController');
const PureSpectrumController = new PureSpectrumControllerClass();
const SchlesingerControllerClass = require('../controllers/frontend/SchlesingerController');
const SchlesingerController = new SchlesingerControllerClass();
const CintControllerClass = require('../controllers/frontend/CintController');
const CintController = new CintControllerClass();
const TicketControllerClass = require('../controllers/frontend/TicketController');
const TicketController = new TicketControllerClass();
const LucidControllerClass = require('../controllers/frontend/LucidController');
const LucidController = new LucidControllerClass();

//ROUTES FOR FRONTEND
const checkMemberAuth = require('../middlewares/checkMemberAuth');

router.post('/login', [checkMemberAuth],MemberAuthController.login);
router.post('/signup', MemberAuthController.signup);
router.get('/email-verify/:hash', MemberAuthController.emailVerify);
router.post('/logout', MemberAuthController.logout);
router.get('/survey', SurveyController.getSurvey);
router.get('/survey/:status', StaticPageController.showStatus);
router.get('/get-scripts', StaticPageController.getScripts);
router.post('/ticket/create', TicketController.saveTicketConversations);
router.get('/cint/surveys', CintController.survey);
router.get('/pure-spectrum/:action', PureSpectrumController.index);
router.get('/schlesigner/:action', SchlesingerController.index);
router.get('/lucid/:action', LucidController.index);

router.post(
  '/profile/update',
  MemberAuthController.profileUpdate
);
router.put(
  '/profile/update',
  MemberAuthController.profileUpdate
);

router.get('/404', async (req, res) => {
  var pagePerser = new PageParser('404');
  var page_content = await pagePerser.preview(req);
  res.render('page', { page_content });
});
router.get('/500', async (req, res) => {
  var pagePerser = new PageParser('500');
  var page_content = await pagePerser.preview(req);
  res.render('page', { page_content });
});

router.get('/:slug?', async (req, res) => {
  //checkIPMiddleware
  var pagePerser = new PageParser(req.params.slug || '/');
  try {
    var page_content = await pagePerser.preview(req);
  } catch (e) {
    switch (e.statusCode) {
      case 404:
        res.redirect('/404');
        return;
      case 401:
        res.redirect('/');
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
