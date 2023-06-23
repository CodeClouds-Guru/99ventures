const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../middlewares/authMiddleware');
const checkPermissionMiddleware = require('../middlewares/CheckPermissionMiddleware');
const AuthControllerClass = require('../controllers/backend/AuthController');
const AuthController = new AuthControllerClass();

const TicketControllerClass = require('../controllers/backend/TicketController');
const TicketController = new TicketControllerClass();

const InvitationControllerClass = require('../controllers/backend/InvitationController');
const InvitationController = new InvitationControllerClass();

const FileManagerControllerClass = require('../controllers/backend/FileManagerController');
const FileManagerController = new FileManagerControllerClass();

const PageControllerClass = require('../controllers/backend/PageController');
const PageController = new PageControllerClass();

const ReportControllerClass = require('../controllers/backend/ReportController');
const ReportController = new ReportControllerClass();

const DynamicRouteController = require('../controllers/backend/DynamicRouteController');

const Paypal = require('../helpers/Paypal');

router.get('/', async (req, res) => {
  res.json({ message: 'API working', });
});

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.get('/profile', [AuthMiddleware], AuthController.profile);
router.post('/profile-update', [AuthMiddleware], AuthController.profileUpdate);
router.post('/logout', [AuthMiddleware], AuthController.logout);
router.get('/refresh-token', [AuthMiddleware], AuthController.refreshToken);
router.get('/companies', [AuthMiddleware], AuthController.getCompanyAndSites);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.get(
  '/resend-invitation/:id',
  [AuthMiddleware],
  InvitationController.resendInvitation
);
router.post('/invitation-details', InvitationController.invitationDetails);

//check password
router.post('/check-auth', [AuthMiddleware], AuthController.checkAuth);
router.get('/report', ReportController.getReport);
//change ticket read status
// router.get("/tickets/change-status", [AuthMiddleware], TicketController.changeStatus);

//testing of axios api call
router.get('/campaign-callback', [AuthMiddleware], (req, res) => {
  const axios = require('../helpers/CampaignCallbackHelper');

  let axios_class = new axios();
  let axios_callback = axios_class.makeRequest();
  // console.log('axios_callback', axios_callback);
  res.json(axios_callback);
});

router.post(
  '/file-manager/download',
  [AuthMiddleware],
  FileManagerController.download
);
router.get('/pages/preview/:id?', [AuthMiddleware], PageController.preview);

/**
 * CRON PATH
 */
const SurveySyncControllerClass = require('../controllers/callback/SurveySyncController');
const SurveySyncController = new SurveySyncControllerClass();
router.all('/purespectrum-update', SurveySyncController.pureSpectrumSurveyUpdate);
router.all('/schlesinger-update', SurveySyncController.schlesingerSurveyUpdate);
router.all('/lucid-update', SurveySyncController.lucidSurveyUpdate);



//paypal integration
// router.post('/order-create', async (req, res) => {
//   console.log('paypal order-create');
//   let paypal_class = new Paypal();
//   let create_order = await paypal_class.createOrder(req);
//   res.send(create_order);
// });

// router.post('/order-success', async (req, res) => {
//   console.log('paypal order-capture');
//   let paypal_class = new Paypal();
//   var capture_payment = await paypal_class.capturePayment(req, res);
//   res.send(capture_payment);
// });

// router.post('/order-capture', async (req, res) => {
//   console.log('paypal order-capture');
//   let paypal_class = new Paypal();
//   var capture_payment = await paypal_class.capturePayment(req, res);
//   res.send(capture_payment);
// });

router.all(
  '/:module/:action?/:id?',
  [AuthMiddleware, checkPermissionMiddleware],
  DynamicRouteController.handle
);

module.exports = {
  prefix: '/api',
  router,
};
