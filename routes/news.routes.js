const { Router } = require('express')
const News = require('../models/News.model')
const auth = require('../middlewares/auth')
const admin = require('../middlewares/admin')

const router = Router()

router.get('/', async (req, res) => {
  const news = await News.find().lean()
  news.sort((a, b) => b.dateAdded - a.dateAdded)

  res.render('pages/news/newsPage', {
    isNews: true,
    title: 'Новости',
    news,
  })
})

router.get('/id/:id', async (req, res) => {
  const singleNews = await News.findById(req.params.id).lean()

  if (!singleNews) {
    return res.redirect('/news')
  }

  const otherNews = await News.find({ _id: { $ne: req.params.id } }).lean()
  otherNews.sort((a, b) => b.dateAdded - a.dateAdded)
  otherNews.length = Math.min(otherNews.length, 3)

  res.render('pages/news/singleNewsPage', {
    isNews: true,
    title: 'Новости',
    singleNews,
    otherNews,
  })
})

router.get('/id/:id/edit', auth, admin, async (req, res) => {
  const news = await News.findById(req.params.id).lean()

  if (!news) {
    return res.render('/news')
  }

  res.render('pages/news/editNewsPage', {
    isNews: true,
    title: 'Новости',
    news,
  })
})

router.post('/edit', auth, admin, async (req, res) => {
  const { id } = req.body
  delete req.body.id
  await News.findByIdAndUpdate(id, req.body)
  return res.redirect('/news')
})

router.get('/add', auth, admin, (req, res) => {
  res.render('pages/news/addNewsPage', {
    isNews: true,
    title: 'Новости',
  })
})

router.post('/add', auth, admin, async (req, res) => {
  try {
    const { title, imgUrl, text } = req.body

    const news = new News({ title, imgUrl, text, dateAdded: new Date() })
    await news.save()
    return res.redirect('/news')
  } catch (e) {
    console.log(e)
  }
})

router.post('/delete', auth, admin, async (req, res) => {
  try {
    await News.deleteOne({ _id: req.body.id })
    return res.redirect('/news')
  } catch (e) {
    console.log(e)
  }
})

module.exports = router