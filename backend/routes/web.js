const express = require('express');
const router = express.Router();
const PageParser = require('../helpers/PageParser');
const Lucid = require('../helpers/Lucid');
// const Cint = require('../helpers/Cint');
// const PurespectrumHelper = require('../helpers/Purespectrum');
const SqsHelper = require("../helpers/SqsHelper");
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
const PureSpectrumControllerClass = require("../controllers/frontend/PureSpectrumController");
const PureSpectrumController = new PureSpectrumControllerClass;
const SchlesingerControllerClass = require("../controllers/frontend/SchlesingerController");
const SchlesingerController = new SchlesingerControllerClass;
const CintControllerClass = require('../controllers/frontend/CintController');
const CintController = new CintControllerClass;
const TicketControllerClass = require('../controllers/frontend/TicketController');
const TicketController = new TicketControllerClass();

router.get('/offer-wall/list', async (req, res) => {
  var offer_walls = await OfferWall.findAll({ where: { status: '1' } });
  if (offer_walls) {
    let offerHtml = '';
    offer_walls.forEach(function (record, key) {
      let offer_name = record.name.toLowerCase();
      offer_name = offer_name.replaceAll(' ', '-');

      let link = `/offer-wall/${offer_name}`;
      offerHtml += `
				<div class="offer-box" style="width: 45%; padding: 20px 10px; border: 1px solid #fff; background-color: #fff; margin-bottom: 1rem;margin-right: 1rem; border-radius: 10px;">
					<h3 style="margin:0;">${record.name}</h3>
					<div style="text-align: right; margin-top: 3rem;"><a href="${link}" target="_blank" style="border: 1px solid #33375f;background-color: #33375f;color: #fff;padding: 7px 36px;text-decoration: none;border-radius: 3px;    box-shadow: 0 2px 12px #33375f;">Click here</a></div>
				</div>
			`;
    });
    res.send(
      `<div style="width: 100%; display:flex; flex-wrap: wrap" class="offer-container">${offerHtml}</div>`
    );
  } else {
    res.send('No records found!');
  }
});

//socket call
router.get('/socket-connect', async (req, res) => {
  global.socket.emit('shoutbox', {
    name: 'Nandita',
    place: 'USA',
    message: 'Socket connected',
  });
  res.send('hello');
});

//SQS
router.post('/sqs-send-message', async (req, res) => {
  const sqsHelper = new SqsHelper();
  const send_message = await sqsHelper.sendData(req.body);
  res.send(send_message);
});
router.get('/sqs-receive-message', async (req, res) => {
  const sqsHelper = new SqsHelper();
  const receive_message = await sqsHelper.receiveData();
  res.send(receive_message);
});
//ROUTES FOR FRONTEND
const checkIPMiddleware = require('../middlewares/checkIPMiddleware');
const checkMemberAuth = require('../middlewares/checkMemberAuth');
router.post('/login', MemberAuthController.login);
router.post('/signup', MemberAuthController.signup);
router.get('/email-verify', MemberAuthController.emailVerify);
router.post('/logout', MemberAuthController.logout);
router.get('/survey', SurveyController.getSurvey);
router.get('/survey/:status', StaticPageController.showStatus);
router.post('/ticket/create', TicketController.saveTicketConversations);
router.get('/cint/surveys', CintController.survey);
router.get('/pure-spectrum/:action', PureSpectrumController.index);
router.get('/schlesigner/:action', SchlesingerController.index);

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

router.get('/:slug?', [checkMemberAuth], async (req, res) => {
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
