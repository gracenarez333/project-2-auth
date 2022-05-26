const express = require('express')
const router = express.Router()
const db = require('../models')

// GET /users/new -- renders a form to create a new user
router.get('/new', (req, res) => {
    res.render('users/new', { msg: null })
})

// POST /users -- creates a new user and redirects to index
router.post('/', async (req, res) => {
    try {
        // try to create the user
        // TODO: HASH password
        const [user, created] = await db.user.findOrCreate({
            where: { email: req.body.email },
            defaults: { password: req.body.password }
        })
        // if the user is new
        if (created) {
            // log them in and give cookie
            // res.cookie('cookie name, cookie data)
            // TODO: encrypt ID
            res.cookie('userId', user.id)
            // redirect to the homepage (in the future--- to profile)
            res.redirect('/')
        } else {
        // if the user was not created
        // re render the login form with a message for the user
        console.log('that email exists already')
        res.render('users/new.ejs', { msg: 'email exists in the database already:('})
        }
    } catch (err) {
        console.log('FIRE', err)
    }
})

// GET /users/login -- renders a login form
router.get('/login', (req, res) => {
    res.render('users/login', { msg: null })
})

// POST /users/login -- authenticates usser credentials against the database
router.post('/login', async (req, res) => {
    try {
        // look up the user in the db based on their email
        const foundUser = await db.user.findOne({
            where: { email: req.body.email }
        })
        const msg = 'are you sure you have an account?'
        // if the user is not found -- display the login form and give them an error message
        if (!foundUser) {
            console.log('email not found')
            res.render('users/login', { msg })
            return // do not continue with the function
        }
        // otherwise, check the provided password against the password in the db
        // hash the password from the req.body and compare it to the db password
        if (foundUser.password === req.body.password) {
            // if they match they get a cookie to log them in
            res.cookie('userId', foundUser.id)
            // TODO: redirect to profile
            res.redirect('/')
        } else {
            // if not then render the login form with a message
            res.render('users/login', { msg })
        }
    } catch (err) {
        console.log('FIREE', err)
    }
})

// GET /users/logout -- clear the cookie to log the user out
router.get('/logout', (req, res) => {
    // clear the cookie from storage and redirect to route
    res.clearCookie('userId')
    res.redirect('/')
})

// GET /users/profile -- displays users profile pagr
router.get('/profiles', (req, res) => {
    // check if user is authorized
    if (!res.locals.user) {
        res.render('users/login', { msg: 'please log in to continue' })
        return // end the route here
    }
    res.render('users/profile', { user: res.locals.user })
})

module.exports = router