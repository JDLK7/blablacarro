var express = require('express')
var bodyParser = require('body-parser')
var crypto = require('crypto')

var PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'));

var db = new PouchDB('blablacarro')

var router = express.Router()
router.use(bodyParser.json())

function validateRegisterData(login, password) {

}

router.get('/users', function(req, res) {
    db.find({
        selector: { type: 'user'},
        fields: ['_id', 'login']
    }).then(function (result) {
        res.status(200)
        res.send(result)
    }).catch(function (err) {
        console.log(err);
    })
})

router.post('/users', function(req, res) {
    var user = req.body;

    db.get(user.login).then(function (doc) {
        res.status(409)
        res.send("User already registered")
    }).catch(function (err) {
        db.post({
            type: 'user',
            login: user.login,
            password: crypto.createHash('sha256').update(user.password).digest('hex'),
        }).then(function (response) {
            res.status(201)
            res.send("User correctly registered")
        }).catch(function (err) {
            console.log(err)
        })
    })
})

router.get('/users/:id', function(req, res) {
    
})

router.put('/users/:id', function(req, res) {

})

router.get('/cities', function(req, res) {

})

router.get('/cities/:id', function(req, res) {
    
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