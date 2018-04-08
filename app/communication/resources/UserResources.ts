import {defaultCtrlCall} from './UtilResources';
import {authorize} from "../Authorization";
import {UserCtrl} from "../../controllers/user/UserCtrl";

const userCtrl = new UserCtrl();
export function UserRoutes(router) {

  /**
   * @api {post} /users/auth/register Registers a user
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