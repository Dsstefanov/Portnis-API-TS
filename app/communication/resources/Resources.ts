const appPackage = require('../../../../package.json');
const constants = require('../../components/Constants');
import {UserRoutes} from "./UserResources"
import {AuthRoutes} from "./AuthResources";

/**
 * General resource file that should require the other resource files
 * @param app The Express application
 * @param router The Express router that should be passed to other resources
 */
export function initializeResources(app, router) {
  // Define our routes to start with a base route defined in constants
  app.use(constants.router.baseRoute, router);

  // Status route used to display API name and version
  router.get('/api', function(req, res) {
    const message = {
      API: appPackage.description,
      version: appPackage.version,
      author: appPackage.author
    };
    res.send(message);
  });

  router.get('/easterEgg', function(req, res) {
    res.sendStatus(418);
  });

  // Require routes related to different models
  UserRoutes(router);
  AuthRoutes(router);
}
