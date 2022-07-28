const { User, Company } = require('../models')
const jwt = require('jsonwebtoken')

module.exports = async function (req, res, next) {
  let token = req.headers.authorization || ''
  token = token.replace('Bearer ', '')
  if (token.trim().length === 0) {
    return res.status(401).json({ message: 'Auth Error' })
  }
  try {
    const decoded = jwt.verify(token, process.env.APP_SECRET)
    const decoded_user = decoded.user
    let user = await User.findOne({
      where: {
        id: decoded_user.id,
      },
      // include: [
      //   {
      //     model: Company,
      //   },
      // ],
    })
    if (user) {
      req.user = user
      next()
    } else {
      return res
        .status(401)
        .json({ message: 'Sorry! your account has been blocked' })
    }
  } catch (e) {
    console.error(e)
    res.status(401).send({ message: 'Invalid Token' })
  }
}
