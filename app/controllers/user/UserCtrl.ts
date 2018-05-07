import {getConnection} from "../../components/database/DbConnect";
import {DbService} from "../../services/general/DbService";
import {ErrorHandler} from "../../components/ErrorHandler";
import {ISocialMedias} from "../../models/user/SocialMedias";
import {IUser} from "../../models/user/User";
import {Model} from 'mongoose';
import {IInitialUser} from "../../models/user/InitialUser";
import {IContact} from "../../models/user/Contact";

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
        const user = dbService.findOneNotNull('User', {_id: req.initialUser.userId}, true, null, null,
            /*'skills projects contact socialMedias'*/'socialMedias contact');
        return resolve(user);
      } catch (err) {
        return reject(ErrorHandler.handleErrDb(fname, err));
      }
    }))
  }

  getUserByUsername(req) {
    const fname = 'UserCtrl.getUserByUsername';
    return new Promise((async (resolve, reject) => {
      try {
        let user: any = await dbService.findOneNotNull<IUser>('User', {username: req.params.username}, true, null, null, 'socialMedias contact'
            /*'skills projects contact socialMedias' TODO uncomment when all models are registered*/);
        const initialUser = await dbService.findOneNotNull<IInitialUser>('InitialUser', {userId: user._id}, true, 'email');
        user.email = initialUser.email;
        resolve(user);
      } catch (err) {
        reject(ErrorHandler.handleErrDb(fname, err));
      }
    }))
  }

  updateUser(req) {
    const fname = 'UserCtrl.updateUser';
    return new Promise(async (resolve, reject) => {
      try {
        const User: any = await dbService.getModel('User');
        let reqUser = await User.toModelObject(req, dbService);
        reqUser._id = req.initialUser.userId._id;
        await dbService.update('User', {_id: reqUser._id}, reqUser);
        resolve('Successfully updated');
      } catch (err) {
        reject(ErrorHandler.handleErrDb(fname, err));
      }
    });
  }

  updateUserSocialMedias(req) {
    const fname = 'UserCtrl.updateUserSocialMedias';
    return new Promise(async (resolve, reject) => {
      try {
        const SocialMedias: any = await dbService.getModel<ISocialMedias>('SocialMedias');
        let reqSocialMedias: ISocialMedias = SocialMedias.toModelObject(req, dbService);
        let user: IUser = await dbService.findByIdNotNull<IUser>('User', req.initialUser.userId, true);
        let dbSocialMedias: ISocialMedias;

        if (user.hasOwnProperty('socialMedias')) {
          reqSocialMedias._id = user.socialMedias;
          await dbService.update('SocialMedias', {_id: user.socialMedias}, reqSocialMedias);
        } else {
          dbSocialMedias = new SocialMedias(reqSocialMedias);
          dbSocialMedias.save();
          user.socialMedias = reqSocialMedias._id;
          await dbService.update('User', {_id: user._id}, user);
        }

        resolve('Successfully updated');
      } catch (err) {
        reject(ErrorHandler.handleErrDb(fname, err.message));
      }
    });
  }
  updateUserContact(req) {
    const fname = 'UserCtrl.updateUserContact';
    return new Promise(async (resolve, reject) => {
      try {
        const Contact: any = await dbService.getModel<IContact>('Contact');
        let reqContact: IContact = Contact.toModelObject(req, dbService);
        let user: IUser = await dbService.findByIdNotNull<IUser>('User', req.initialUser.userId, true);
        let dbContact: IContact;

        if (user.hasOwnProperty('contact')) {
          reqContact._id = user.contact;
          await dbService.update('Contact', {_id: user.contact}, reqContact);
        } else {
          dbContact = new Contact(reqContact);
          dbContact.save();
          user.contact = reqContact._id;
          await dbService.update('User', {_id: user._id}, user);
        }

        resolve('Successfully updated');
      } catch (err) {
        reject(ErrorHandler.handleErrDb(fname, err.message));
      }
    });
  }

  deleteUser(req) {
    const fname = 'UserCtrl.deleteUser';
    return new Promise(async (resolve, reject) => {
      let dbUser: any;
      try {
        dbUser = await dbService.findOneNotNull<IInitialUser>('InitialUser', {_id: req.cookies[constants.hashes.userId]},
            false, '+password');
      } catch (err) {
        return reject(err);
      }
      if (await dbUser.comparePassword(req.body.password)) {
        const user = await dbService.findByIdNotNull<IUser>('User', req.initialUser.userId);
        const promises: Promise<any>[] = [];
        promises.push(dbService.removeModel('InitialUser', {_id: req.initialUser._id}));
        promises.push(dbService.removeModel('User', {_id: req.initialUser.userId._id}));
        if(user.socialMedias){
          promises.push(dbService.removeModel('SocialMedias', {_id: user.socialMedias}));
        }
        await Promise.all(promises);
        return resolve('Successfully deleted');
      } else {
        return reject({ msg: 'Passwords do not match!', code: 400 });
      }
    });
  }
}