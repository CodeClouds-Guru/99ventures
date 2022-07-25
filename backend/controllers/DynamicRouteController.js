const pluralize = require("pluralize");
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
class DynamicRouteController {
  async handle(req, res) {
    try {
      var module = req.params.module;
      var action = req.params.action || "list";
      let moduleInSingular = pluralize.singular(module);
      moduleInSingular = capitalizeFirstLetter(moduleInSingular);
      let controller = require("./" + moduleInSingular + "Controller");
      let result = await controller[action](req, res);
      res.json({ results: result });
    } catch (error) {
      res.status(500).json({
        message: error.message,
        trace: error.stack,
      });
    }
  }
}

module.exports = new DynamicRouteController();
