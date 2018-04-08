import {Connection, Document, Model, Query} from 'mongoose';
import {ErrorHandler} from "../../components/ErrorHandler";

const constants = require('../../components/Constants');

export function DbService(db: Connection) {

  const getModel = function <T extends Document>(modelName: string): Model<T> {
    return db.model(modelName);
  };

  const toModelObject = function (modelName, req, db) {
    return db.model(modelName).toModelObject(req, db);
  };

  /**
   * Finds a model by id
   *
   * @param {String} modelName The name of the model for example: User, InitialUser, Contact
   * @param {String} modelId The id of the model
   * @param {Boolean} [lean] If it's set to true it will return a stringify version
   *                                 of the model. It performs way faster than the normal find but
   *                                 since it's not returning a mongoose object you will not be able
   *                                 to perform operations like save, update etc on it.
   * @param {Object|String|[Object]} [populate] The object indicating which reference fields should be
   *                                   populated. See: http://mongoosejs.com/docs/populate.html
   * @param {Object|String} [projection] The object indicating which reference fields should be
   *                                   projected.
   * @param {function} [callback] callback(err, findObject) The function that will run after
   *  err (Object) null if there are no errors
   *  findObject (Object) model object that match the id.
   * @return {Promise<Document>}
   */
  const findById = function <T extends Document>(modelName, modelId, lean?, populate?, projection?, callback?): Promise<T> {

    if (typeof lean === 'function') {
      callback = lean;
      lean = null;

      populate = null;
    } else if (typeof populate === 'function') {
      callback = populate;
      populate = null;
    } else if (typeof projection === 'function') {
      callback = projection;
      projection = null;
    }

    const Model = db.model(modelName);

    let query = Model.findById(modelId);
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach(el => query.populate(el));
      } else {
        if (typeof populate === 'string' || typeof populate === 'object') {
          query = query.populate(populate);
        }
      }
    }

    if (lean) {
      query = query.lean();
    }
    if (projection) {
      query = query.select(projection);
    }

    if (typeof callback === 'function') {
      return query.exec()
          .then(result => {
            return callback(null, result);
          }, err => {
            return callback(ErrorHandler.handleErr(null,
                `Could not fetch ${modelName.toLowerCase()} model for id: ${modelId}`,
                constants.errType.DB, 400, err));
          });
    }

    return ((query.exec()) as Promise<T>).catch(err => {
      throw ErrorHandler.handleErrDb(null,
          `Could not fetch ${modelName.toLowerCase()} model for id: ${modelId}`, err)
    });
  };

  const findByIdNotNull = async function <T extends Document>(modelName, modelId, lean?,
                                                              populate?, projection?): Promise<T> {
    const model = await findById<T>(modelName, modelId, lean, populate, projection);
    if (model === null) {
      throw ErrorHandler.handleErrDb(null,
          `Could not fetch ${modelName.toLowerCase()} model for id: ${modelId}`);
    }
    return model;
  };

  const findOne = async function <T extends Document>(modelName, conditions, lean?,
                                                      fields?, options?, populate?): Promise<T> {
    options = options || {};
    options.limit = 1;

    const models = await find(modelName, conditions, lean, fields, options, populate);
    if (models && models.length > 0) {
      return <T>models[0];
    }

    return null;
  };

  const findOneNotNull = async function <T extends Document>(modelName, conditions, lean?, fields?, options?,
                                                             populate?): Promise<T> {
    const model = await findOne<T>(modelName, conditions, lean, fields, options, populate);
    if (model === null) {
      throw ErrorHandler.handleErrDb(null,
          `Could not fetch ${modelName.toLowerCase()} model ${modelName} for condition: ${conditions}`,);
    }
    return model;
  };

  const count = async function (modelName, conditions) {
    const Model = db.model(modelName);
    return await Model
        .count(conditions)
        .catch(err => {
          throw ErrorHandler.handleErrDb('DbService.count', 'Could not count the model.', err);
        });
  };

  /**
   * Finds models
   *
   * @param {String} modelName The name of the model for example: User, InitialUser, Project
   * @param {Object} conditions The query parameters for example {'title': 'Portfolio Generator'}
   * @param {Boolean} [lean] If it's set to true it will return a stringify version
   *                                 of the model. It performs way faster than the normal find but
   *                                 since it's not returning a mongoose object you will not be able
   *                                 to perform operations like save, update etc on it.
   * @param {String} [fields] Works like projection. Example 'firstName lastName' it will
   *                                 only return the first name and the last name for each model.
   * @param {Object} [options] Additional options can be added here. For example
   *                                  { sort: { name: -1 }} it will sort the models by name.
   * @param {Object|String|[Object]} [populate] The object indicating which reference fields should be
   *                                   populated. See: http://mongoosejs.com/docs/populate.html
   * @param {String} [distinct] It will return distinct results based on the passed variables.
   *                            E.g. 'firstName lastName'
   * @param {function} [callback] callback(err, findObject) The function that will run after
   *  err (Object) null if there are no errors
   *  findObject (Array) array of model objects that match the condition criteria.
   * @return {Promise<Object[]>}
   */
  const find = function <T extends Document>(modelName, conditions, lean?, fields?, options?, populate?,
                                             distinct?, callback?) {

    if (typeof lean === 'function') {
      callback = lean;
      lean = null;
      fields = null;
      options = null;
    } else if (typeof fields === 'function') {
      callback = fields;
      fields = {};
      options = {};
    } else if (typeof options === 'function') {
      callback = options;
      options = {};
    } else if (typeof populate === 'function') {
      callback = populate;
      populate = null;
    } else if (typeof distinct === 'function') {
      callback = distinct;
      distinct = null;
    }

    const Model = db.model<T>(modelName);

    let query = Model.find(conditions, fields, options) as Query<Object>;
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach(el => query.populate(el));
      } else {
        if (typeof populate === 'string' || typeof populate === 'object') {
          query = query.populate(populate);
        }
      }
    }

    if (lean) {
      query = query.lean();
    }
    if (distinct) {
      query = query.distinct(distinct);
    }

    if (typeof callback === 'function') {
      return query.exec()
          .then(result => {
            callback(null, result);
            return result
          }, err => {
            return callback(ErrorHandler.handleErr(null,
                `Could not fetch ${modelName.toLowerCase()} models. Query params used:  ${conditions}`,
                constants.errType.DB, 400, err));
          });
    }

    return ((query.exec()) as Promise<T[]>).catch(err => {
      throw ErrorHandler.handleErrDb(null,
          `Could not fetch ${modelName.toLowerCase()} models. Query params used: ${conditions}`, err);
    });
  };

  /**
   * Update models
   *
   * @param {String} modelName The name of the model for example: User, InitialUser, Contact
   * @param {Object} conditions The query parameters for example {'username': 'dsstefanov'}
   * @param {Object} update What should be updated. For example { $inc: { profession: 'Software developer' }}
   * @param {Object} [options] Additional options can be added here. For example
   *                                  { multi: true } it will update all the documents that matches
   *                                  the conditions.
   * @param {function} callback callback(err) The function that will run after
   *  err (Object) null if there are no errors
   * @return {Promise}
   */
  const update = function (modelName: string, conditions: object, update: object, options?, callback?): Promise<any> {
    let Model;

    if (typeof options === 'function') {
      callback = options;
      options = {};
      Model = db.model(modelName);
    } else {
      Model = db.model(modelName);
    }

    if (typeof callback === 'function') {
      return Model.update(conditions, update, options, function (err) {
        if (err) {
          err = ErrorHandler.handleErr(null,
              `Could not update ${modelName.toLowerCase()} models. Conditions: ` +
              `${conditions} update: ${update} options: ${options}`,
              constants.errType.DB, 400, err);
        }

        return callback(err);
      });
    }

    return Model.update(conditions, update, options).exec().catch(err => {
      throw ErrorHandler.handleErr(null,
          `Could not update ${modelName.toLowerCase()} models. Conditions: ` +
          `${conditions} update: ${update} options: ${options}`,
          constants.errType.DB, 400, err);
    });
  };

  /**
   * Remove models
   *
   * @param {String} modelName The name of the model for example: User, InitialUser, Contact
   * @param {Object} conditions The query parameters for example {'pathwayName': 'Test pathway'}
   * @param {function} callback callback(err) The function that will run after
   *  err (Object) null if there are no errors
   * @returns {Promise<any>}
   */
  const removeModel = async function (modelName: string, conditions: Object,
                                callback?: Function): Promise<any> {
    let Model = await db.model(modelName);

    if (typeof callback === 'function') {
      return Model.remove(conditions, function (err) {
        if (err) {
          err = ErrorHandler.handleErr(null,
              `Could not remove ${modelName.toLowerCase()} models. Conditions: ${conditions}`,
              constants.errType.DB, 400, err);
        }

        return callback(err);
      });
    }

    return Model
        .remove(conditions)
        .catch(err => {
          throw ErrorHandler.handleErr(null,
              `Could not remove ${modelName.toLowerCase()} models. Conditions: ${conditions}`,
              constants.errType.DB, 400, err);
        });
  };

  /**
   * Saves a mongoose object to the database
   *
   * @param {Object} modelObject The object to be saved
   * @param {function} [callback] (err, savedObject)
   *  err (Object) null if there are no errors
   *  savedObject (Object) the saved object
   *
   * @return {Promise<Model>}
   */
  const save = function <T extends Document>(modelObject, callback?): T {
    if (typeof callback == 'function') {
      modelObject.save(function (err, savedObject) {
        if (err) {
          err = ErrorHandler.handleErrDb('DbService.save', 'Cold not save the model.', err);
        }
        return callback(err, savedObject);
      });
    } else {
      return modelObject
          .save()
          .catch(err => {
            throw ErrorHandler.handleErrDb('DbService.save', 'Could not save the model.', err);
          });
    }
  };

  /**
   * Populates the referenced fields in an array of documents of the same type
   *
   * @param {Object[]} documents The array of documents that will be populated
   * @param {String | Object | Object[]} populate The object indicating which reference fields should be
   *                                   populated. See: http://mongoosejs.com/docs/populate.html
   * @param {String} [modelName] The name of the model for example: User, Questionnaire, Pathway.
   * Only to be used when JSON objects are going to be populated.
   * @return {Promise<Model>}
   */
  const fetchModelReference = function <T extends Document>(documents: T[],
                                                            populate: string | object | object[],
                                                            modelName?: string) {
    if (typeof documents[0].populated !== 'function') {
      const docIds = documents.map(doc => doc._id);
      return this.find(modelName, {_id: {$in: docIds}}, true, null, null, populate);
    }

    let referenceFields = '';

    if (Array.isArray(populate)) {
      populate.forEach(item => {
        return referenceFields += item['path'] + ' '
      });
    } else {
      if (typeof populate === 'string') {
        referenceFields = populate;
      }

      if (typeof populate === 'object') {
        referenceFields = populate['path'];
      }
    }

    if (documents.length === 0 ||
        (typeof documents[0].populated === 'function' && documents[0].populated(referenceFields))) {
      return documents;
    }

    try {
      const populateObject = typeof populate === 'string' ? {path: referenceFields} : populate;
      return (<any>documents[0].constructor) // model
          .populate(documents, populateObject);
    } catch (err) {
      throw ErrorHandler.handleErrDb('DbService.fetchModelReference',
          'Could not populate the model.', JSON.stringify(err));
    }
  };

  /**
   * InsertMany does NOT call pre-save middleware
   * http://mongoosejs.com/docs/api.html#model_Model.insertMany
   */
  const insertMany = function <T extends Document>(modelName: string, documents: T[]) {
    const Model = db.model(modelName);
    return Model.collection.insertMany(documents)
        .catch(err => {
          throw ErrorHandler.handleErrDb('DbService.insertMany', 'Could not insert many model.', err);
        });
  };

  const updateMany = function <T extends Document>(modelName: string, filter: any, update: any) {
    const Model = db.model(modelName);
    return Model.collection.updateMany(filter, update)
        .catch(err => {
          throw ErrorHandler.handleErrDb('DbService.updateMany', 'Could not update many model.', err);
        });
  };

  const deleteMany = function <T extends Document>(modelName: string, filter: any) {
    const Model = db.model(modelName);
    return Model.collection.deleteMany(filter)
        .catch(err => {
          throw ErrorHandler.handleErrDb('DbService.deleteMany', 'Could not delete many model.', err);
        });
  };

  return {
    getModel,
    toModelObject,
    removeModel,
    find,
    findOne,
    findOneNotNull,
    findById,
    findByIdNotNull,
    save,
    update,
    count,
    insertMany,
    updateMany,
    deleteMany,
    fetchModelReference
  };
};

/**
 * Delete the object attributes that are null or undefined
 *
 * @param {Object} obj The object to be cleaned
 * @returns {Object} obj A clean version of the object
 */
export function cleanObject(obj) {
  for (let propName in obj) {
    if (obj.hasOwnProperty(propName) && obj[propName] === null || obj[propName] === undefined) {
      delete obj[propName];
    }
  }

  return obj;
}