const express = require('express');
const router = express.Router();
const logger = require('../helpers/Logger')();

const OfferwallPostbackControllerClass = require('../controllers/callback/OfferwallPostbackController');
const OfferwallPostbackController = new OfferwallPostbackControllerClass();
const SurveycallbackControllerClass = require('../controllers/callback/SurveycallbackController');
const SurveycallbackController = new SurveycallbackControllerClass();

const SurveyQuestionsControllerClass = require('../controllers/callback/SurveyQuestionsController');
const SurveyQuestionsController = new SurveyQuestionsControllerClass();

router.get('/test-adgate', (req, res) => {
  console.dir(logger);
  logger.info(JSON.stringify(req.query));
  res.send(req.query);
});
router.get('/postback/:offerwall', OfferwallPostbackController.save);

router.all('/survey/:provider', SurveycallbackController.syncSurvey);

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
module.exports = {
  prefix: '/callback',
  router,
};
