const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const fileUpload = require('express-fileupload')
const db = require('./config/database')

/**
 * This functions initialize an express app
 * @returns Object (Express)
 */
function init() {
  const app = express()
  return app
}

/**
 * Sets up the application with upload path and body parser
 * @param {Express} app
 */
function setup(app) {
  app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: '/tmp/',
    })
  )

  app.use(express.static(path.join(__dirname, '/public')))

  app.use(bodyParser.json({ limit: '5mb' }))
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(
    cors({
      origin: true,
      optionsSuccessStatus: 200,
    })
  )
}

// function connectDB(app) {
//   try {
//     db.authenticate()
//     console.log('Connected to DB')
//   } catch (e) {
//     console.error('Unable to connect to DB', e)
//   }
// }

/**
 * This function will automatically chains all the middleware that are registered in the middlewares/index.js
 * @param {Express} app
 */
function chainMiddlewares(app) {
  const Middlewares = require('./middlewares')
  Object.values(Middlewares).forEach((element) => {
    const middleObj = new element()
    if ('run' in middleObj && typeof middleObj.run === 'function') {
      app.use(middleObj.run)
    }
  })
}

/**
 * This function will chain all the routes declared in routes folder
 * @param {Express} app
 */
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
  // connectDB(app)
  chainMiddlewares(app)
  chainRoutes(app)
  console.log('testing pipeline')
  //General exception handler
  app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
      status: false,
      errors: ['Oops! Something went wrong'],
      trace: err.stack,
    })
  })
  return app
}
