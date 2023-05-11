const { MemberNotification } = require("../../models/membernotification");
class NotificationController {
    constructor() {
        this.update = this.update.bind(this);
    }
    async update(req, res) {
        if (req.ids) {
            await MemberNotification.update({ is_read: 1 }, {
                where: {
                    id: req.ids
                }
            });
        } else {
            await MemberNotification.update({ is_read: 1 }, {
                where: {
                    member_id: req.session.user.id
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
                id: req.ids
            }
        });
        res.json({
            status: true,
            message: 'Deleted'
        })
    }
}
module.exports = NotificationController;
