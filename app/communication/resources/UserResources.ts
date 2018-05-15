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
   * @api {get} /users/user/:id Fetches user by ID
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
   * @api {post} /users/user/:id Updates Personality properties for a user
   * @apiDescription Updates user
   * @apiVersion 2.0.0
   * @apiName updateUserPersonality
   * @apiGroup Users
   *
   * @apiUse SimpleSuccess
   * @apiUse BadRequestError
   * @apiUse NotFoundError
   * @apiUse UnauthorizedError
   *
   * @return InitialUser._id || null
   */
  router.post('/users/user/:id', async (req, res) => {
    await authorize(req);
    return await defaultCtrlCall(res, userCtrl.updateUser, req);
  });

  /**
   * @api {post} /users/user/:id/update/social Updates the social medias of a user
   * @apiDescription Updates user
   * @apiVersion 2.0.0
   * @apiName updateUserSocialMedias
   * @apiGroup Users
   *
   * @apiUse SimpleSuccess
   * @apiUse BadRequestError
   * @apiUse NotFoundError
   * @apiUse UnauthorizedError
   *
   * @return InitialUser._id || null
   */
  router.post('/users/user/:id/update/social', async (req, res) => {
    await authorize(req);
    return await defaultCtrlCall(res, userCtrl.updateUserSocialMedias, req);
  });

  /**
   * @api {post} /users/user/:id/update/contact Updates contact information properties for a user
   * @apiDescription Updates user
   * @apiVersion 2.0.0
   * @apiName updateUserContact
   * @apiGroup Users
   *
   * @apiUse SimpleSuccess
   * @apiUse BadRequestError
   * @apiUse NotFoundError
   * @apiUse UnauthorizedError
   *
   * @return InitialUser._id || null
   */
  router.post('/users/user/:id/update/contact', async (req, res) => {
    await authorize(req);
    return await defaultCtrlCall(res, userCtrl.updateUserContact, req);
  });

  /**
   * @api {post} /users/user/:id/create/project Creates project information for a user
   * @apiDescription Updates user
   * @apiVersion 2.0.0
   * @apiName updateUserProject
   * @apiGroup Users
   *
   * @apiUse SimpleSuccess
   * @apiUse BadRequestError
   * @apiUse NotFoundError
   * @apiUse UnauthorizedError
   *
   * @return InitialUser._id || null
   */
  router.post('/users/user/:id/create/project', async (req, res) => {
    await authorize(req);
    return await defaultCtrlCall(res, userCtrl.createUserProject, req);
  });

  /**
   * @api {post} /users/user/:id/delete Delete user
   * @apiDescription Deletes a user with all of the provided data in compliance with General Data Protection Regulation (GDPR)
   * @apiVersion 2.0.0
   * @apiName deleteUser
   * @apiGroup Users
   *
   * @apiUse SimpleSuccess
   * @apiUse BadRequestError
   * @apiUse NotFoundError
   * @apiUse UnauthorizedError
   *
   * @return InitialUser._id || null
   */
  router.post('/users/user/:id/delete', async (req, res) => {
    await authorize(req);
    return await defaultCtrlCall(res, userCtrl.deleteUser, req);
  });

  /**
   * @api {get} /users/:username Fetches user by username
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