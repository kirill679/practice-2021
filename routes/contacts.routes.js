const { Router } = require('express')

const router = Router()

router.get('/', (req, res) => {
  res.render('pages/contactsPage', {
    isContacts: true,
    title: 'Контакты',
  })
})

module.exports = router