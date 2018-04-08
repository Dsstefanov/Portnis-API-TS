import {ErrorHandler} from "../components/ErrorHandler";
import {getConnection} from "../components/database/DbConnect";
import {DbService} from '../services/general/DbService';
const async = require('async');
const constants = require('../components/Constants');
const dbService = DbService(getConnection());

/**
 * Authorizes a user's remember_token, by checking validity
 *
 * @returns {Function}
 */
export function authorize() {
  return function (req, res, next) {

    async.waterfall([
      checkAuthHeaders,
      getTokens,
      findUser,
      checkTokenValid
    ], function (err, user) {
      if (err) {
        if (typeof err === 'string') {
          ErrorHandler.createErrorLog('Authorize.authorize', err);
        } else {
          ErrorHandler.handleErr('Authorize.authorize', 'Failed to authorize, see inner exception',
              constants.errType.SECURITY, 401, err);
        }
        return res.sendStatus(401);
      }

      req.user = user;
      return next();
    });

    /**
     * Check that the token and refresh token headers are set
     *
     * @param {function} callback The function to call when operation is done
     * @returns {*}
     */
    function checkAuthHeaders(callback) {
      const tokenHeader = req.headers.authorization;
      const refreshHeader = req.headers['refresh-token'];

      if (tokenHeader == null || refreshHeader == null) {
        return callback('No access tokens provided');
      }

      // Prevent NoSQL injection by checking that token is type string
      if (typeof tokenHeader !== 'string' || typeof refreshHeader !== 'string') {
        return callback('Token headers not string - NoSQL injection attack');
      }
      return callback();
    }

    /**
     * Extract the actual token and refresh token values from the headers
     *
     * @param {function} callback Function to return the result to
     * @returns {*}
     */
    function getTokens(callback) {
      const token = extractAccessToken(req.headers.authorization);
      const refreshToken = extractAccessToken(req.headers['refresh-token']);
      req.accessToken = token;
      return callback(null, token, refreshToken);
    }

    /**
     * Find the user that is associated with the particular token
     *
     * @param {function} callback
     */
    async function findUser(callback) {
      let user = null;
      try {
        await dbService.findOne('InitialUser', {_id: req.cookies.userId}, true, 'remember_token');
        if (user === null) {
          return callback('User not found');
        }
      } catch (err) {
        callback(err);
      }
    }

    /**
     * Checks if the access token is valid - i.e. user has the appropriate token
     *
     * @param user The user to check access token for
     * @param token The remember_token
     * @param {function} callback The function to return result to
     * @returns {*}
     */
    function checkTokenValid(user, token, callback) {
      if (user.remember_token !== token) {
        return callback('Remember_tokens does not match!');
      }
    }

    /**
     * Extracts the token from the Authorization header
     * @param headerValue the header value to be manipulated
     * @returns a string only containing the tokenString
     */
    function extractAccessToken(headerValue) {
      return headerValue.replace('Bearer ', '');
    }
  }
}