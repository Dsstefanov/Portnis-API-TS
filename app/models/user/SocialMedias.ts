import {Connection, Document, Schema, Types} from 'mongoose';
import * as validator from 'mongoose-validators';
import {getConnection} from '../../components/database/DbConnect';
import {ErrorHandler} from "../../components/ErrorHandler";
import {cleanObject} from "../../services/general/DbService";

const db = getConnection();

export class SocialMedias {
  facebook?: String;
  linkedIn?: String;
  github?: String;
  valid?: Boolean;
}

export const SocialMediasSchema = new Schema({
  facebook: {type: String, trim: true, validate: [validator.isLength(1, 1024)]},
  linkedIn: {type: String, trim: true, validate: [validator.isLength(1, 1024)]},
  github: {type: String, trim: true, validate: [validator.isLength(1, 1024)]},
  valid: {type: Boolean}
});

export interface ISocialMedias extends SocialMedias, Document {
}

SocialMediasSchema.pre('save', function (next) {
  const socialMedias :any = this;
  socialMedias.checkModelComplete(next);
});

SocialMediasSchema.methods.checkModelComplete = function (next: any) {
  const socialMedias = this;
  this.valid = !!(socialMedias.facebook && typeof socialMedias.facebook === 'string' &&
      socialMedias.facebook !== '' && socialMedias.linkedIn &&
      typeof socialMedias.linkedIn === 'string' && socialMedias.linkedIn !== '' &&
      socialMedias.github && typeof socialMedias.github === 'string' &&
      socialMedias.github !== '');
  next();
};

SocialMediasSchema.statics.toModelObject = function (req, dbService) {
  const SocialMedias = dbService.getModel('SocialMedias'); //Require model
  const result = new SocialMedias(); //New SocialMedias model object

  result.facebook = req.body.facebook;
  result.linkedIn = req.body.linkedIn;
  result.github = req.body.github;

  return cleanObject(result);
};


export default function (db: Connection) {
  db.model<ISocialMedias>('SocialMedias', SocialMediasSchema);
}