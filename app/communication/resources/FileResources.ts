import {defaultCtrlCall} from "./UtilResources";
import {FileController} from "../../controllers/file/FileController";

const fileController = new FileController();
export function FileRoutes(router) {

  /**
   * @api {post} /images/upload Uploads a file
   * @apiDescription Uploads a file for now, in future will be limited to just images
   * @apiVersion 2.0.0
   * @apiName uploadImage
   * @apiGroup Files
   *
   * @apiUse SimpleSuccess
   * @apiUse BadRequestError
   *
   * @return InitialUser._id || null
   */
  router.post('/images/upload', async (req, res) => {
    return defaultCtrlCall(res, fileController.createFile, req);
  });
}