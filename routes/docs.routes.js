const { Router } = require('express')
const router = Router()

router.get('/', (req, res) => {
  res.render('pages/docsPage', {
    isDocs: true,
    title: 'Документы',
  })
})

module.exports = router