const express = require('express')
const router = express.Router()
const AuthMiddleware = require('../middlewares/authMiddleware')
const checkPermissionMiddleware = require('../middlewares/CheckPermissionMiddleware')
const AuthControllerClass = require('../controllers/backend/AuthController')
const AuthController = new AuthControllerClass()
const GeneralControllerClass = require('../controllers/backend/GeneralController')
const GeneralController = new GeneralControllerClass()
const InvitationControllerClass = require('../controllers/backend/InvitationController')
const InvitationController = new InvitationControllerClass()
const EmailConfigurationControllerClass = require('../controllers/backend/EmailConfigurationController')
const EmailConfigurationController = new EmailConfigurationControllerClass()
const DynamicRouteController = require('../controllers/backend/DynamicRouteController')
const IpConfigurationControllerClass = require('../controllers/backend/IpConfigurationController')
const IpConfigurationController = new IpConfigurationControllerClass()
const PaymentMethodControllerClass = require('../controllers/backend/PaymentMethodController')
const PaymentMethodController = new PaymentMethodControllerClass()
router.get('/', (req, res) => {
  res.json({ message: 'API working' })
})

router.post('/signup', AuthController.signup)
router.post('/login', AuthController.login)
router.get('/profile', [AuthMiddleware], AuthController.profile)
router.post('/profile-update', [AuthMiddleware], AuthController.profileUpdate)
router.post('/logout', [AuthMiddleware], AuthController.logout)
router.get('/refresh-token', [AuthMiddleware], AuthController.refreshToken)
router.get('/companies', [AuthMiddleware], AuthController.getCompanyAndSites)
router.post('/forgot-password', AuthController.forgotPassword)
router.post('/reset-password', AuthController.resetPassword)
router.get(
  '/resend-invitation/:id',
  [AuthMiddleware],
  InvitationController.resendInvitation
)
router.post('/invitation-details', InvitationController.invitationDetails)
router.get(
  '/emailconfigurations/view',
  [AuthMiddleware],
  EmailConfigurationController.view
)
router.post(
  '/emailconfigurations/save',
  [AuthMiddleware],
  EmailConfigurationController.save
)
router.get(
  '/get-general-tab-data/',
  [AuthMiddleware],
  GeneralController.getGeneralTabData
)
router.post(
  '/save-general-tab-data',
  [AuthMiddleware],
  GeneralController.saveGeneralTabData
)
router.get(
  '/ip-downtime-settings',
  [AuthMiddleware],
  IpConfigurationController.getIpDowntimeSettings
)
router.post(
  '/ip-downtime-update',
  [AuthMiddleware],
  IpConfigurationController.updateIpDowntimeData
)
router.get(
  '/ip-configurations',
  [AuthMiddleware],
  IpConfigurationController.list
)
router.post(
  '/ip-configurations/save',
  [AuthMiddleware],
  IpConfigurationController.save
)

router.get(
  '/payment-methods',
  [AuthMiddleware],
  PaymentMethodController.list
)
router.post(
  '/payment-methods/update',
  [AuthMiddleware],
  PaymentMethodController.update
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
