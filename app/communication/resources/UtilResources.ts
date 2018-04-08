import {ErrorHandler} from "../../components/ErrorHandler";
import {Config} from "../../components/Config";

export async function defaultCtrlCall(res, method: Function, ...params) {
  console.log(method);
  try {
    const data = await method.apply(null, params);
    if (data) {
      res.send(data);
    } else {
      res.sendStatus(200);
    }
  } catch (err) {

    if (!Config.config.database.production) {
      console.error(err);
      if(err.inner) {
        console.error(err.inner);
      }
    }

    if (err.code) {
      res.status(err.code).send({type: err.type, msg: err.msg});
    } else {
      err = ErrorHandler.handleErrUnknown(method.name, err.message);
      res.sendStatus(err.code);
    }
  }
}
