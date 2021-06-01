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
    const { Pickup } = await db();
    singleton = Pickup;
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
    const pickup = await init();
    const result = await pickup.findByPk(id);
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
    const pickup = await init();
    const result = await pickup.findOne({ where: { order_id: orderId }, raw: true });
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
 * Create a new pickup
 * @param {*} body of the model
 */
const create = async (body, orderId) => {
  if (!body) {
    throw new Error('We need a body to create a new pickup');
  }
  try {
    const pickup = await init();
    const newPickup = {
      order_id: orderId,
      address: body.pickup_address,
      address_2: body.pickup_address_line_2 || '',
      comuna: body.pickup_comuna,
      observations: body.pickup_observations,
      latitude: body.latitude || 0,
      longitude: body.longitude || 0,
      time: body.time,
    };
    const result = await pickup.create(newPickup);
    if (!result) {
      throw new Error("We couldn't create a new pickup");
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Remove an order and all the related data
 * @param {int} orderId of the model
 */
const removeByOrderId = async (orderId) => {
  if (!orderId) {
    throw new Error('We need the id of the order');
  }
  try {
    const pickup = await init();
    await pickup.destroy({ where: { order_id: orderId } });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Update pickup info
 * @param {int} int of the model
 * @param {*} body to update
 */
const update = async (id, body) => {
  if (!id) {
    throw new Error('We need an id to update the pickup info');
  }
  if (!body) {
    throw new Error('We need a body to update the pickup info');
  }
  try {
    const pickup = await init();
    const result = await pickup.update(body, { where: { id } });
    if (!result) {
      throw new Error(`We couldn't update the pickup with id ${id}`);
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
  getByOrderId,
  removeByOrderId,
  update,
};
