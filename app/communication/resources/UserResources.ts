import {defaultCtrlCall} from './UtilResources';
import {authorize} from "../Authorization";

const userCtrl = require('../../controllers/user/UserCtrl');

export function Routes(router) {

  /**
   * @api {get} /users/auth/register Registers a user
   * @apiDescription Registers user with InitialUser model and empty User model
   * @apiVersion 2.0.0
   * @apiName RegisterUser
   * @apiGroup Users
   *
   * @apiUse SimpleSuccess
   * @apiUse BadRequestError
   * @apiUse NotFoundError
   */
  router.post('/users/auth/register', async function (req, res) {
    return await defaultCtrlCall(res, userCtrl.createUser, req);
  })
}