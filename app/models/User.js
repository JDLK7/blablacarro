var PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
var db = new PouchDB('blablacarro')

var crypto = require('crypto')

class User {
    constructor(login, password, car = null) {
        this.login = login
        this.password = password
        this.car = car
    }

    save() {
        var user = this

        return new Promise((resolve, reject) => {
            db.put({
                _id: crypto.createHash('sha256').update(user.login).digest('hex'),
                type: 'user',
                login: user.login,
                password: crypto.createHash('sha256').update(user.password).digest('hex'),
                car: user.car
            }).then(user => {
                console.log('User has been registered')

                resolve({
                    status: 201,
                    body: {
                        message: 'User has been registered',
                        user: user
                    }
                })
            }).catch(() => {
                console.log('User already exists')
                
                reject({
                    status: 409,
                    message: 'User already exists'
                })
            })
        })
    }
}

User.fetchAll = () => {
    return new Promise((resolve, reject) => {
        db.find({
            selector: { type: 'user' },
            fields: ['_id', 'login']
        }).then(result => {
            resolve({
                status: 200,
                users: result.docs
            })
        }).catch(err => {
            reject({
                status: 404,
                message: err
            })
        })
    })
}

User.find = id => {
    return new Promise((resolve, reject) => {
        db.get(id).then(user => {
            delete user.password

            resolve({
                status: 200,
                user: user
            })
        }).catch(() => {
            console.log('User does not exist')

            reject({
                status: 404,
                message: 'User does not exist'
            })
        })
    })
}

User.findByLogin = login => {
    return new Promise((resolve, reject) => {
        db.find({
            selector: { type: 'user', login: login },
        }).then(result => {
            delete result.docs[0].password

            resolve({
                user: result.docs[0]
            })
        }).catch(err => {
            reject({
                status: 404,
                message: err
            })
        })
    })
}

User.checkAuthentication = (login, password) => {
    return new Promise(resolve => {
        db.find({
            selector: {
                type: 'user',
                login: login
            },
            fields: ['password']
        }).then(result => {
            var hash = crypto.createHash('sha256').update(password).digest('hex')

            resolve({
                ok: (result.docs[0].password === hash)
            })
        })
    })
}

module.exports = User