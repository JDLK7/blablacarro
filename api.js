var express = require('express')
var bodyParser = require('body-parser')

const User = require('./app/models/User.js');
const City = require('./app/models/City.js');

var router = express.Router()
router.use(bodyParser.json())

router.get('/users', (req, res) => {
    User.fetchAll().then((result) => {
        res.status(result.status)
        res.send(result.users)
    })
})

router.post('/users', (req, res) => {
    var user = req.body
    
    if(user.login && user.password) {
        var userModel = new User(user.login, user.password)
        
        userModel.save().then((result) => {
            res.status(result.status)
            res.send(result.message)
        })
    }
    else {
        res.status(400)
        res.send('Bad request')
    }
})

router.get('/users/:login', (req, res) => {
    var login = req.params.login;

    User.find(login).then((result) => {
        res.status(result.status)
        res.send(result.user)
    }).catch((err) => {
        res.status(err.status)
        res.send(err.message)
    })
})

router.put('/users/:id', function(req, res) {

})

router.get('/cities', function(req, res) {
    City.fetchAll().then((result) => {
        res.status(result.status)
        res.send(result.cities)
    })
})

router.get('/cities/:id', function(req, res) {
    City.find(req.params.id).then((result) => {
        res.status(result.status)
        res.send(result.city)
    })

})

router.get('/journey', function(req, res) {
    
})

router.get('/journey/:id', function(req, res) {
    
})

router.post('/journey', function(req, res) {

})

router.delete('/journey/:id', function(req, res) {

})

module.exports = router