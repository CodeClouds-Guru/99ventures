const express = require('express');
const router = express.Router();
const PageParser = require('../helpers/PageParser');
const SqsHelper = require('../helpers/SqsHelper');
const EmaiHelper = require('../helpers/EmailHelper');
const { OfferWall } = require('../models');
const Paypal = require('../helpers/Paypal');
const { SitemapStream, streamToPromise } = require('sitemap');
const { createGzip } = require('zlib');
const { Readable } = require('stream');
if (process.env.DEV_MODE === '1' || process.env.DEV_MODE === '2') {
  router.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send('User-agent: *\nDisallow: /');
  });
}
router.get('/sitemap.xml', async (req, res) => {
  const SiteMapControllerClass = require('../controllers/frontend/SiteMapController');
  const SiteMapController = new SiteMapControllerClass();
  res.header('Content-Type', 'application/xml');
  res.header('Content-Encoding', 'gzip');
  console.log('baseurl', `${req.protocol}://${req.hostname}`);
  try {
    const smStream = await SiteMapController.generate(
      process.env.DEV_MODE === '1'
        ? 'https://moresurveys.com'
        : `https://${req.hostname}`
    );
    const pipeline = smStream.pipe(createGzip());
    streamToPromise(pipeline).then((sm) => (sitemap = sm));
    smStream.end();
    pipeline.pipe(res).on('error', (e) => {
      throw e;
    });
  } catch (e) {
    console.error('Sitemap generation error', e);
    res.status(500).send('Something went wrong');
  }
});

const checkIPMiddleware = require('../middlewares/checkIPMiddleware');
const checkMemberAuth = require('../middlewares/checkMemberAuth');
const validateCaptchaMiddleware = require('../middlewares/validateCaptchaMiddleware');
router.use(checkMemberAuth);
router.use(validateCaptchaMiddleware);
//commented for testing uk/us surveys, should be uncommented later
router.use(checkIPMiddleware);

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
const TicketControllerClass = require('../controllers/frontend/TicketController');
const TicketController = new TicketControllerClass();
const LucidControllerClass = require('../controllers/frontend/LucidController');
const LucidController = new LucidControllerClass();
const NotificationControllerClass = require('../controllers/frontend/NotificationController');
const NotificationController = new NotificationControllerClass();

router.get('/impersonate', StaticPageController.validateImpersonation);
router.post('/login', MemberAuthController.login);
router.post('/signup', MemberAuthController.signup);
router.get('/email-verify/:hash', MemberAuthController.emailVerify);
router.post('/logout', MemberAuthController.logout);
// router.get('/survey', SurveyController.getSurvey);
router.get('/survey/:status', StaticPageController.showStatus);
router.get('/get-scripts', StaticPageController.getScripts);
router.post('/ticket/create', TicketController.createTicket);
router.post('/ticket/update', TicketController.update);
router.get('/purespectrum/entrylink', PureSpectrumController.generateEntryLink);
router.get('/schlesigner/entrylink', SchlesingerController.generateEntryLink);
router.get('/lucid/entrylink', LucidController.generateEntryLink);
router.get('/paid-surveys/:provider', StaticPageController.getsurveys);

router.post('/profile/update', MemberAuthController.profileUpdate);
router.put('/profile/update', MemberAuthController.profileUpdate);
router.get('/state-list', MemberAuthController.getStateList);

router.post('/member/withdraw', MemberAuthController.memberWithdrawal);
router.post('/member-forgot-password', MemberAuthController.forgotPassword);
router.post('/save-password', MemberAuthController.resetPassword);

router.post('/update-notification', NotificationController.update);
router.delete('/update-notification', NotificationController.delete);
router.get('/test-mail', async (req, res) => {
  const emaiHelper = new EmaiHelper({
    user: req.session.member,
    headers: {
      site_id: 1,
    },
  });
  const send_message = await emaiHelper.parse({
    action: 'Referral Bonus',
    data: {},
  });
  res.send(send_message);
});
router.get('/test-payment', async (req, res) => {
  const paypal_class = new Paypal(1);
  const create_resp = await paypal_class.payout([
    {
      email: 'sb-vwa0c25891350@business.example.com',
      member_transaction_id: 1,
      currency: 'USD',
      amount: 1.0,
    },
    {
      email: 'sb-vwa0c25891350@business.example.com',
      member_transaction_id: 1,
      currency: 'USD',
      amount: 1.0,
    },
  ]);
  res.send({
    l: create_resp,
  });
});
router.get('/confirm-payment/:batchid', async (req, res) => {
  let batch_id = req.params.batchid;
  let requ = {
    event_type: 'PAYMENT.PAYOUTSBATCH.SUCCESS',
    resource: {
      batch_header: {
        payout_batch_id: batch_id,
      },
    },
  };
  let company_portal_id = req.session.company_portal.id;
  const paypal_class = new Paypal(company_portal_id);
  const create_resp = await paypal_class.getPayouts(requ);
  res.send({
    l: create_resp,
  });
});
router.get('/get-login-streak', MemberAuthController.getLoginStreak);

//test api for manual insertion of member survye eligibilities
router.get('/member-eligibility', MemberAuthController.manualMemberEligibility);

router.get('*', async (req, res) => {
  const slug = req.path.length > 1 ? req.path.substring(1) : req.path;
  var pagePerser = new PageParser(slug);
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
      case 503:
        res.redirect('503');
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
