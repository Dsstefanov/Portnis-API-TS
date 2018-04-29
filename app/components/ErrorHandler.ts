import {getConnection} from './database/DbConnect'
import {Config} from "./Config";

const config = Config.config;
const moment = require('moment');
const constants = require('../components/Constants');
import {logError} from './logger/Logger';

export class ErrorHandler {

  /**
   * Creates the object that should be sent back to resources when an error occurs.
   * Common operations in relation to errors that should be sent back to requester should be
   * performed here.
   *
   * @param {String} functionName The name of the function error occurred in
   *                     - IF PROVIDED AN ERROR LOG WILL BE CREATED, ELSE NO ERROR LOG
   * @param {String} msg The error message
   * @param {String} type The error type - VALIDATION, RESTRICTION, SECURITY, PRECONDITION
   * @param {number} code The status code
   * @param {String} [inner] Inner exception/error, will be printed out separately
   * @param {Boolean} noLogging If exception shall not be logged in db
   * @returns {{msg: *, type: *, code: *}} Object containing the error message, type and code
   */
  static async handleErr(functionName, msg, type, code, inner?, noLogging?) {

    if (functionName && !config.testMode && !noLogging) {
      if (!noLogging) {
        this.createErrorLog(functionName, `${type} ${msg}`);
      }
      if (inner) {
        if (typeof inner === 'object' && inner.code) {
          this.handleErr(functionName, inner.msg, inner.type, inner.code, inner.inner);
        } else {
          if (!noLogging) {
            this.createErrorLog(functionName, inner.message);
          }
        }
      }
    }
    return {
      msg: msg,
      type: type,
      code: code,
      inner: inner
    };
  };

  /**
   * Creates an error log
   *
   * @param {String} functionName the function in question which results in an error
   * @param {String} message the error log message
   */
  static async createErrorLog(functionName, message) {
    console.log(`${moment().format()} - ERROR: ${functionName} - ${message}`);
    const db = getConnection();
    const ErrorLog = db.model('ErrorLog');
    const errorLogModel = await ErrorLog.create({
      functionName: functionName,
      message: message, timeStamp: moment()
    });
    errorLogModel.save(function (err) {
      if (err) {
        console.log('Error saving ErrorLog! WTF?');
        console.log(err);
      }
    });
    logError(errorLogModel);
  };

  static handleErrQueryfunction(functionName, msg, inner?) {
    return this.handleErr(functionName, msg, constants.errType.QUERY, 400, inner);
  };

  static handleErrorPrecondition(functionName, msg, inner?) {
    return this.handleErr(functionName, msg, constants.errType.PRECONDITION, 400, inner);
  };

  static handleErrDb(functionName, msg, inner?) {
    return this.handleErr(functionName, msg, constants.errType.DB, 400, inner);
  };

  static handleErrValidation(functionName, msg, inner) {
    return this.handleErr(functionName, msg, constants.errType.VALIDATION, 404, inner);
  };

  static handleErrRestriction(functionName, msg, inner?) {
    return this.handleErr(functionName, msg, constants.errType.RESTRICTION, 400, inner);
  };

  static handleErrSecurity(functionName, msg, inner?) {
    return this.handleErr(functionName, msg, constants.errType.SECURITY, 403, inner);
  };

  static handleErrUnknown(functionName, msg, inner?) {
    return this.handleErr(functionName, msg, constants.errType.UNKNOWN, 400, inner);
  };
}