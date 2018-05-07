import {Connection, Document, Schema, Types} from 'mongoose';
import {cleanObject} from "../../services/general/DbService";
import * as validator from 'mongoose-validators';


export class Contact {
  address?: string;
  phone?: string;
  valid?: boolean;
}

export const ContactSchema = new Schema({
  address: {type: String, trim: true, validate: [validator.isLength(1, 1024)]},
  phone: {type: String, trim: true, validate: [validator.isLength(8), validator.matches(/(?:45\s)?(?:\d{2}\s){3}\d{2}/)]},
  valid: {type: Boolean}
});

export interface IContact extends Contact, Document {
}


ContactSchema.statics.toModelObject = function (req, dbService) {
  const Contact = dbService.getModel('Contact'); //Require model
  const result = new Contact(); //New Contact model object

  result.address = req.body.address;
  result.phone = req.body.phone;

  return cleanObject(result);
};

export default function (db: Connection) {
  db.model<IContact>('Contact', ContactSchema);
}
