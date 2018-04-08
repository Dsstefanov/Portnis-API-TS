import {Schema, Connection, Document} from 'mongoose';
import {cleanObject} from '../../services/general/DbService';

export class ErrorLog {
  functionName: string;
  message: string;
  timeStamp: Date;
}

export const ErrorLogSchema = new Schema({
  functionName: {type: String, required: true},
  message: {type: String, required: true},
  timeStamp: {type: Date, required: true}

});

ErrorLogSchema.statics.toModelObject = function (req, db) {
  const ErrorLog = db.model('ErrorLog');
  const result = new ErrorLog();

  result.functionName = req.body.functionName;
  result.message = req.body.message;
  result.timeStamp = req.body.timeStamp;

  return cleanObject(result);
};

export interface IErrorLog extends ErrorLog, Document {
}

export default function (db: Connection) {
  db.model<IErrorLog>('ErrorLog', ErrorLogSchema);
}
