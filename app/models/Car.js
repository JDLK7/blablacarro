var PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
var db = new PouchDB('blablacarro')

var cars = [
    {
        model: '308',
        brand: 'Peugeot'
    },
    {
        model: 'Megane',
        brand: 'Renault'
    },
    {
        model: 'i30',
        brand: 'Hyundai'
    },
    {
        model: 'Ceed',
        brand: 'Kia'
    },
    {
        model: 'C Class',
        brand: 'Mercedes'
    },
    {
        model: 'M2',
        brand: 'BMW'
    },
    {
        model: 'A3',
        brand: 'Audi'
    },
    {
        model: 'C4',
        brand: 'Citröen'
    },
    {
        model: 'Leon',
        brand: 'Seat'
    },
    {
        model: 'Polo',
        brand: 'Volkswagen'
    }
]

function generateData() {
    
    console.log('Registrando coches...')

    for(var i = 0; i < cars.length; i++) {
        db.put({
            _id: ('car' + i),
            type: 'car',
            model: cars[i].model,
            brand: cars[i].brand
        }).then(() => {
            console.log('Coche autogenerado')
        }).catch(err => {
            console.log('El coche ya existe')
        })
    }
}

class Car {
    constructor() {}
}

generateData()

Car.find = id => {
    return new Promise(resolve => {
        db.find({
            selector: { type: 'car', _id: id },
            fields: ['_id', 'model', 'brand']
        }).then(result => {
            resolve({
                status: 200,
                car: result.docs
            })
        })
    })
}

Car.fetchAll = () => {
    return new Promise((resolve, reject) => {
        db.find({
            selector: { type: 'car'},
            fields: ['_id', 'model', 'brand']
        }).then(result => {
            resolve({
                status: 200,
                cars: result.docs
            })
        }).catch(err => {
            reject({
                status: 404,
                cars: err
            })
        })
    })
}

module.exports = Car