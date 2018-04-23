import {Connection} from 'mongoose'

const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // set native Promise to avoid using deprecated one
import {Config} from "../Config";

let connection :Connection;

/**
 * Creates a database connection
 *
 * @returns {Connection} the created Connection object
 */
export function getConnection() :Connection{
  if(connection){
    return connection;
  }
  console.log('CALLED');
  let dbOptions = {};
  /* TODO FIX PRODUCTION DB TO WORK*/
  Config.config.database.production = false;
  let databaseUri = (Config.config.database.production) ?
      Config.config.database.productiondb.uri :
      Config.config.testMode ?
          Config.config.database.test.uri :
          Config.config.database.local.uri;
  let connectionString = 'mongodb://' + databaseUri + '/' + Config.config.database.dbName;

  console.log('****** CREATING MONGO CONNECTION to ' + connectionString + '******');
  let dbObject = mongoose.createConnection();

  if (Config.config.database.production) {
    console.log('****** PRODUCTION - Initializing all DB events *****');
    dbObject.on('connecting', function () {
      console.log('******! CONNECTING !******');
    });
    dbObject.on('connected', function () {
      console.log('******! CONNECTED !******');
    });
    dbObject.on('disconnecting', function () {
      console.log('******! DISCONNECTING !******');
    });
    dbObject.on('disconnected', function () {
      console.log('******! DISCONNECTED !******');
    });
    dbObject.on('close', function () {
      console.log('******! CLOSED !******');
    });
    dbObject.on('reconnected', function () {
      console.log('******! RECONNECTED !******');
    });
    dbObject.on('error', function (err) {
      console.log('****** ERROR ******');
      console.log('****** ERROR START ******\n' + err + '\n******** ERROR END *******');
    });
    dbObject.on('all', function () {
      console.log('******! ALL !******');
    });
    //On OPEN we have to initialize all models
    dbObject.on('open', function () {
      requireFiles(dbObject);
    });
    dbObject.on('fullsetup', function () {
      console.log('******! FULL-SETUP !******');
    });
    dbObject.openUri(connectionString, dbOptions);
  } else {
    dbObject.openUri(connectionString, function () {
      requireFiles(dbObject);
    });
  }
  connection = dbObject;
  return dbObject;
}

function requireFiles(db) {
  console.log('******! DbConnect Require Files !******');
  try {
    //TODO require all models here
    require('../../models/user/InitialUser').default(db);
    require('../../models/user/User').default(db);
    require('../../models/logging/ErrorLog').default(db);

  } catch (error) {
    console.log(`Requiring and initializing models threw an exception: ${error}`);
    console.error(error);
  }
}

