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
    const { Dropoff } = await db();
    singleton = Dropoff;
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
    const dropoff = await init();
    const result = await dropoff.findByPk(id);
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
 * Return an object of the model by Order id empty if doesn't exist
 * @param {int} id of the model
 */
const getByOrderId = async (orderId) => {
  if (!orderId) {
    return {};
  }
  try {
    const dropoff = await init();
    const result = await dropoff.findOne({ where: { order_id: orderId }, raw: true });
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
 * Create a new dropoff
 * @param {*} body of the model
 */
const create = async (body, orderId) => {
  if (!body) {
    throw new Error('We need a body to create a new dropoff');
  }
  try {
    const dropoff = await init();
    const newDropoff = {
      order_id: orderId,
      address: body.drop_address || '',
      address_2: body.drop_address_line_2 || '',
      comuna: body.drop_comuna || '',
      observations: body.drop_observations || '',
      time: body.time,
      latitude: body.drop_latitude,
      longitude: body.drop_longitude,
    };
    const result = await dropoff.create(newDropoff);
    if (!result) {
      throw new Error("We couldn't create a new dropoff");
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Update dropoff info
 * @param {int} int of the model
 * @param {*} body to update
 */
const update = async (id, body) => {
  if (!id) {
    throw new Error('We need an id to update the dropoff info');
  }
  if (!body) {
    throw new Error('We need a body to update the dropoff info');
  }
  try {
    const dropoff = await init();
    const result = await dropoff.update(body, { where: { id } });
    if (!result) {
      throw new Error(`We couldn't update the dropoff with id ${id}`);
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Remove a dropoff by order id
 * @param {int} orderId of the model
 */
const removeByOrderId = async (orderId) => {
  if (!orderId) {
    throw new Error('We need the id of the order');
  }
  try {
    const dropoff = await init();
    await dropoff.destroy({ where: { order_id: orderId } });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

module.exports = {
  create,
  getById,
  getByOrderId,
  removeByOrderId,
  update,
};
