const express = require('express');
const router = express.Router();

router.get('/test-adgate', (req, res) => {
  console.log(req.query);
  res.send(req.query);
});
module.exports = {
  prefix: '/callback',
  router,
};
