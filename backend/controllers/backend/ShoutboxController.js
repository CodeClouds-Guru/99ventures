const Controller = require("./Controller");
const { Shoutbox } = require("../../models/index");

class ShoutboxController extends Controller {
    constructor() {
      super("Shoutbox");
    }
}
module.exports = ShoutboxController;