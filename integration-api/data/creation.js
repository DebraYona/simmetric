/* eslint-disable no-console */
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
    const { Creation } = await db();
    singleton = Creation;
    return singleton;
  } catch (error) {
    throw new Error(error);
  }
};

const getByCUD = async (id) => {
  if (!id) {
    return {};
  }
  try {
    const creation = await init();
    const result = await creation.findByPk(id);
    if (!result) {
      return {};
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
const createBatch = async (bulkData) => {
  if (bulkData.length <= 0) {
    return 0;
  }
  try {
    const creation = await init();
    const result = await creation.bulkCreate(bulkData, {
      updateOnDuplicate: ['service_order_id'],
    });
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const create = async (body) => {
  if (!body) {
    throw new Error('We need a body to create a new creation entry');
  }
  try {
    const creation = await init();
    const result = await creation.create(body);
    if (!result) {
      throw new Error("We couldn't create a new creation entry");
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

module.exports = {
  getByCUD,
  create,
  createBatch,
};
