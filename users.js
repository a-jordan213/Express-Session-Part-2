const express = require('express');
const User = require('../models/user'); //to user

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => { //the slash sign up path
    User.findOne({username: req.body.username}) //what do want for new user? check to see if username taken
    .then(user => {
        if (user) {
            const err = new Error(`User ${req.body.username} already exists!`); //in use
            err.status = 403; //
            return next(err);
        } else { //falsy, null or undef so can create, will learn how to create admins later
            User.create({
                username: req.body.username,
                password: req.body.password})
            .then(user => { 
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({status: 'Registration Successful!', user: user}); //user doc
            })
            .catch(err => next(err)); //for catching any errs
        }
    })
    .catch(err => next(err)); //for the findone rejected promise, it means something went wrong with the search and pass it along the err handler
}); //client side is good, if no errs

router.post('/login', (req, res, next) => { //will need the same, to check session
    if(!req.session.user) { //from the app.js file in side this if block, but with changes
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            const err = new Error('You are not authenticated!');
            res.setHeader('WWW-Authenticate', 'Basic');
            err.status = 401;
            return next(err);
        }
      
        const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        const username = auth[0];
        const password = auth[1];
      
        User.findOne({username: username}) //checking docs in databsae to match username/paswd
        .then(user => {
            if (!user) { //if not user exist can say:
                const err = new Error(`User ${username} does not exist!`);
                err.status = 401;
                return next(err);
            } else if (user.password !== password) { //matching username but pswd is incorrect
                const err = new Error('Your password is incorrect!');
                err.status = 401;
                return next(err);
            } else if (user.username === username && user.password === password) { //to double check to be sure, for sure
                req.session.user = 'authenticated';
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('You are authenticated!') //closing the 
            }
        })
        .catch(err => next(err)); //
    } else { //for current session for login
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are already authenticated!');
    }
});

router.get('/logout', (req, res, next) => { //one final thing, hey im out
    if (req.session) { //deleting session 
        req.session.destroy();
        res.clearCookie('session-id'); //in app.js used. clear cookie
        res.redirect('/'); //to redirect to the root path local host 3000/
    } else {
        const err = new Error('You are not logged in!'); //trhying to log out without being logged in
        err.status = 401;
        return next(err);
    }
});

module.exports = router;