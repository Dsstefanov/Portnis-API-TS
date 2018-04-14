import {getConnection} from "../../components/database/DbConnect";
import {DbService} from "../../services/general/DbService";
import {ErrorHandler} from "../../components/ErrorHandler";

const constants = require('./../../components/Constants');
const dbService = DbService(getConnection());


export class UserCtrl {

  createUser(req) {
    const fname = 'UserCtrl.createUser';
    return new Promise(async (resolve, reject) => {
      try {
        const InitialUser: any = dbService.getModel('InitialUser');
        const User: any = dbService.getModel('User');
        let initialUser = await InitialUser.create(InitialUser.toModelObject(req, dbService));
        let user;
        try {
          user = new User();
          initialUser.userId = user._id;
          user.save();
          initialUser.save();
          resolve({
            success: "User successfully created!"
          });
        } catch (err) {
          await InitialUser.remove({_id: initialUser._id});
          reject(ErrorHandler.handleErr(fname, err, constants.errType.DB, 400));
        }
      } catch (err) {
        reject(ErrorHandler.handleErr(fname, err, constants.errType.DB, 400))
      }
    });
  }

  isEmailUnique(req) {
    const fname = 'UserCtrl.isEmailUnique';
    return new Promise(async (resolve, reject) => {
      try {
        const user = await dbService.findOne('InitialUser', {email: req.params.email}, true, '_id');
        resolve(user);
      } catch (err) {
        reject(ErrorHandler.handleErr(fname, err, constants.errType.DB, 400));
      }
    })
  }

  getUser(req) {
    const fname = 'UserCtrl.getUserById';
    return new Promise(((resolve, reject) => {
      try {
        resolve(dbService.findOneNotNull('User', {_id: req.initialUser.userId}, true/*, null, null,
            'skills projects contact socialMedias' TODO uncomment when all models are registered*/));
      }catch (err){
        reject(ErrorHandler.handleErrDb(fname, err));
      }
    }))
  }

  getUserByUsername(req) {
    const fname = 'UserCtrl.getUserByUsername';
    return new Promise(((resolve, reject) => {
      try {
        resolve(dbService.findOneNotNull('User', {username: req.params.username}, true/*, null, null,
            'skills projects contact socialMedias' TODO uncomment when all models are registered*/));
      }catch (err){
        reject(ErrorHandler.handleErrDb(fname, err));
      }
    }))
  }

  updateUser(req) {
    const fname = 'UserCtrl.updateUser';
    return new Promise(async (resolve, reject) => {
      try {
        const User :any = await dbService.getModel('User');
        let reqUser = await User.toModelObject(req, dbService);
        reqUser._id = req.initialUser.userId._id;
        await dbService.update('User', {_id: reqUser._id}, reqUser);
        resolve('Successfully updated');
      }catch (err){
        reject(ErrorHandler.handleErrDb(fname, err));
      }
    });
  }

  deleteUser(req) {
    const fname = 'UserCtrl.deleteUser';
    return new Promise(async (resolve, reject) => {
      console.log(req.body);
      let dbUser :any;
      try {
        dbUser = await dbService.findOneNotNull('InitialUser', {_id: req.cookies[constants.hashes.userId]},
            false, '+password');
      }catch (err) {
        reject(err);
      }
      if (await dbUser.comparePassword(req.body.password) === true) {
        await Promise.all([
          dbService.removeModel('InitialUser', {_id: req.initialUser._id}),
          dbService.removeModel('User', {_id: req.initialUser.userId._id})
        ]);
        resolve('Successfully deleted');
      }
      reject(ErrorHandler.handleErr(fname, 'Passwords do not match!', constants.errType.DB, 400));
    });
  }
}