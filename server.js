// required packages
const express = require('express')
const rowdy = require('rowdy-logger')
const cookieParser = require('cookie-parser')
const db = require('./models')

// app config
const PORT = process.env.PORT || 3000
const app = express()
app.set('view engine', 'ejs')

// middlewares
const rowdyRes = rowdy.begin(app)
app.use(require('express-ejs-layouts'))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// DIY middlewaare
// happens on every rewuest
app.use((req, res, next) => {
  // handy dandy debug request logger
  console.log(`[${ new Date().toLocaleString()}] incoming request: ${req.method} ${req.url}`)
  console.log('request-body:', req.body)
  // modify the response to give data to the routes/middleware that is 'downstream'
  res.locals.myData = 'hi i cam from a middleware'
  // tell express that the middleware is done
  next()
})

// auth middleware
 app.use( async (req, res, next) => {
   try {
     // if there is a cookie
     if (req.cookies.userId) {
       // try to find the user in the database
       const userId = req.cookies.userId
       const user = await db.user.findByPk(userId)
       // mount the found user on the res.locals so that the later routes can access the logged in user
       // any value on the res.locals is available to the layout.ejs
       res.locals.user = user
     } else {
       // the user is explicitly not logged in
       res.locals.user = null
     }
   } catch (err) {
     console.log('FIRE', err)
   } finally {
     // happens no matter what
     // go to the next route/middleware
     next()
   }
 })

// routes
app.get('/', (req, res) => {
  res.render('index')
})

// controllers
app.use('/users', require('./controllers/users'))

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  rowdyRes.print()
})
