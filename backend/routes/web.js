const express = require('express')
const router = express.Router()
router.get('/', (req, res) => {
  res.status(200).send('99ventures backend')
})

router.get('/test', async (req, res) => {
  const { Permission } = require('../models')
  let permissions = await Permission.findAll({
    where: {},
    attributes: ['id'],
  })
  permissions = permissions.map((item) => {
    return { permission_id: item.id, role_id: 1 }
  })
  res.send(permissions)
})
module.exports = {
  prefix: '/',
  router,
}
