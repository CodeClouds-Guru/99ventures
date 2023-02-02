const Controller = require("./Controller");
const { ShoutboxConfiguration } = require("../../models/index");

class ShoutboxConfigurationController extends Controller {
    constructor() {
      super("ShoutboxConfiguration");
    }
}
module.exports = ShoutboxConfigurationController;