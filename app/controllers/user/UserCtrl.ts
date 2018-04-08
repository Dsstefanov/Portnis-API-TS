import {defaultCtrlCall} from "../../communication/resources/UtilResources";
import {getConnection} from "../../components/database/DbConnect";
import {DbService} from "../../services/general/DbService";
const dbService = DbService(getConnection());
import {ErrorHandler} from "../../components/ErrorHandler";
const constants = require('./../../components/Constants');


export class UserCtrl{

  createUser(req) {
    const fname = 'UserCtrl.createUser';
    return new Promise((resolve, reject) => {
      try{
        let reqUser = req.body;
        const InitialUser = dbService.getModel('InitialUser');
        let initialUser = new InitialUser();
        /*TODO FIX MODEL SETTERS*/
        /*initialUser.valid = false;
        initialUser.email = reqUser.email;
        initialUser.password = reqUser.password;*/
        dbService.save(initialUser);
        resolve(initialUser);
      }catch (err) {
        reject(ErrorHandler.handleErr('UserCtrl.createUser: ', err,
            constants.errType.DB, 400))
      }
    });
  }
}