const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const fileUpload = require('express-fileupload')

function init() {
  const app = express()
  return app
}

function setup(app) {
  app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: '/tmp/',
    })
  )

  app.use(express.static(path.join(__dirname, '/public')))

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(
    cors({
      origin: true,
      optionsSuccessStatus: 200,
    })
  )
}

function chainMiddlewares(app) {
  const Middlewares = require('./middlewares')
  Object.values(Middlewares).forEach((element) => {
    const middleObj = new element()
    if ('run' in middleObj && typeof middleObj.run === 'function') {
      app.use(middleObj.run)
    }
  })
}

function chainRoutes(app) {
  var normalizedPath = require('path').join(__dirname, 'routes')
  require('fs')
    .readdirSync(normalizedPath)
    .forEach(function (file) {
      const { prefix, router } = require('./routes/' + file)
      app.use(prefix, router)
    })
}

module.exports = function () {
  const app = init()
  setup(app)
  chainMiddlewares(app)
  chainRoutes(app)
  return app
}
