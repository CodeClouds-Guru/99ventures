const { MemberNotification } = require("../../models");
class NotificationController {
    constructor() {
        this.update = this.update.bind(this);
    }
    async update(req, res) {
        if (req.body.ids) {
            await MemberNotification.update({ is_read: 1 }, {
                where: {
                    id: req.body.ids
                }
            });
        } else {
            await MemberNotification.update({ is_read: 1 }, {
                where: {
                    member_id: req.body.member_id
                }
            });
        }
        res.json({
            status: true,
            message: 'Marked as read'
        })
    }
    async delete(req, res) {
        await MemberNotification.destroy({
            where: {
                id: req.body.ids
            }
        });
        res.json({
            status: true,
            message: 'Deleted'
        })
    }
}
module.exports = NotificationController;
