const express = require('express')
const path = require('path')
const exphbs = require('express-handlebars')
const flash = require('connect-flash')
const mongoose = require('mongoose')
const helmet = require('helmet')
const compression = require('compression')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
require('dotenv').config()

const pageNotFoundHandler = require('./middlewares/notFoundError')
const varMiddleware = require('./middlewares/variables')
const userMiddleware = require('./middlewares/user')

const app = express()

const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
})
app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')

hbs.handlebars.registerHelper('ifeq',
  (a, b, options) => (a == b) ? options.fn(this) : options.inverse(this),
)

hbs.handlebars.registerHelper('inc', a => +a + 1)

const store = new MongoStore({
  collection: 'sessions',
  uri: process.env.MONGODB_URI,
})

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store,
}))
app.use(flash())
app.use(helmet({
  contentSecurityPolicy: false,
}))
app.use(compression())
app.use(userMiddleware)
app.use(varMiddleware)

app.use('/', require('./routes/main.routes'))
app.use('/aqc', require('./routes/aqc.routes'))
app.use('/qualifications', require('./routes/qualifications.routes'))
app.use('/news', require('./routes/news.routes'))
app.use('/docs', require('./routes/docs.routes'))
app.use('/contacts', require('./routes/contacts.routes'))
app.use('/manage', require('./routes/manage.routes'))
app.use('/auth', require('./routes/auth.routes'))

app.use(pageNotFoundHandler)

const PORT = process.env.PORT || 3000

async function start () {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
    })
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`))
  } catch (e) {
    console.log('Error:', e.message)
  }
}

start()