import {getConnection} from "../../components/database/DbConnect";
import {DbService} from "../../services/general/DbService";
import {ErrorHandler} from "../../components/ErrorHandler";
import {IInitialUser} from "../../models/user/InitialUser";

const constants = require('./../../components/Constants');
const db = getConnection();
const dbService = DbService(db);

export class AuthenticationCtrl {
  login(req) {
    const fname = 'AuthenticationCtrl.login';
    return new Promise(async function (resolve, reject) {
      const InitialUser: any = dbService.getModel('InitialUser');
      let reqUser = await InitialUser.toModelObject(req, dbService);
      let dbUser :any;
      try {
        dbUser = await dbService.findOneNotNull('InitialUser', {email: reqUser.email},
            false, '+password');
      }catch (err) {
        reject(err);
        return;
      }
      let result = dbUser.comparePassword(reqUser.password);
      if (await result) {

        let json = {_id: null, remember_token: null};
        dbUser.remember_token = generateGUID();
        json._id = dbUser._id;
        json.remember_token = dbUser.remember_token;
        dbService.save(dbUser);
        resolve(json);
      }
    });
    // source: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    function generateGUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  }
}