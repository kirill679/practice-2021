const { Router } = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/User.model')

const router = Router()

router.get('/login', (req, res) => {
  res.render('pages/auth/login', {
    layout: 'noFooter',
    isLogin: true,
    title: 'Авторизация',
    loginError: req.flash('loginError'),
    registerError: req.flash('registerError'),
  })
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const candidate = await User.findOne({ email })

    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password)

      if (areSame) {
        req.session.user = candidate
        req.session.isAuthenticated = true
        req.session.save(err => {
          if (err) {
            throw err
          }
          res.redirect('/')
        })
      } else {
        req.flash('loginError', 'Неверный пароль')
        return res.redirect('/auth/login')
      }
    } else {
      req.flash('loginError', 'Такого пользователя не существует')
      return res.redirect('/auth/login')
    }
  } catch (e) {
    console.log(e)
  }
})

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    const candidate = await User.findOne({ email })

    if (candidate) {
      req.flash('error', 'Пользователь с таким email уже существует')
      return res.redirect('/auth/login#register')
    } else {
      const hashPassword = await bcrypt.hash(password, 10)

      const user = new User({
        name,
        email,
        password: hashPassword,
        isAdmin: false,
        qualifications: [],
        passedTests: [],
        passedExams: [],
      })

      await user.save()
      return res.redirect('/auth/login')
    }
  } catch (e) {
    console.log(e)
  }
})

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login')
  })
})

module.exports = router