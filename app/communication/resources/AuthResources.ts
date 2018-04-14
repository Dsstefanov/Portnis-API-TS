import {defaultCtrlCall} from './UtilResources';
import {authorize} from "../Authorization";
import {UserCtrl} from "../../controllers/user/UserCtrl";
import {AuthenticationCtrl} from "../../controllers/authentication/AuthenticationCtrl";

const authCtrl = new AuthenticationCtrl();

export function AuthRoutes(router) {

  /**
   * @api {post} /users/auth/login Logs in the user
   * @apiDescription Sets headers and logs the user in
   * @apiVersion 2.0.0
   * @apiName Login
   * @apiGroup Users
   *
   * @apiUse SimpleSuccess
   * @apiUse BadRequestError
   * @apiUse NotFoundError
   *
   * @return
   */
  router.post('/users/auth/login', async (req, res) => {
    return await defaultCtrlCall(res, authCtrl.login, req, true);
  });

  /**
   * @api {post} /users/auth/authorize Authenticates the user for current request
   * @apiDescription Authenticates the user for current request
   * @apiVersion 2.0.0
   * @apiName Authenticate&Authorize
   * @apiGroup Users
   *
   * @apiUse SimpleSuccess
   * @apiUse BadRequestError
   * @apiUse NotFoundError
   *
   * @return
   */
  router.get('/users/auth/authorize', async (req, res) => {
    return await defaultCtrlCall(res, authorize, req);
  });
}