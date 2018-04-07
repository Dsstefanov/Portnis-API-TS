const Config = require('./../Config');
const exec = require('child-process-promise').exec;
const spawn = require('child_process').spawn;
const os = require('os');
const tcpPortUsed = require('tcp-port-used');
const path = require('path');

/**
 * Sets up database instance when running test/local + initializes connection to the master db
 *
 * @return {Promise} Resolves when the database instance is running
 * (not when connection is established)
 */
module.exports = function() {

  if (Config.config.database.production) {
    return Promise.resolve();
  }

  let dbPath = process.cwd();
  let logPath = process.cwd();
  let dbPort = Config.config.database.local.port;

  if (Config.config.testMode) {
    dbPath += path.normalize(Config.config.database.test.path);
    logPath += path.normalize(Config.config.database.test.logPath);
    dbPort = Config.config.database.test.port;
    return stopMongodInstance(dbPath, dbPort).then(function() {
      console.log('-------- Mongod instance shut down --------');
      return deleteTestDatabaseFiles(dbPath);
    }).then(function() {
      return initializeMongodInstance(dbPath, dbPort, logPath);
    }).then(function() {
      console.log('-------- Mongod instance initialized successfully --------');
      return initializeMasterDb(dbPort);
    }).catch(function(err) {
      console.log('-------- Mongod instance did NOT initialize correctly --------');
      console.log(err);
    });
  } else {
    // Linux only
    logPath += os.platform() === 'linux' ? Config.config.database.local.logPath : null;
    return initializeMongodInstance(null, dbPort, logPath)
        .then(function() {
          initializeMasterDb(dbPort);
        });
  }

  /**
   * Creates a new instance of mongod.
   *
   * @param {String} [dbPath] The path where the database will be saved
   * @param {Number} [dbPort] The database port (27017 for develop and 27018 for testing)
   * @param {String} [logPath] The path to log the mongod errors
   * @return {Promise}
   */
  function initializeMongodInstance(dbPath, dbPort, logPath) {
    return tcpPortUsed.check(parseInt(dbPort), '127.0.0.1').then(function(inUse) {
      if (!inUse) {
        let cmd = 'mongod';

        if (dbPath) {
          cmd += ' --dbpath ' + dbPath;
        }
        if (dbPort) {
          cmd += ' --port ' + dbPort;
        }
        if (logPath) {
          cmd += ' --logpath ' + logPath;
        }

        if (os.platform() === 'linux') {
          cmd += ' --fork';
          return exec(cmd);
        } else {
          const options = {
            stdio: 'inherit',
            detached: true
          };
          return spawn('cmd', ['/c', cmd], options);
        }
      }
    }).catch(function(err) {
      console.log(err);
    });
  }

  /**
   * Stops any mongod instance that is running on a specific port and at a specific location
   *
   * @param {String} dbPath The path where the database will be saved
   * @param {Number} dbPort The database port (27017 for develop and 27018 for testing)
   * @return {Promise}
   */
  function stopMongodInstance(dbPath, dbPort) {
    return tcpPortUsed.check(dbPort, '127.0.0.1').then(function(inUse) {
      if (inUse) {
        let command;
        if (os.platform() === 'linux') {
          command = 'mongod --dbpath ' + dbPath + ' --shutdown';
        } else {
          command = 'mongo --port ' + dbPort + ' --eval db.getSiblingDB(\'admin\').shutdownServer()';
        }

        return exec(command);
      }
    }).then(function() {
      return tcpPortUsed.waitUntilFree(dbPort, 500, 10000);
    }).catch(function(err) {
      console.log(err);
    });
  }

  /**
   * Clear the directory where the database is stored so every time the server is restarted,
   * in test mode it will start with a fresh database
   *
   * @param {String} dbPath The path where the database will be saved
   * @return {Promise}
   */
  function deleteTestDatabaseFiles(dbPath) {
    let deleteCommand = os.platform() === 'linux' ? 'rm -rf ' :
        'if exist ' + dbPath + ' RMDIR /S /Q ';
    deleteCommand += dbPath;

    return exec(deleteCommand).then(function() {
      let createCommand = os.platform() === 'linux' ? 'mkdir -p ' : 'mkdir ';
      createCommand += dbPath;

      return exec(createCommand);
    }).catch(function(err) {
      console.log(err);
    });
  }

  /**
   * Waits until the mongod instance is up an running by checking if the port on which the
   * database should run is not available anymore. Afterwards initialize the master database and
   * the router.
   *
   * @param {Number} [dbPort] The database port (27017 for develop and 27018 for testing)
   */
  function initializeMasterDb(dbPort) {
    const requireFiles = function() {
      //Setup database with required models
      require('./DbConnect')();
    };

    if (!dbPort) {
      requireFiles();
    } else {
      // Wait until the mongod instance is up and running
      tcpPortUsed.waitUntilUsed(dbPort, 500, 20000).then(function() {
        requireFiles();
      }).catch(function(err) {
        console.log(err);
      });
    }
  }
};
