import {ErrorHandler} from "../components/ErrorHandler";
import {getConnection} from "../components/database/DbConnect";
import {DbService} from '../services/general/DbService';
const async = require('async');
const constants = require('../components/Constants');
const dbService = DbService(getConnection());

/**
 * @apiDescription Authorizes a user's remember_token, by checking validity
 * @apiVersion 2.0.0
 * @apiName Authorization
 * @apiGroup Users
 *
 * @apiUse SimpleSuccess
 * @apiUse UnauthorizedError
 * @apiUse NotFoundError
 *
 * @returns true
 */
export async function authorize(req, isAuthReq? :boolean) {
  const fname = 'Authorization.authorize';
    const initialUser: any = await dbService.findOneNotNull('InitialUser', {_id: req.cookies[constants.hashes.userId]}, true,
        null, null, 'userId', true);
    const isMatching = (initialUser.remember_token && initialUser.remember_token === req.cookies[constants.hashes.auth]);
    if (isMatching && isAuthReq) {
      return true;
    } else if (isMatching) {
      req.initialUser = JSON.parse(JSON.stringify(initialUser));
      return true;
    }
    ErrorHandler.handleErr(fname, 'Unauthorized. The request has not been applied because it lacks valid authentication credentials for the target resource.',
        constants.errType.RESTRICTION, 401);
}