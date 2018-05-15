import {initializeResources} from './app/communication/resources/Resources';
import * as Logger from './app/components/logger/Logger';

import {Config} from "./app/components/Config";

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const winston = require('winston');
const expressWinston = require('express-winston');
const compression = require('compression');
const dbSetup = require('./app/components/database/DbSetup');
const port = process.env.PORT || 3000;
const baseHost = process.env.WEBSITE_HOSTNAME || 'localhost';
const DB_CHECK_INTERVAL = 500;
const DB_TIMEOUT = 60000;
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const allowedDomains = {
  portnis: 'http://localhost:8000'
};


// Set config variables based on arguments passed to node when starting the application
if (process.argv) {
  const args = process.argv.slice(2);
  args.forEach(function (arg) {
    if (arg === '--local') {
      console.log('-------- Portnis API server will use local database --------');
      Config.setLocal();
    } else if (arg === '--test' && !Config.config.database.production) {
      console.log('-------- Portnis API server will run in test mode --------');
      Config.setTest();
    }
  });
}

Logger.start();

process.on('unhandledRejection', error => {
  console.log('unhandledRejection', error.message);
  console.error(error);
  Logger.logError(error);
});

const app = express();
const server = http.createServer(app);

app.use(compression()); //use compression
app.use(cookieParser());
app.use(multer({dest: './public/'}).single('file'));
// Set application to parse body as JSON
// Requests should have Content-Type = 'application/json'
app.use(bodyParser.json({
  limit: 10000000
}));
app.use('/v2', express.static('public'));

// Need for Content-Type = 'application/x-www-form-urlencoded'
app.use(bodyParser.urlencoded({extended: false}));

// MIDDLEWARE FOR CONSOLE LOGGING - Used for logging all incoming and response functions
// =====================================================================================================================
if (Config.config.logging.requests) {
  expressWinston.requestWhitelist.push('body');
  expressWinston.responseWhitelist.push('body');
  app.use(expressWinston.logger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true
      })
    ],
    meta: true, // optional: control whether you want to log the meta data about the request
    // (default to true)
    msg: 'HTTP {{req.method}} {{req.url}}', // optional: customize the default logging
    // message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: false, // Use the default Express/morgan request formatting, with the same
    // colors. Enabling this will override any msg and colorStatus if true. Will only output
    // colors on transports with colorize set to true
    colorStatus: true, // Color the status code, using the Express/morgan color palette
    // (default green, 3XX cyan, 4XX yellow, 5XX red). Will not be recognized if expressFormat
    // is true
    ignoreRoute: function (req, res) {
      return false;
    } // optional: allows to skip some log messages based on request and/or response
  }));
}

// Used to allow cross domain requests from clients
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", 'GET, POST, PUT, DELETE');
  res.header["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.all(allowedDomains.portnis, mongoSanitize());
(async () => {
  try {
    await dbSetup();
  } catch (err) {
    console.error('-------- Error occurred during database set up --------');
    throw err;
  }
  try {
    await initializeResources(app, express.Router());
    console.log('-------- Initialization completed --------');
  } catch (err) {
    console.log('-------- Error occurred during initialization --------');
    console.error(err);
  }
  return new Promise(resolve => resolve())
})().then(() => {
  // Setup HTTP server to listen on port
  server.listen(port, baseHost, function () {
    console.log('-------- Portnis API server application started --------');
  });
});
