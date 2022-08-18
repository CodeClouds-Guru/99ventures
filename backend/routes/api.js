const express = require('express')
const router = express.Router()
const AuthMiddleware = require('../middlewares/authMiddleware')
const checkPermissionMiddleware = require('../middlewares/CheckPermissionMiddleware')
const AuthControllerClass = require('../controllers/backend/AuthController')
const AuthController = new AuthControllerClass()
const InvitationController = require('../controllers/backend/InvitationController')
// const InvitationController = new InvitationControllerClass()
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
router.post('/forgot-password', AuthController.forgotPassword)
router.post('/reset-password', AuthController.resetPassword)
router.post(
  '/send-invitation',
  [AuthMiddleware],
  InvitationController.sendInvitation
)
router.get(
  '/resend-invitation/:id',
  [AuthMiddleware],
  InvitationController.resendInvitation
)
router.all(
  '/:module/:action?/:id?',
  [AuthMiddleware, checkPermissionMiddleware],
  DynamicRouteController.handle
)

module.exports = {
  prefix: '/api',
  router,
}
