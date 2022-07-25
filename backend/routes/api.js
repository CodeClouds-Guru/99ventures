const express = require("express");
const router = express.Router();
const DynamicRouteController = require("../controllers/DynamicRouteController");
router.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    message: "API route is working",
  });
});

router.get("/test", (req, res) => {
  res.status(200).json({
    status: true,
    message: "API route is working from test",
  });
});

router.all("/:module/:action?/:id?", DynamicRouteController.handle);

module.exports = {
  prefix: "/api",
  router,
};
