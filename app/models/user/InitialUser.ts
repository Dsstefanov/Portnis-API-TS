import {Connection, Document, Schema, Types} from 'mongoose';
import * as validator from 'mongoose-validators';
import {getConnection} from '../../components/database/DbConnect';
import {ErrorHandler} from "../../components/ErrorHandler";
import {cleanObject} from "../../services/general/DbService";

const bcrypt = require('bcrypt-nodejs');

export class InitialUser {
  email: string;
  password?: string;
  remember_token?: string;
  userId?: string;
}

export const InitialUserSchema = new Schema({
  remember_token: {type: String},
  password: {type: String, required: true, trim: true, validate: [validator.isLength(8, 128)], select: false},
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail(), validator.isLength(1, 128)]
  },
  userId: {type: Schema.Types.ObjectId, ref: 'User'}
});

export interface IInitialUser extends InitialUser, Document {
}

InitialUserSchema.pre('save', function (next) {
  const user :any = this;
  user.encryptPassword(next);
});

/**
 * Validates and encrypts the user's password
 *
 * @param {function} next The callback to be called when password encrypted or with an error
 * @returns {*}
 */
InitialUserSchema.methods.encryptPassword = function (next) {
  const user = this;
  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }

  if (user.password.length < 8) {
    return next(new Error('Password does not match criteria'));
  }

  // Generate a salt - set number of rounds to 8
  // (times the password is hashed should be 2^8 = 256 iterations)
  // 8 rounds seems to give an average response time (authentication) of about 150 ms
  // 12 rounds seems to give an average response time (authentication) of about 1800 ms
  bcrypt.genSalt(8, function (err, salt) {
    if (err) {
      ErrorHandler.createErrorLog('InitialUser.preSave', err);
      return next(err);
    }

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, null, function (err, hash) {
      if (err) {
        ErrorHandler.createErrorLog('InitialUser.preSave', err);
        return next(err);
      }

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });

};

/**
 * Validates that a supplied password is equal to the one stored in the database
 *
 * @param  candidatePassword The password supplied by the user to compare with one in db
 * @param  callback Callback method
 */
InitialUserSchema.methods.comparePassword = async function (candidatePassword: string, callback?: Function) {
  const db = getConnection();
  if (callback) {
    const User = db.model<IInitialUser>('InitialUser');
    User.findOne({_id: this._id}, 'password')
        .then((user) => {
          bcrypt.compare(candidatePassword, user.password, function (err, isMatch) {
            if (err) {
              ErrorHandler.createErrorLog('InitialUserSchema.comparePassword', err);
              return callback(err);
            }
            callback(null, isMatch);
          });
        })
        .catch((err) => {
          return callback(err);
        })
  } else {
    const User = db.model<IInitialUser>('InitialUser');
    const user = await User.findOne({_id: this._id}, 'password');
    return bcrypt.compareSync(candidatePassword, user.password);
  }
};

InitialUserSchema.statics.toModelObject = function (req, dbService) {
  const User = dbService.getModel('InitialUser'); //Require model
  const result = new User(); //New User model object

  result.email = req.body.email;
  result.password = req.body.password;

  return cleanObject(result);
};


export default function (db: Connection) {
  db.model<IInitialUser>('InitialUser', InitialUserSchema);
}