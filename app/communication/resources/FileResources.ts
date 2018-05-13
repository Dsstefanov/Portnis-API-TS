import {defaultCtrlCall} from "./UtilResources";
import {FileController} from "../../controllers/file/FileController";

const fileController = new FileController();
export function FileRoutes(router) {

  router.post('/images/upload', async (req, res) => {
    return defaultCtrlCall(res, fileController.createFile, req);
  });
}