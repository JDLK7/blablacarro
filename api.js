var express = require('express')
var bodyParser = require('body-parser')

var jwt = require('jwt-simple')
var moment = require('moment')

const User = require('./app/models/User.js')
const City = require('./app/models/City.js')
const Journey = require('./app/models/Journey.js')
const Car = require('./app/models/Car.js')

var router = express.Router()
router.use(bodyParser.json())

const secret = 'Yc9I5#sKJPY*WSZiaq7w'

function checkToken(authHeader) {

    var token = authHeader.split(' ')[1]

    jwt.decode(token, secret)
}

/**
 * @swagger
 * /api/login:
 *   post:
 *     description: Login de la aplicación.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: login
 *         description: Nombre de usuario y contraseña para iniciar sesion.
 *         in: body
 *         required: true
 *         schema:
 *           properties:
 *             login:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       200:
 *         description: Login correcto.
 *       401:
 *         description: Usuario o contraseña incorrectos.
 */
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

/**
 * @swagger
 * /api/users:
 *  get:
 *    description: Listado de usuarios registrados.
 *    produces: 
 *      - application/json
 *    responses:
 *      200:
 *        description: Se listan los usuarios correctamente.
 *      500:
 *        description: Se ha producido al recuperar los usuarios de la BD.
 */
router.get('/users', (req, res) => {
    User.fetchAll().then(result => {
        var response = []

        result.users.forEach(user => {
            user._links = {
                user: {
                    href: '/api/users/'+user._id
                }
            }
            response.push(user)
        })

        res.status(result.status)
        res.send(response)
    }).catch(err => {
        res.status(500)
        res.send(err)
    })
})

/**
 * @swagger
 * /api/users:
 *   post:
 *     description: Creación de usuario nuevo.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: login
 *         description: Nombre de usuario y contraseña para crear el usuario.
 *         in: body
 *         required: true
 *         type: string
 *         schema:
 *           properties:
 *             login:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       201:
 *         description: Usuario creado correctamente.
 *       400:
 *         description: Petición erronea.
 *       409:
 *         description: El usuario ya existe.
 */
router.post('/users', (req, res) => {
    var user = req.body
    
    if(user.login && user.password) {

        Car.find(user.car).then(carResult => {
            var userModel = new User(user.login, user.password, carResult.car)
            
            userModel.save().then(result => {
                var response = result.body;
                response._links = {
                    user: {
                        href: '/api/users/' + response.user.id
                    },
                    login: {
                        href: '/api/login'
                    }
                }

                res.status(result.status)
                res.send(result.body)
            }).catch(err => {
                res.status(err.status)
                res.send(err.message)
            })
        })
    }
    else {
        res.status(400)
        res.send('Bad request')
    }
})

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     description: Recupera la información de un usuario.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: ID del usuario.
 *         in: path
 *         required: true
 *         type: string
 *       - name: Authorization
 *         description: JSON web token
 *         in: header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Usuario encontrado.
 *       401:
 *         description: Error de autenticación.
 *       404:
 *         description: Usuario no encontrado.
 */
router.get('/users/:id', (req, res) => {
    var id = req.params.id

    try {
        checkToken(req.header('Authorization'))
    }
    catch(error) {
        res.status(401)
        console.log(error)
        res.send('Invalid token')
    }

    User.find(id).then(result => {
        result.user._links = {
            journeys: {
                href: '/api/users/'+result.user._id+'/journeys'
            },
        }

        res.status(result.status)
        res.send(result.user)
    }).catch(err => {
        res.status(err.status)
        res.send({
            message: err.message
        })
    })
})

/**
 * @swagger
 * /api/users/{id}/journeys:
 *   get:
 *     description: Listado de los viajes publicados por un usuario.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: ID del usuario.
 *         in: path
 *         required: true
 *         type: string
 *       - name: Authorization
 *         description: JSON web token
 *         in: header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Se listan los viajes del usuario correctamente.
 *       401:
 *         description: Error de autenticación.
 */
router.get('/users/:id/journeys', (req, res) => {
    var id = req.params.id
    
    try {
        checkToken(req.header('Authorization'))
    }
    catch(error) {
        res.status(401)
        console.log(error)
        res.send('Invalid token')
    }

    Journey.getDriverJourneys(id).then(result => {
        res.status(result.status)
        res.send(result.journeys)
    }).catch(err => {
        res.status(400)
        res.send(err.message)
    })
})

/**
 * @swagger
 * /api/cities:
 *  get:
 *    description: Listado de ciudades autogeneradas.
 *    produces: 
 *      - application/json
 *    responses:
 *      200:
 *        description: Se listan las ciudades correctamente.
 *      500:
 *        description: Se ha producido al recuperar las ciudades de la BD.
 */
router.get('/cities', (req, res) => {
    City.fetchAll().then(result => {
        var response = []

        result.cities.forEach(city => {
            city._links = {
                city: {
                    href: '/api/cities/'+city._id
                }
            }
            response.push(city)
        })

        res.status(result.status)
        res.send(result.cities)
    }).catch(err => {
        res.status(err.status)
        res.send(err.message)
    })
})

/**
 * @swagger
 * /api/cities/{id}:
 *   get:
 *     description: Recupera la información de una ciudad.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: ID de la ciudad.
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Ciudad encontrada.
 *       404:
 *         description: Ciudad no encontrado.
 */
router.get('/cities/:id', (req, res) => {
    City.find(req.params.id).then(result => {
        result.city._links = {
            journeys: {
                href: '/api/cities/' + result.city._id + '/journeys'
            },
        }

        res.status(result.status)
        res.send(result.city)
    }).catch(err => {
        res.status(err.status)
        res.send({
            message: err.message
        })
    })
})

/**
 * @swagger
 * /api/cities/{id}/journeys:
 *   get:
 *     description: Listado de los viajes publicados que pasan por una ciudad.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: ID de la ciudad.
 *         in: path
 *         required: true
 *         type: string
 *       - name: Authorization
 *         description: JSON web token
 *         in: header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Se listan los viajes de la ciudad correctamente.
 *       401:
 *         description: Error de autenticación.
 */
router.get('/cities/:id/journeys', (req, res) => {
    var id = req.params.id

    try {
        checkToken(req.header('Authorization'))
    }
    catch(error) {
        res.status(401)
        console.log(error)
        res.send('Invalid token')
    }

    Journey.getCityJourneys(id).then(result => {
        res.status(result.status)
        res.send(result.journeys)
    }).catch(err => {
        res.status(400)
        res.send(err.message)
    })
})

/**
 * @swagger
 * /api/cars:
 *  get:
 *    description: Listado de carros autogeneradas.
 *    produces: 
 *      - application/json
 *    responses:
 *      200:
 *        description: Se listan los carros correctamente.
 *      500:
 *        description: Se ha producido al recuperar los carros de la BD.
 */
router.get('/cars', (req, res) => {
    Car.fetchAll().then(result => {
        res.status(result.status)
        res.send(result.cars)
    }).catch(err => {
        res.status(err.status)
        res.send(err.message)
    })
})

/**
 * @swagger
 * /api/journeys:
 *  get:
 *    description: Listado de todos los viajes.
 *    produces: 
 *      - application/json
 *    parameters:
 *       - name: Authorization
 *         description: JSON web token
 *         in: header
 *         required: true
 *         type: string
 *    responses:
 *      200:
 *        description: Se listan las ciudades correctamente.
 *      401:
 *        description: Error de autenticación.
 *      500:
 *        description: Se ha producido al recuperar los usuarios de la BD.
 */
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

/**
 * @swagger
 * /api/journeys/{id}:
 *   get:
 *     description: Recupera la información de un viaje.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: ID del viaje.
 *         in: path
 *         required: true
 *         type: string
 *       - name: Authorization
 *         description: JSON web token
 *         in: header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Viaje encontrado.
 *       401:
 *         description: Error de autenticación.
 *       404:
 *         description: Viaje no encontrado.
 */
router.get('/journeys/:id', (req, res) => {

    try {
        checkToken(req.header('Authorization'))
    }
    catch(error) {
        res.status(401)
        res.send('Invalid token')
    }

    Journey.find(req.params.id).then(result => {
        if(!result.journey) {
            res.status(404)
            res.send({
                message: 'Journey does not exist'
            })
        }
        res.status(result.status)
        res.send(result.journey)
    })
})

/**
 * @swagger
 * /api/journeys:
 *   post:
 *     description: Creación de un viaje nuevo.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: data
 *         description: Datos del viaje a crear.
 *         in: body
 *         required: true
 *         schema:
 *           properties:
 *             cities:
 *               type: array
 *             driver:
 *               type: string
 *             occupants:
 *               type: array
 *             price:
 *               type: integer
 *       - name: Authorization
 *         description: JSON web token
 *         in: header
 *         required: true
 *         type: string
 *     responses:
 *       201:
 *         description: Viaje creado correctamente.
 *       401:
 *         description: Error de autenticación.
 *       400:
 *         description: Faltan datos para crear el viaje.
 */
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
                
                delete result.status
                result.message = 'Journey has been registered'
                result._links = {
                    journey: {
                        href: '/api/journeys/' + result.journey.id
                    }
                }

                res.send(result)
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

/**
 * @swagger
 * /api/journeys/{id}:
 *   delete:
 *     description: Borrado de un viaje.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: ID del viaje.
 *         in: path
 *         required: true
 *         type: string
 *       - name: Authorization
 *         description: JSON web token
 *         in: header
 *         required: true
 *         type: string
 *     responses:
 *       204:
 *         description: Viaje borrado correctamente.
 *       401:
 *         description: Error de autenticación.
 */
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