var PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
var db = new PouchDB('blablacarro')

var crypto = require('crypto')

var faker = require('faker');

function generateData() {
    for(var i = 0; i < 10; i++) {
        db.put({
            _id: ('city' + i),
            type: 'city',
            name: faker.address.city(),
            zipCode: faker.address.zipCode(),
            state: faker.address.state()
        }).then(() => {
            console.log('Ciudades autogeneradas')
        }).catch(() => {
            console.log('Error al autogenerar las ciudades')
        })
    }
}

//generateData()

class City {
    constructor(name, zipCode, state) {
        this.name = name
        this.zipCode = zipCode
        this.state = state
    }
}

City.find = id => {
    return new Promise((resolve, reject) => {
        db.find({
            selector: { type: 'city', _id: id },
            fields: ['_id', 'name', 'zipCode', 'state']
        }).then(result => {
            resolve({
                status: 200,
                city: result.docs
            })
        })
    })
}

City.fetchAll = () => {
    return new Promise((resolve, reject) => {
        db.find({
            selector: { type: 'city'},
            fields: ['_id', 'name', 'zipCode', 'state']
        }).then(result => {
            resolve({
                status: 200,
                cities: result.docs
            })
        }).catch(err => {
            reject({
                status: 404,
                message: "¿?"
            })
        })
    })
}

module.exports = City