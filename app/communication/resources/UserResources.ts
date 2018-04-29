import {defaultCtrlCall} from './UtilResources';
import {authorize} from "../Authorization";
import {UserCtrl} from "../../controllers/user/UserCtrl";
import {AuthenticationCtrl} from "../../controllers/authentication/AuthenticationCtrl";

export function UserRoutes(router) {

  const userCtrl = new UserCtrl();

  /**
   * @api {post} /users/auth/register Registers a user
   * @apiDescription Registers user with InitialUser model and empty User model
   * @apiVersion 2.0.0
   * @apiName RegisterUser
   * @apiGroup Users
   *
   * @apiUse SimpleSuccess
   * @apiUse BadRequestError
   */
  router.post('/users/auth/register', async (req, res) => {
    return await defaultCtrlCall(res, userCtrl.createUser, req);
  });

  /**
   * @api {get} /users/emails/:email Checks whether the email is in use
   * @apiDescription Checks whether the email is in use
   * @apiVersion 2.0.0
   * @apiName UniqueEmail
   * @apiGroup Users
   *
   * @apiUse SimpleSuccess
   * @apiUse BadRequestError
   *
   * @return InitialUser._id || null
   */
  router.get('/users/emails/:email', async (req, res) => {
    return await defaultCtrlCall(res, userCtrl.isEmailUnique, req);
  });

  /**
   * @api {get} /users/user/:id Gets an entire user
   * @apiDescription Gets the user
   * @apiVersion 2.0.0
   * @apiName getUserById
   * @apiGroup Users
   *
   * @apiUse SimpleSuccess
   * @apiUse BadRequestError
   *
   * @return InitialUser._id || null
   */
  router.get('/users/user/:id', async (req, res) => {
    await authorize(req);
    return await defaultCtrlCall(res, userCtrl.getUser, req);
  });

  /**
   * @api {post} /users/user/:id Updates
   * @apiDescription Updates user
   * @apiVersion 2.0.0
   * @apiName updateUser
   * @apiGroup Users
   *
   * @apiUse SimpleSuccess
   * @apiUse BadRequestError
   * @apiUse NotFoundError
   * @apiUser UnauthorizedError
   *
   * @return InitialUser._id || null
   */
  router.post('/users/user/:id', async (req, res) => {
    await authorize(req);
    return await defaultCtrlCall(res, userCtrl.updateUser, req);
  });

  /**
   * @api {post} /users/user/:id/delete Deletes
   * @apiDescription Deletes user
   * @apiVersion 2.0.0
   * @apiName deleteUser
   * @apiGroup Users
   *
   * @apiUse SimpleSuccess
   * @apiUse BadRequestError
   * @apiUse NotFoundError
   * @apiUser UnauthorizedError
   *
   * @return InitialUser._id || null
   */
  router.post('/users/user/:id/delete', async (req, res) => {
    await authorize(req);
    return await defaultCtrlCall(res, userCtrl.deleteUser, req);
  });

  /**
   * @api {get} /users/:username Fetches user
   * @apiDescription Get user
   * @apiVersion 2.0.0
   * @apiName getUserByUsername
   * @apiGroup Users
   *
   * @apiUse SimpleSuccess
   * @apiUse BadRequestError
   * @apiUse NotFoundError
   *
   * @return InitialUser._id || null
   */
  /*keep this one last*/
  router.get('/users/:username', async (req, res) => {
    return await defaultCtrlCall(res, userCtrl.getUserByUsername, req);
  });
}