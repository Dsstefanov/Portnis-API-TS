import {Connection, Document, Schema, Types} from 'mongoose';
import * as validator from 'mongoose-validators';
import {cleanObject} from "../../services/general/DbService";

export class User {
  name:string;
  personalText: string;
  username: string;
  aboutText: string;
  projects: Schema.Types.ObjectId;
  skills: [Schema.Types.ObjectId];
  profileImage: string;
  profession: string;
  socialMedias: Schema.Types.ObjectId;
  contact: Schema.Types.ObjectId;
  valid: Boolean;
}

export const UserSchema = new Schema({
  name: {type: String, trim: true, validate: [validator.isLength(1, 128)]},
  personalText: {type: String, trim: true, validate: [validator.isLength(1, 20000)]},
  username: {
    type: String, trim: true, index: {unique: true, partialFilterExpression: {username: {$exists: true}}},
    validate: [validator.isLength(1, 64)]
  },
  aboutText: {type: String, trim: true, validate: [validator.isLength(1, 20000)]},
  projects: {type: [Schema.Types.ObjectId], ref: 'Project'},
  skills: {type: [Schema.Types.ObjectId], ref: 'Skill'},
  profileImage: {type: String, validate: [validator.isLength(1, 128)]},
  profession: {type: String, trim: true, validate: [validator.isLength(1, 128)]},
  socialMedias: {type: Schema.Types.ObjectId, ref: 'SocialMedias'},
  contact: {type: Schema.Types.ObjectId, ref: 'Contact'},
  valid: {type: Boolean}
});

export interface IUser extends User, Document {
}

UserSchema.pre('save', function (next) {
  const user :any = this;
  user.checkUserComplete(next);
});

/**
 * Validates and encrypts the user's password
 *
 * @param {function} next The callback to be called when password encrypted or with an error
 * @returns {*}
 */
UserSchema.methods.checkUserComplete = function (next) {
  const user = this;
  this.valid = user.name && typeof user.name === 'string' &&
      user.personalText && typeof user.personalText === 'string' &&
      user.username && typeof user.username === 'string' &&
      user.aboutText && typeof user.aboutText === 'string' &&
      user.profession && typeof user.profession === 'string' &&
      user.profileImage && typeof user.profileImage === 'string' &&
      user.projects && user.projects.isArray() && user.projects.length > 0 &&
      user.skills && user.skills.isArray() && user.skills.length > 0 && user.contact;

  next()

};

UserSchema.statics.toModelObject = function (req, dbService) {
  const User = dbService.getModel('User'); //Require model
  const result = new User(); //New User model object

  result.name = req.body.name;
  result.personalText= req.body.personalText;
  result.username= req.body.username;
  result.aboutText= req.body.aboutText;
  result.projects= req.body.projects;
  result.skills= req.body.skills;
  result.profileImage= req.body.profileImage;
  result.profession= req.body.profession;
  result.socialMedias= req.body.socialMedias;

  return cleanObject(result);
};


export default function (db: Connection) {
  db.model<IUser>('User', UserSchema);
}