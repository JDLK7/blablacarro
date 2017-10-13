var PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
var db = new PouchDB('blablacarro')

var crypto = require('crypto')

class User {
    constructor(login, password) {
        this.login = login
        this.password = password
    }

    save() {
        var user = this

        return new Promise((resolve, reject) => {
            db.put({
                _id: crypto.createHash('sha256').update(user.login).digest('hex'),
                type: 'user',
                login: user.login,
                password: crypto.createHash('sha256').update(user.password).digest('hex'),
            }).then(result => {
                console.log('User has been registered')

                resolve({
                    status: 201,
                    message: 'User has been registered'
                })
            }).catch(error => {
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
        }).then((result) => {
            resolve({
                status: 200,
                users: result.docs
            })
        }).catch((err) => {
            reject({
                status: 404,
                message: "¿?"
            })
        })
    })
}

User.find = id => {
    return new Promise((resolve, reject) => {
        db.get(id).then((user) => {
            delete user.password

            resolve({
                status: 200,
                user: user
            })
        }).catch((err) => {
            console.log('User does not exist')

            reject({
                status: 404,
                message: "User does not exist"
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
        }).catch((err) => {
            reject({
                status: 404,
                message: "¿?"
            })
        })
    })
}

User.checkAuthentication = (login, password) => {
    return new Promise((resolve, reject) => {
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