const errHandler = require('../../components/ErrorHandler');
const Config = require('../../components/Config');

export async function defaultCtrlCall(res, method: Function, ...params) {
  try {
    const data = await method.apply(this, params);
    if (data) {
      res.send(data);
    } else {
      res.sendStatus(200);
    }
  } catch (err) {

    if (!Config.database.production) {
      console.error(err);
      if(err.inner) {
        console.error(err.inner);
      }
    }

    if (err.code) {
      res.status(err.code).send({type: err.type, msg: err.msg});
    } else {
      err = errHandler.handleErrUnknown(method.name, err.message);
      res.sendStatus(err.code);
    }
  }
}
