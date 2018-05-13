import {Connection, Document, Schema, Types} from 'mongoose';
import {cleanObject} from "../../services/general/DbService";
import * as validator from 'mongoose-validators';

export class File {
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

export const FileSchema = new Schema({
  address: {type: String, trim: true, validate: [validator.isLength(1, 1024)]},
  phone: {
    type: String,
    trim: true,
    validate: [validator.isLength(8), validator.matches(/(?:45\s)?(?:\d{2}\s){3}\d{2}/)]
  },
  valid: {type: Boolean},

  originalname: {type: String},
  encoding: {type: String},
  mimetype: {type: String},
  destination: {type: String},
  filename: {type: String},
  path: {type: String},
  size: {type: Number},
});

export interface IFile extends File, Document {
}


FileSchema.statics.toModelObject = function (req, dbService) {
  const File = dbService.getModel('File'); //Require model
  const result = new File(); //New File model object

  result.originalname = req.body.originalname;
  result.encoding = req.body.encoding;
  result.mimetype = req.body.mimetype;
  result.destination = req.body.destination;
  result.filename = req.body.filename;
  result.path = req.body.path;
  result.size = req.body.size;

  return cleanObject(result);
};

export default function (db: Connection) {
  db.model<IFile>('File', FileSchema);
}
