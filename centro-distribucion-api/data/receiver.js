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
    const { Receiver } = await db();
    singleton = Receiver;
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
    const receiver = await init();
    const result = await receiver.findByPk(id);
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
    const receiver = await init();
    const result = await receiver.findOne({ where: { order_id: orderId }, raw: true });
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
 * Create a new receiver
 * @param {*} body of the model
 */
const create = async (body, orderId) => {
  if (!body) {
    throw new Error('We need a body to create a new receiver');
  }
  try {
    const receiver = await init();
    const newReceiver = {
      order_id: orderId,
      name: body.receiver_name,
      phone_number: body.receiver_phone_number,
      email: body.receiver_email,
      rut: body.receiver_rut,
    };
    const result = await receiver.create(newReceiver);
    if (!result) {
      throw new Error("We couldn't create a new receiver");
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Remove a receiver by order id
 * @param {int} orderId of the model
 */
const removeByOrderId = async (orderId) => {
  if (!orderId) {
    throw new Error('We need the id of the order');
  }
  try {
    const receiver = await init();
    await receiver.destroy({ where: { order_id: orderId } });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Update receiver info
 * @param {int} int of the model
 * @param {*} body to update
 */
const update = async (id, body) => {
  if (!id) {
    throw new Error('We need an id to update the receiver info');
  }
  if (!body) {
    throw new Error('We need a body to update the receiver info');
  }
  try {
    const receiver = await init();
    const result = await receiver.update(body, { where: { id } });
    if (!result) {
      throw new Error(`We couldn't update the receiver with id ${id}`);
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
