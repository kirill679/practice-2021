const { Router } = require('express')
const auth = require('../middlewares/auth')
const admin = require('../middlewares/admin')

const router = Router()

router.get('/', auth, admin, (req, res) => {
  res.render('pages/manage', {
    isManage: true,
    title: 'Управление',
  })
})

module.exports = router