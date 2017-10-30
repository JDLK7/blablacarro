var express = require('express')
var app = express()

var swaggerJSDoc = require('swagger-jsdoc')
var swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Blablacarro', // Title (required)
      version: '1.0.0',     // Version (required)
    },
  },
  apis: ['./api.js'],       // Path to the API docs
}
var swaggerSpec = swaggerJSDoc(swaggerOptions)

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
