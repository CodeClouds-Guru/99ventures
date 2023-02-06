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

router.get('/survey/:provider', async (req, res) => {
  console.dir(logger);
  logger.info(JSON.stringify(req));
  res.send(req.query);
});

module.exports = {
  prefix: '/callback',
  router,
};
