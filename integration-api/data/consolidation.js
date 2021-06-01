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
    const { Consolidation } = await db();
    singleton = Consolidation;
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
    const consolidation = await init();
    const result = await consolidation.findByPk(id);
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
    const consolidation = await init();
    const result = await consolidation.bulkCreate(bulkData, {
      updateOnDuplicate: [
        'order_id',
        'service_order_id',
        'grouping',
        'scanned',
        'product_id',
        'booking_id',
      ],
    });
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const create = async (body) => {
  if (!body) {
    throw new Error('We need a body to create a new consolidation entry');
  }
  try {
    const consolidation = await init();
    const result = await consolidation.create(body);
    if (!result) {
      throw new Error("We couldn't create a new consolidation entry");
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
