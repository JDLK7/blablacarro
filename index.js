var express = require('express')
var app = express()

var api = require('./api')

//WEB
app.use('/docs', express.static('api-docs'))

//API
app.use('/api', api)

app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.listen(process.env.PORT || 3000, function(){
    console.log('Server started!')
})

module.exports = app
