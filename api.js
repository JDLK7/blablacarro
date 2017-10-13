var express = require('express')
var bodyParser = require('body-parser')

var jwt = require('jwt-simple')
var moment = require('moment')

const User = require('./app/models/User.js')
const City = require('./app/models/City.js')
const Journey = require('./app/models/Journey.js')

var router = express.Router()
router.use(bodyParser.json())

const secret = 'Yc9I5#sKJPY*WSZiaq7w'

function checkToken(authHeader) {

    var token = authHeader.split(' ')[1]

    jwt.decode(token, secret)
}

router.post('/login', (req, res) => {
    var data = req.body

    console.log(req.headers)

    User.checkAuthentication(data.login, data.password).then(result => {
        if(result.ok !== true) {
            res.status(401)
            res.send('Incorrect user or password')
        }
        else {
            var payload = {
                login: data.login,
                exp: moment().add(7, 'days').valueOf()
            }

            var token = jwt.encode(payload, secret)
            User.findByLogin(data.login).then(user => {
                res.status(200)
                res.send({
                    ok: true,
                    jwt: token,
                    user: user
                })
            })
        }
    })
})

router.get('/users', (req, res) => {
    User.fetchAll().then(result => {
        res.status(result.status)
        res.send(result.users)
    }).catch(err => {
        res.status(500)
        res.send(err)
    })
})

router.post('/users', (req, res) => {
    var user = req.body
    
    if(user.login && user.password) {
        var userModel = new User(user.login, user.password)
        
        userModel.save().then(result => {
            res.status(result.status)
            res.send(result.message)
        }).catch(err => {
            res.status(err.status)
            res.send(err.message)
        })
    }
    else {
        res.status(400)
        res.send('Bad request')
    }
})

router.get('/users/:id', (req, res) => {
    var id = req.params.id

    User.find(id).then(result => {
        res.status(result.status)
        res.send(result.user)
    }).catch(err => {
        res.status(err.status)
        res.send(err.message)
    })
})

router.get('/cities', (req, res) => {
    City.fetchAll().then(result => {
        res.status(result.status)
        res.send(result.cities)
    }).catch(err => {
        res.status(err.status)
        res.send(err.message)
    })
})

router.get('/cities/:id', (req, res) => {
    City.find(req.params.id).then(result => {
        res.status(result.status)
        res.send(result.city)
    })
})

router.get('/journeys', (req, res) => {
    
    try {
        checkToken(req.header('Authorization'))
    }
    catch(error) {
        res.status(401)
        console.log(error)
        res.send('Invalid token')
    }

    Journey.fetchAll().then(result => {
        res.status(result.status)
        res.send(result.journeys)
    })
})

router.get('/journeys/:id', (req, res) => {

    try {
        checkToken(req.header('Authorization'))
    }
    catch(error) {
        res.status(401)
        res.send('Invalid token')
    }

    Journey.find(req.params.id).then(result => {
        res.status(result.status)
        res.send(result.journey)
    })
})

router.post('/journeys', (req, res) => {
    var data = req.body

    try {
        checkToken(req.header('Authorization'))
    }
    catch(error) {
        res.status(401)
        res.send('Invalid token')
    }

    if(Array.isArray(data.cities) && Array.isArray(data.occupants) && 
        typeof data.driver !== 'undefined' && typeof data.price !== 'undefined') {
        
        //Se comprueba que los datos de los que depende el viaje existan
        var promises = []
        data.cities.forEach(cityId => {
            promises.push(City.find(cityId))
        })
        data.occupants.forEach(occupantId => {
            promises.push(User.find(occupantId))
        })
        promises.push(User.find(data.driver))

        Promise.all(promises).then(() => {
            var journey = new Journey(
                data.cities,
                data.driver,
                data.occupants,
                data.price
            )
    
            journey.save().then(result => {
                res.status(result.status)
                res.send(result.journey)
            }).catch(err => {
                res.status(err.status)
                res.send(err.message)
            })
        }).catch(err => {
            console.log(err)

            res.status(400)
            res.send('Bad request')
        })
    }
    else {
        res.status(400)
        res.send('Bad request')
    }
})

router.delete('/journeys/:id', (req, res) => {
    var id = req.params.id

    try {
        checkToken(req.header('Authorization'))
    }
    catch(error) {
        res.status(401)
        res.send('Invalid token')
    }

    if(id) {
        Journey.delete(id).then(result => {
            res.status(result.status)
            res.send(result.message)
        }).catch(err => {
            res.status(err.status)
            res.send(err.message)
        })
    }
    else {
        res.status(400)
        res.send('Bad request')
    }
})

router.put('/journey/:id', (req, res) => {
    var id = req.params.id
    var data = req.body

    try {
        checkToken(req.header('Authorization'))
    }
    catch(error) {
        res.status(401)
        res.send('Invalid token')
    }

    if(id) {
        Journey.update(id, data).then(result => {
            res.status(result.status)
            res.send(result.journey)
        })
    }
    else {
        res.status(400)
        res.send('Bad request')
    }
})

module.exports = router