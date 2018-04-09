import {defaultCtrlCall} from "../../communication/resources/UtilResources";
import {getConnection} from "../../components/database/DbConnect";
import {DbService} from "../../services/general/DbService";
import {ErrorHandler} from "../../components/ErrorHandler";
const constants = require('./../../components/Constants');
const dbService = DbService(getConnection());


export class UserCtrl{

  createUser(req) {
    const fname = 'UserCtrl.createUser';
    return new Promise(async (resolve, reject) => {
      try{
        const InitialUser :any = dbService.getModel('InitialUser');
        const User :any = dbService.getModel('User');
        let initialUser = await InitialUser.create(InitialUser.toModelObject(req, dbService));
        let user;
        try{
          user = new User();
          initialUser.userId = user._id;
          user.save();
          initialUser.save();
          resolve({
            success: "User successfully created!"
          });
        }catch(err){
          await InitialUser.remove({_id: initialUser._id});
          reject(ErrorHandler.handleErr(fname, err, constants.errType.DB, 400));
        }
      }catch (err) {
        reject(ErrorHandler.handleErr(fname, err, constants.errType.DB, 400))
      }
    });
  }
}