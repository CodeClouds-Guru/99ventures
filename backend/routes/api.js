const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../middlewares/authMiddleware");
const checkPermissionMiddleware = require("../middlewares/CheckPermissionMiddleware");
const AuthControllerClass = require("../controllers/backend/AuthController");
const AuthController = new AuthControllerClass();

const MemberAuthControllerClass = require("../controllers/frontend/MemberAuthController");
const MemberAuthController = new MemberAuthControllerClass();

const TicketControllerClass = require("../controllers/backend/TicketController");
const TicketController = new TicketControllerClass();

const InvitationControllerClass = require("../controllers/backend/InvitationController");
const InvitationController = new InvitationControllerClass();

const FileManagerControllerClass = require("../controllers/backend/FileManagerController");
const FileManagerController = new FileManagerControllerClass();

const PageControllerClass = require("../controllers/backend/PageController");
const PageController = new PageControllerClass();

const DynamicRouteController = require("../controllers/backend/DynamicRouteController");

router.get("/", [AuthMiddleware], (req, res) => {
  const eventBus = require("../eventBus");
  let email_body = eventBus.emit("send_email", {
    action: "Invitation",
    data: {
      email: "mailto:sourabh.das@codeclouds.in",
      company_id: 1,
      company_portal_id: 1,
    },
    req: req,
  });
  res.json({ message: "API working", email_body: email_body });
});

router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.all("/member-login", MemberAuthController.login);
router.all("/member-profile", MemberAuthController.profile);
router.get("/profile", [AuthMiddleware], AuthController.profile);
router.post("/profile-update", [AuthMiddleware], AuthController.profileUpdate);
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

//check password
router.post("/check-auth", [AuthMiddleware], AuthController.checkAuth);

//change ticket read status
// router.get("/tickets/change-status", [AuthMiddleware], TicketController.changeStatus);

//testing of axios api call
router.get("/campaign-callback", [AuthMiddleware], (req, res) => {
  const axios = require("../helpers/CampaignCallbackHelper");

  let axios_class = new axios();
  let axios_callback = axios_class.makeRequest();
  console.log('axios_callback', axios_callback);
  res.json(axios_callback);
});

router.post(
  "/file-manager/download",
  [AuthMiddleware],
  FileManagerController.download
);
router.get("/pages/preview/:id?", [AuthMiddleware], PageController.preview);
router.all(
  "/:module/:action?/:id?",
  [AuthMiddleware, checkPermissionMiddleware],
  DynamicRouteController.handle
);

module.exports = {
  prefix: "/api",
  router,
};
