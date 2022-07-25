const express = require('express')
const router = express.Router()
const AuthControllerClass = require('../controllers/backend/AuthController')
const AuthController = new AuthControllerClass()
const DynamicRouteController = require('../controllers/DynamicRouteController')
router.get('/', (req, res) => {
  res.json({ message: 'API working' })
})

router.post('/signup', AuthController.signup)
router.post('/login', AuthController.login)

router.all('/:module/:action?/:id?', DynamicRouteController.handle)

module.exports = {
  prefix: '/api',
  router,
}
