import * as moment from 'moment';
let client;

export function start() {
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    // Setup Azure Application Insights
    const appInsights = require('applicationinsights');
    appInsights.setup()
        .setAutoDependencyCorrelation(false)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true, true)
        .setUseDiskRetryCaching(true)
        .start();
    client = appInsights.defaultClient;
    if(process.env.APPINSIGHTS_ENVIRONMENT) {
      client.commonProperties = {
        environment: process.env.APPINSIGHTS_ENVIRONMENT
      };
    }
  }
}

export function logMessage(message: string, properties?: any) {
  if (client) {
    if (properties) {
      client.trackTrace({message: `${message} ${JSON.stringify(properties)}`})
    } else {
      client.trackTrace({message});
    }
  } else {
    console.log(moment().format() + ' ' + message, properties);
  }
}

export function logError(error: any) {
  if (client) {
    if(!(error instanceof Error))
      error = new Error(JSON.stringify(error));
    client.trackException({exception: error});
  } else {
    console.error(error);
  }
}