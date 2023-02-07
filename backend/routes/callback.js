const express = require('express');
const router = express.Router();
const logger = require('../helpers/Logger')();

const AdgateControllerClass = require('../controllers/callback/AdgateController');
const AdgateController = new AdgateControllerClass();

router.get('/test-adgate', (req, res) => {
  console.dir(logger);
  logger.info(JSON.stringify(req.query));
  res.send(req.query);
});
router.get('/postback/:offerwall', AdgateController.save);

router.all('/survey/:provider', async (req, res) => {
  const logger1 = require('../helpers/Logger')(req.params.provider);
  //   console.log('===================req', req);
  logger1.info(JSON.stringify(req.query));
  logger1.info(JSON.stringify(req.body));
  res.send(req.query);
});

router.all('/survey/outcome/:provider', async (req, res) => {
  //   console.log('===================outcome', req);
  const logger1 = require('../helpers/Logger')(
    `outcome-${req.params.provider}.log`
  );

  logger1.info(JSON.stringify(req.query));
  logger1.info(JSON.stringify(req.body));
  res.send(req.query);
});

module.exports = {
  prefix: '/callback',
  router,
};
