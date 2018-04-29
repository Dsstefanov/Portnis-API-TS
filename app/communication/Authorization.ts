import {ErrorHandler} from "../components/ErrorHandler";
import {getConnection} from "../components/database/DbConnect";
import {DbService} from '../services/general/DbService';
import {IInitialUser} from "../models/user/InitialUser";
import {Config} from "../components/Config";

const async = require('async');
const constants = require('../components/Constants');
const config = Config.config;

/**
 * Authorizes a user's remember_token, by checking validity
 *
 * @apiUse SimpleSuccess
 * @apiUse UnauthorizedError
 * @apiUse NotFoundError
 *
 * @returns true
 */
export async function authorize(req, isAuthReq? :boolean) {
  const dbService = DbService(getConnection());
  if(config.testMode && req.cookies.isAuthorized && req.cookies.isAuthorized===true){
    return true;
  }
  const fname = 'Authorization.authorize';
    const initialUser :IInitialUser= await dbService.findOneNotNull<IInitialUser>('InitialUser', {_id: req.cookies[constants.hashes.userId]}, true,
        null, null, 'userId', true);
    const isMatching = (initialUser.remember_token && initialUser.remember_token === req.cookies[constants.hashes.auth]);
    if (isMatching && isAuthReq) {
      return true;
    } else if (isMatching) {
      req.initialUser = initialUser;
      return true;
    }
    ErrorHandler.handleErr(fname, 'Unauthorized. The request has not been applied because it lacks valid authentication credentials for the target resource.',
        constants.errType.RESTRICTION, 401);
}