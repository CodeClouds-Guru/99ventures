const express = require('express');
const router = express.Router();
const logger = require("../helpers/Logger")();

router.get('/test-adgate', (req, res) => {
  console.dir(logger);
  logger.info(
    JSON.stringify(req.query)
  );
  res.send(req.query);
});
module.exports = {
  prefix: '/callback',
  router,
};
