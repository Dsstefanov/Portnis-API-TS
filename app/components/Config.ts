export class Config {
  public static config = {
    'testMode': false,
    'authentication': {
      'authCheck': true,
    },
    'admins': process.env.stAdmins ?
        process.env.stAdmins.split(',') : ['dsstefanov2@gmail.com'],
    'database': {
      'production': true,
      'dbName': process.env.dbName ? process.env.dbName : 'portfolio_v2',
      'testUri': 'localhost:27018',
      'localhostUri': 'localhost:27017',
      'socketTimeout': process.env.socketTimeout ? parseInt(process.env.socketTimeout, 10) : 0,
      'connectionTimeout': process.env.connectionTimeout ?
          parseInt(process.env.connectionTimeout, 10) : 30000,
      'socketKeepAlive': process.env.socketKeepAlive ?
          parseInt(process.env.socketKeepAlive, 10) : 90000,
      'test': {
        'uri': 'localhost:27018',
        'port': 27018,
        'path': '/dbs/testDb',
        'logPath': '/dbs/testDb/mongodb.log'
      },
      'local': {
        'uri': 'localhost:27017',
        'port': 27017,
        'logPath': '/dbs/localDb/mongodb.log'
      },
      'productiondb': {
        'uri': 'localhost:27016',
        'port': 27016,
        'logPath': '/dbs/production/mongodb.log'
      }
    },
    'basicAuth': {
      'email': 'pesho@gmail.com',
      'password': 'testpassword'
    },
    'encryption': {
      'cryptoPass': process.env.encryptPass || '1728SweetWaterHomeBuryDeath129'
    },
    'logging': {
      'requests': process.env.requestLogging || false
    },
    'resources':
        {
          'wait':
          process.env.waitResource || false
        }
    ,
    'webJob':
        {
          'maxTokens':
              process.env.maxTokens ? parseInt(process.env.maxTokens, 10) : 1000
        }
  };

  /**
   * Sets the config variables to be used when running the app locally
   */
  static setLocal(){
    this.config.database.production = false;
  }

  /**
   * Sets the config variables to be used when running the app in test mode
   */
  static setTest() {
    this.config.testMode = true;
  }
}
