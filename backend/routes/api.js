const express = require('express')
const router = express.Router()
const AuthControllerClass = require('../controllers/backend/AuthController')
const AuthController = new AuthControllerClass()
router.get('/', (req, res) => {
  res.status(200).json({
    status: true,
    message: 'API route is working',
  })
})

router.post('/signup', AuthController.signup)
router.post('/login', AuthController.login)

module.exports = {
  prefix: '/api',
  router,
}
