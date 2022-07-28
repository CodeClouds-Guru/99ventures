const express = require('express')
const router = express.Router()
const AuthMiddleware = require('../middlewares/authMiddleware')
const AuthControllerClass = require('../controllers/backend/AuthController')
const AuthController = new AuthControllerClass()
const DynamicRouteController = require('../controllers/backend/DynamicRouteController')
router.get('/', (req, res) => {
  res.json({ message: 'API working' })
})

router.post('/signup', AuthController.signup)
router.post('/login', AuthController.login)
router.get('/profile', [AuthMiddleware], AuthController.profile)
router.post('/logout', [AuthMiddleware], AuthController.logout)
router.get('/refresh-token', [AuthMiddleware], AuthController.refreshToken)
router.get('/companies', [AuthMiddleware], AuthController.getCompanyAndSites)
router.all(
  '/:module/:action?/:id?',
  [AuthMiddleware],
  DynamicRouteController.handle
)

module.exports = {
  prefix: '/api',
  router,
}
