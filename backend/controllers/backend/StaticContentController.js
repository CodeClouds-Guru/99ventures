const Controller = require('./Controller')
const { StaticContent } = require('../../models');
class StaticContentController extends Controller {
    constructor() {
        super('StaticContent')
    }
    async list(req, res) {
        const list = await StaticContent.findAll({});
        return { status: true, data: list };
    }
    async update(req, res) {
        let id = req.params.id;
        try {
            let model = await this.model.update({
                content: req.body.content
            }, { where: { id } });
            return {
                status: true,
                message: 'Record has been updated successfully',
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = StaticContentController
