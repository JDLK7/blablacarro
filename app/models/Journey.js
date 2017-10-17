var PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
var db = new PouchDB('blablacarro')

var crypto = require('crypto')

const User = require('./User.js');

class Journey {
    constructor(cities, driver, occupants, price) {
        this.cities = cities
        this.driver = driver
        this.occupants = occupants
        this.price = price
    }

    save() {
        var data = this

        return new Promise((resolve, reject) => {
            db.post({
                type: 'journey',
                originCities: data.cities,
                driver: data.driver,
                occupants: data.occupants,
                price: data.price
            }).then(journey => {
                resolve({
                    status: 201,
                    message: 'Journey successfully created',
                    journey: journey
                })
            }).catch(err => {
                reject({
                    status: 409,
                    message: 'Journey already exists'
                })
            })
        })
    }
}

Journey.find = id => {
    return new Promise((resolve, reject) => {
        db.find({
            selector: { type: 'journey', _id: id },
            fields: ['_id', 'cities', 'occupants', 'price']
        }).then(result => {
            resolve({
                status: 200,
                journey: result.docs
            })
        })
    })
}

Journey.fetchAll = () => {
    return new Promise((resolve, reject) => {
        db.find({
            selector: { type: 'journey' },
            fields: ['_id', 'cities', 'occupants', 'price']
        }).then(result => {
            resolve({
                status: 200,
                journeys: result.docs
            })
        }).catch(err => {
            reject({
                status: 404,
                message: "¿?"
            })
        })
    })
}

Journey.delete = id => {
    return new Promise((resolve, reject) => {
        db.get(id).then(doc => {
            return db.remove(doc)
        }).then(() => {
            resolve({
                status: 204,
                message: 'Journey succsessfully deleted'
            })
        }).catch(err => {
            reject({
                status: 404,
                message: 'Journey does not exist'
            })
        })
    })
}

Journey.getDriverJourneys = id => {
    return new Promise((resolve, reject) => {
        db.find({
            selector: {
                type: 'journey',
                driver: id,
            },
            fields: ['_id', 'cities', 'occupants', 'price']
        }).then(result => {
            resolve({
                status: 200,
                journeys: result.docs
            })
        }).catch(err => {
            reject({
                status: 404,
                message: err
            })
        })
    })
}
/*
Journey.getCityJourneys = id => {
    return new Promise((resolve, reject) => {
        db.find({
            selector: {
                type: 'journey',
                $or: [
                    { cities: 'nice' },
                    { cities: 'ok' }
                ] 
            },
            fields: ['_id', 'cities', 'occupants', 'price']
        }).then(result => {
            resolve({
                status: 200,
                journeys: result.docs
            })
        }).catch(err => {
            reject({
                status: 404,
                message: err
            })
        })
    })
}*/

module.exports = Journey