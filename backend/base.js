const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const db = require('./config/database');
const { engine } = require('express-handlebars');
const session = require('express-session');
const cookieParser = require('cookie-parser');
/**
 * This functions initialize an express app
 * @returns Object (Express)
 */
function init() {
  const app = express();
  return app;
}

/**
 * Sets up the application with upload path and body parser
 * @param {Express} app
 */
function setup(app) {
  const whitelists = [
    'http://admin.moresurveys.com',
    'http://moresurveys.com',
    'http://localhost:3000',
  ];
  app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: '/tmp/',
    })
  );

  app.use(express.static(path.join(__dirname, '/public')));
  app.use(cookieParser());

  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(
    cors({
      origin: '*',
      // function (origin, callback) {
      //   if (whitelists.indexOf(origin) !== -1 || !origin) {
      //     callback(null, true)
      //   } else {
      //     callback(new Error('Not allowed by CORS'))
      //   }
      // },
      optionsSuccessStatus: 200,
    })
  );
}

function initializeHandlebars(app) {
  app.engine('handlebars', engine());
  app.set('view engine', 'handlebars');
  app.set('views', './views');
}

/**
 * This function will automatically chains all the middleware that are registered in the middlewares/index.js
 * @param {Express} app
 */
function chainMiddlewares(app) {
  const Middlewares = require('./middlewares');
  Object.values(Middlewares).forEach((element) => {
    const middleObj = new element();
    if ('run' in middleObj && typeof middleObj.run === 'function') {
      app.use(middleObj.run);
    }
  });
}

/**
 * This function will chain all the routes declared in routes folder
 * @param {Express} app
 */
function chainRoutes(app) {
  var normalizedPath = require('path').join(__dirname, 'routes');
  require('fs')
    .readdirSync(normalizedPath)
    .forEach(function (file) {
      const { prefix, router } = require('./routes/' + file);
      app.use(prefix, router);
    });
}

/**
 * This function will setup the session store for the application
 * @param {Express} app
 */
function initializeSession(app) {
  const oneDay = 1000 * 60 * 60 * 24;
  app.use(
    session({
      name: `Scripted`,
      secret: process.env.NODE_APP_SECRET,
      saveUninitialized: true,
      cookie: { maxAge: oneDay },
      resave: false,
    })
  );
}

module.exports = function () {
  const app = init();
  setup(app);
  initializeSession(app);
  initializeHandlebars(app);
  chainMiddlewares(app);
  chainRoutes(app);

  //General exception handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      status: false,
      errors: ['Oops! Something went wrong'],
      trace: err.stack,
    });
  });
  return app;
};
