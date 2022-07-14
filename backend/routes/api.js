const express = require('express')
const router = express.Router()
router.get('/', (req, res) => {
  res.status(200).json({
    status: true,
    message: 'API route is working',
  })
})

router.get('/test', (req, res) => {
  res.status(200).json({
    status: true,
    message: 'API route is working from test',
  })
})
module.exports = {
  prefix: '/api',
  router,
}
