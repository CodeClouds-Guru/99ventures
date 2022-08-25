const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../middlewares/authMiddleware");
const checkPermissionMiddleware = require("../middlewares/CheckPermissionMiddleware");
const AuthControllerClass = require("../controllers/backend/AuthController");
const AuthController = new AuthControllerClass();
const GeneralControllerClass = require("../controllers/backend/GeneralController");
const GeneralController = new GeneralControllerClass();
const InvitationControllerClass = require("../controllers/backend/InvitationController");
const InvitationController = new InvitationControllerClass();
const EmailConfigurationControllerClass = require("../controllers/backend/EmailConfigurationController");
const EmailConfigurationController = new EmailConfigurationControllerClass();
const DynamicRouteController = require("../controllers/backend/DynamicRouteController");
router.get("/", (req, res) => {
  res.json({ message: "API working" });
});

router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.get("/profile", [AuthMiddleware], AuthController.profile);
router.post("/logout", [AuthMiddleware], AuthController.logout);
router.get("/refresh-token", [AuthMiddleware], AuthController.refreshToken);
router.get("/companies", [AuthMiddleware], AuthController.getCompanyAndSites);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);
router.get(
  "/resend-invitation/:id",
  [AuthMiddleware],
  InvitationController.resendInvitation
);
router.post("/invitation-details", InvitationController.invitationDetails);
router.get(
  "/emailconfigurations/view",
  [AuthMiddleware],
  EmailConfigurationController.view
);
router.post(
  "/emailconfigurations/save",
  [AuthMiddleware],
  EmailConfigurationController.save
);
router.get(
  "/get-general-tab-data/",
  [AuthMiddleware],
  GeneralController.getGeneralTabData
);
router.post("/save-general-tab-data", GeneralController.saveGeneralTabData);
router.all(
  "/:module/:action?/:id?",
  [AuthMiddleware, checkPermissionMiddleware],
  DynamicRouteController.handle
);

module.exports = {
  prefix: "/api",
  router,
};
