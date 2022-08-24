const { Invitation } = require('../models/index')

class InvitationHelper {
  constructor(user, current_user) {
    this.new_user = user
    this.current_user = current_user
    this.invite = this.invite.bind(this)
    this.generateToken = this.generateToken.bind(this)
    this.generateLink = this.generateLink.bind(this)
  }

  async invite() {
    var expired_at = new Date()
    expired_at.setDate(expired_at.getDate() + 1)
    let new_invitation = await Invitation.create({
      user_id: this.new_user.id,
      email: this.new_user.email,
      expired_at: expired_at,
      created_by: this.current_user.id,
    })
    const token = this.generateToken(new_invitation)
    await Invitation.update(
      { token: token },
      { where: { id: new_invitation.id } }
    )
    return this.generateLink(token)
  }

  generateToken(new_invitation) {
    let token = {
      id: this.new_user.id,
      email: this.new_user.email,
      invitation_id: new_invitation.id,
      expired_at: new_invitation.expired_at,
      company_id: this.current_user.company_id,
    }
    token = JSON.stringify(token)
    let base64data = Buffer.from(token, 'utf8')
    token = base64data.toString('base64')
    return token
  }

  generateLink(token) {
    return process.env.CLIENT_ORIGIN + '/sign-up?token=' + token
  }
}

module.exports = InvitationHelper
