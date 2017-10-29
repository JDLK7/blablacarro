var request = require('superagent');
var assert = require('assert')

var faker = require('faker')

var loginPrueba = 'Prueba'
var jwt
var userId

before('Crear usuario de prueba y loguearlo', function(done) {
    
    request
        .post('localhost:3000/api/users')
        .send({
            login: loginPrueba,
            password: "123456"
        })
        .end(function(error, response) {
            request
                .post('localhost:3000/api/login')
                .send({
                    login: loginPrueba,
                    password: "123456"
                })
                .end(function(error, response) {
                    userId = response.body.user.user._id
                    jwt = response.body.jwt
                    done()
                })  
        })
})

describe('mi suite asíncrona', function(){

    it ('lista ciudades autogeneradas correctamente', function(done) {
        request
            .get('localhost:3000/api/cities')
            .end(function(error, response) {
                assert.equal(response.status, 200)
                assert.equal(response.body.length, 10)
                assert(response.body[0].hasOwnProperty('_id'))
                assert(response.body[0].hasOwnProperty('name'))
                assert(response.body[0].hasOwnProperty('zipCode'))
                assert(response.body[0].hasOwnProperty('state'))
                assert(response.body[0].hasOwnProperty('_links'))
                
                done();
        });
    });

    it ('lista coches autogenerados correctamente', function(done) {
        request
            .get('localhost:3000/api/cars')
            .end(function(error, response) {
                assert.equal(response.status, 200)
                assert.equal(response.body.length, 10)
                assert(response.body[0].hasOwnProperty('_id'))
                assert(response.body[0].hasOwnProperty('model'))
                assert(response.body[0].hasOwnProperty('brand'))
                
                done();
        });
    });

    it ('registra usuario con coche correctamente', function(done) {
        
        let fakeName2 = faker.name.findName()

        request
            .post('localhost:3000/api/users')
            .send({
                login: fakeName2,
                password: "123456",
                car: "car1"
            })
            .end(function(error, response) {
                assert.equal(response.status, 201)
                assert.equal(response.body.message, 'User has been registered')
                assert(response.body.hasOwnProperty('user'))
                assert(response.body.user.hasOwnProperty('id'))
                assert(response.body.user.hasOwnProperty('rev'))
                assert(response.body.user.ok == true)

                let id = response.body.user.id

                assert(response.body.hasOwnProperty('_links'))
                assert.equal(response.body._links.user.href, '/api/users/' + id)
                assert.equal(response.body._links.login.href, '/api/login')

                done();
        });
    });

    it ('registra usuario sin coche correctamente', function(done) { 
        let fakeName2 = faker.name.findName()

        request
            .post('localhost:3000/api/users')
            .send({
                login: fakeName2,
                password: "123456"
            })
            .end(function(error, response) {
                assert.equal(response.status, 201)
                assert.equal(response.body.message, 'User has been registered')
                assert(response.body.hasOwnProperty('user'))
                assert(response.body.user.hasOwnProperty('id'))
                assert(response.body.user.hasOwnProperty('rev'))
                assert(response.body.user.ok == true)

                let id = response.body.user.id

                assert(response.body.hasOwnProperty('_links'))
                assert.equal(response.body._links.user.href, '/api/users/' + id)
                assert.equal(response.body._links.login.href, '/api/login')

                done();
        });
    });

    it ('loguea correctamente', function(done) {

        request
            .post('localhost:3000/api/login')
            .send({
                login: loginPrueba,
                password: "123456"
            })
            .end(function(error, response) {
                assert.equal(response.status, 200)

                assert(response.body.hasOwnProperty('ok'))
                assert(response.body.hasOwnProperty('jwt'))
                assert(response.body.hasOwnProperty('user'))
                
                done();
        });
    });

    it ('lista usuarios correctamente', function(done) {
        request
            .get('localhost:3000/api/users')
            .end(function(error, response) {
                assert.equal(response.status, 200)
                assert(response.body.length > 0)
                assert(response.body[0].hasOwnProperty('_id'))
                assert(response.body[0].hasOwnProperty('login'))
                assert(response.body[0].hasOwnProperty('_links'))
                assert(response.body[0]._links.hasOwnProperty('user'))
                assert.equal(response.body[0]._links.user.href, '/api/users/'+response.body[0]._id)
                
                done();
        });
    });

    it ('recupera detalles usuario correctamente', function(done) {
        request
            .get('localhost:3000/api/users/'+userId)
            .set('Authorization', 'Bearer '+jwt)
            .end(function(error, response) {
                assert.equal(response.status, 200)
                assert.equal(response.body.type, 'user')
                assert(response.body.hasOwnProperty('login'))
                assert(response.body.hasOwnProperty('car'))
                assert(response.body.hasOwnProperty('_id'))
                assert(response.body.hasOwnProperty('_rev'))
                assert(response.body.hasOwnProperty('_links'))
                assert(response.body._links.hasOwnProperty('journeys'))
                assert.equal(response.body._links.journeys.href, '/api/users/'+userId+'/journeys')
                
                done();
        });
    });

    it ('recupera detalles ciudad correctamente', function(done) {
        let cityId = 'city0'

        request
            .get('localhost:3000/api/cities/'+cityId)
            .end(function(error, response) {
                assert.equal(response.status, 200)

                assert(response.body.hasOwnProperty('_id'))
                assert(response.body.hasOwnProperty('name'))
                assert(response.body.hasOwnProperty('zipCode'))
                assert(response.body.hasOwnProperty('state'))
                assert(response.body.hasOwnProperty('_links'))
                assert.equal(response.body._links.journeys.href, '/api/cities/'+cityId+'/journeys')

                done();
        });
    });

    it ('registra viaje correctamente', function(done) {

        request
            .post('localhost:3000/api/journeys')
            .set('Authorization', 'Bearer '+jwt)
            .send({
                cities: [
                    'city0',
                    'city1'
                ],
                driver: userId,
                occupants: [
                    userId	
                ],
                price: 20
            })
            .end(function(error, response) {
                assert.equal(response.status, 201)
                assert.equal(response.body.message, 'Journey has been registered')
                assert(response.body.journey.hasOwnProperty('id'))
                assert(response.body.journey.hasOwnProperty('rev'))
                assert(response.body.journey.ok == true)

                let id = response.body.journey.id

                assert(response.body.hasOwnProperty('_links'))
                assert.equal(response.body._links.journey.href, '/api/journeys/' + id)

                done();
        });
    });

    it ('recupera detalles viaje correctamente', function(done) {
        let occupant = faker.name.findName()
        
        request
            .post('localhost:3000/api/users')
            .send({
                login: occupant,
                password: "123456"
            })
            .end(function(error, response) {
                let occupantId = response.body.user.id
                request
                    .post('localhost:3000/api/journeys')
                    .set('Authorization', 'Bearer '+jwt)
                    .send({
                        cities: [
                            'city0',
                            'city1'
                        ],
                        driver: userId,
                        occupants: [
                            occupantId	
                        ],
                        price: 20
                })
                .end(function(error, response) {
                    let journeyId = response.body.journey.id
        
                    request
                        .get('localhost:3000/api/journeys/'+journeyId)
                        .set('Authorization', 'Bearer '+jwt)
                        .end(function(error, response) {
                            assert.equal(response.status, 200)
                            assert(response.body.hasOwnProperty('_id'))
                            assert(response.body.hasOwnProperty('occupants'))
                            assert(response.body.occupants.length > 0)
                            assert(response.body.hasOwnProperty('price'))
                            
                            done();
                    });
                })  
            })
    });

    it ('lista viajes correctamente', function(done) {
        request
            .get('localhost:3000/api/journeys')
            .set('Authorization', 'Bearer '+jwt)
            .end(function(error, response) {
                assert.equal(response.status, 200)

                assert(response.body[0].hasOwnProperty('_id'))
                assert(response.body[0].hasOwnProperty('departureCity'))
                assert(response.body[0].hasOwnProperty('destinationCity'))
                assert(response.body[0].hasOwnProperty('occupants'))
                assert(response.body[0].hasOwnProperty('price'))

                done();
        });
    });

    it ('lista viajes de una ciudad correctamente', function(done) {
        let cityId = 'city0'

        request
            .get('localhost:3000/api/cities/'+cityId+'/journeys')
            .set('Authorization', 'Bearer '+jwt)
            .end(function(error, response) {
                assert.equal(response.status, 200)

                assert(response.body[0].hasOwnProperty('_id'))
                assert(response.body[0].hasOwnProperty('departureCity'))
                assert(response.body[0].hasOwnProperty('destinationCity'))
                assert(response.body[0].hasOwnProperty('occupants'))
                assert(response.body[0].hasOwnProperty('price'))

                done();
        });
    });

    it ('lista viajes de un usuario correctamente', function(done) {
        request
            .get('localhost:3000/api/users/'+userId+'/journeys')
            .set('Authorization', 'Bearer '+jwt)
            .end(function(error, response) {
                assert.equal(response.status, 200)

                assert(response.body[0].hasOwnProperty('_id'))
                assert(response.body[0].hasOwnProperty('departureCity'))
                assert(response.body[0].hasOwnProperty('destinationCity'))
                assert(response.body[0].hasOwnProperty('occupants'))
                assert(response.body[0].hasOwnProperty('price'))

                done();
        });
    });

    it ('borra viajes correctamente', function(done) {
        let occupant = faker.name.findName()
        
        request
            .post('localhost:3000/api/journeys')
            .set('Authorization', 'Bearer '+jwt)
            .send({
                cities: [
                    'city0',
                    'city1'
                ],
                driver: userId,
                occupants: [
                    userId	
                ],
                price: 20
            })
            .end(function(error, response) {
                let journeyId = response.body.journey.id

                request
                    .delete('localhost:3000/api/journeys/'+journeyId)
                    .set('Authorization', 'Bearer '+jwt)
                    .end(function(error, response) {
                        assert.equal(response.status, 204)
                        request
                            .get('localhost:3000/api/journeys/'+journeyId)
                            .set('Authorization', 'Bearer '+jwt)
                            .end(function(error, response) {
                                    assert.equal(response.status, 404)
                                    
                                    done();
                            });
                });
            })  
    });
})