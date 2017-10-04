var express = require('express')
var app = express()

var api = require('./api')
app.use('/api', api)

app.listen(3000, function(){
    console.log('Server started!')
})