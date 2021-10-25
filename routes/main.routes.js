const { Router } = require('express')
const News = require('../models/News.model')
const router = Router()

router.get('/', async (req, res) => {
  const news = await News.find().lean()
  news.sort((a, b) => b.dateAdded - a.dateAdded)
  news.length = Math.min(news.length, 5)

  res.render('pages/mainPage', {
    isMain: true,
    title: 'Главная',
    news,
  })
})

module.exports = router