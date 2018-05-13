import {Connection, Document, Schema, Types} from 'mongoose';
import {cleanObject} from "../../services/general/DbService";
import * as validator from 'mongoose-validators';
import {IFile} from "../file/File";


export class Project {
  title: string;
  description: string;
  technologies: string[];
  image?: Schema.Types.ObjectId | IFile;
  weblink?: string;
  githubLink: string;
  buildingReason?: string;
}

export const ProjectSchema = new Schema({
  title: {type: String, required: true, trim: true},
  description: {type: String, required: true, trim: true},
  technologies: {type: [String], required: true},
  image: {type: Schema.Types.ObjectId},
  webLink: {type: String, trim: true},
  githubLink: {type: String, required: true, trim: true},
  buildingReason: {type: String, required: true, trim: true}
});

export interface IProject extends Project, Document {
}


ProjectSchema.statics.toModelObject = function (req, dbService) {
  const Project = dbService.getModel('Project'); //Require model
  const result = new Project(); //New Project model object

  result.title = req.body.title;
  result.description = req.body.description;
  result.technologies = req.body['ads[technologies][]'];
  result.image = req.body['ads[image][_id]'];
  result.webLink = req.body.webLink;
  result.githubLink = req.body.githubLink;
  result.buildingReason = req.body.buildingReason;

  return cleanObject(result);
};

export default function (db: Connection) {
  db.model<IProject>('Project', ProjectSchema);
}
