import {getConnection} from "../../components/database/DbConnect";
import {DbService} from "../../services/general/DbService";
import {IFile} from "../../models/file/File";
import {Model} from 'mongoose';
import {ErrorHandler} from "../../components/ErrorHandler";

const dbService = DbService(getConnection());


export class FileController {
  createFile = (req) => {
    const fname = 'FileController.createFile';
    return new Promise(async (resolve, reject) => {
      try {
        req.body = req.file;
        const File: any = dbService.getModel<IFile>('File');
        const file: IFile = File.toModelObject(req, dbService);
        if(!file){
          reject(ErrorHandler.handleErrValidation(fname, "No file was selected."));
          return;
        }
        await file.save();
        resolve(file);
      } catch (err) {
        reject(ErrorHandler.handleErrDb(fname, err))
      }
    });
  }
}