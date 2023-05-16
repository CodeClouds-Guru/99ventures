const express = require('express');
const router = express.Router();
const logger = require('../helpers/Logger')();
const Paypal = require('../helpers/Paypal');
const OfferwallPostbackControllerClass = require('../controllers/callback/OfferwallPostbackController');
const OfferwallPostbackController = new OfferwallPostbackControllerClass();
const SurveycallbackControllerClass = require('../controllers/callback/SurveycallbackController');
const SurveycallbackController = new SurveycallbackControllerClass();

const SurveyQuestionsControllerClass = require('../controllers/callback/SurveyQuestionsController');
const SurveyQuestionsController = new SurveyQuestionsControllerClass();
const { CompanyPortal } = require('../models/index');
router.get('/test-adgate', (req, res) => {
  console.dir(logger);
  logger.info(JSON.stringify(req.query));
  res.send(req.query);
});


router.get('/postback/:offerwall', OfferwallPostbackController.save);
router.all('/survey/:provider', SurveycallbackController.syncSurvey);
router.all('/survey/outcome/:provider', SurveycallbackController.save);

/**
 * To Sync Servey
 */
const SurveySyncControllerClass = require('../controllers/callback/SurveySyncController');
const SurveySyncController = new SurveySyncControllerClass();
router.get('/survey/:provider/:action', SurveySyncController.index);
//------------------------

// for adscend PB test
router.all('/postback-test/:offerwall', async (req, res) => {
  const logger1 = require('../helpers/Logger')('allofferwallpb.log');
  logger1.info(req.method)
  logger1.info(JSON.stringify(req.query));
  logger1.info(JSON.stringify(req.body));
  res.send(req.query);
});



// router.all('/survey/outcome/:provider', async (req, res) => {
//   //   console.log('===================outcome', req);
//   const logger1 = require('../helpers/Logger')(
//     `outcome-${req.params.provider}.log`
//   );

//   logger1.info(JSON.stringify(req.query));
//   logger1.info(JSON.stringify(req.body));
//   res.send(req.query);
// });

router.all('/survey/other/:provider/:status', async (req, res) => {
  //   console.log('===================outcome', req);
  const logger1 = require('../helpers/Logger')(
    `${req.params.status}-${req.params.provider}.log`
  );

  logger1.info(JSON.stringify(req.query));
  logger1.info(JSON.stringify(req.body));
  res.send(req.query);
});
//survey question
router.get('/survey-questions/', SurveyQuestionsController.save);
router.get(
  '/survey-answer-precodes/',
  SurveyQuestionsController.saveAnswerPrecodes
);
router.get('/test-hbs', (req, res) => {
  var Handlebars = require('handlebars');
  const template = Handlebars.compile('\
  <div class="stickyfooter">\
    <div class="Left Bold">Total:</div>\
      <div class="Right">\
        <span class="Currency">{{PositionsTotal}}</span>\
      </div>\
    <div class="Clear" />\
  </div>');
  const html = template({ PositionsTotal: 34 });
  res.send(html);
})
router.get('/confirm-payment/', async (req,res) => {
  var company_portal = await CompanyPortal.findOne({
    where: { domain: req.hostname },
  });
  const logger1 = require('../helpers/Logger')(
    `paypal_callback.log`
  );
  logger1.info(JSON.stringify(req.body));

  // let company_portal_id = company_portal.id
  // const paypal_class = new Paypal(company_portal_id);
  // response = await paypal_class.getPayouts(req);
  // res.send(response)
  res.send('ok')
});
module.exports = {
  prefix: '/callback',
  router,
};
