const db = require('../models');

let singleton;

/**
 * Singleton for retreive model
 */
const init = async () => {
  if (singleton) {
    return singleton;
  }
  try {
    const { UploadFail } = await db();
    singleton = UploadFail;
    return singleton;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Return an object of the model by id empty if doesn't exist
 * @param {int} id of the model
 */
const getById = async (id) => {
  if (!id) {
    return {};
  }
  try {
    const uploadFail = await init();
    const result = await uploadFail.findByPk(id);
    if (!result) {
      return {};
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Create a new buyer
 * @param {*} body of the model
 */
const create = async (body) => {
  if (!body) {
    throw new Error('We need a body to create a new buyer');
  }
  try {
    const uploadFail = await init();
    const result = await uploadFail.create(body);
    if (!result) {
      throw new Error("We couldn't create a new buyer");
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};


module.exports = {
  create,
  getById,
};
