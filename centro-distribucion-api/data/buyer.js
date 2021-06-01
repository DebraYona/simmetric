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
    const { Buyer } = await db();
    singleton = Buyer;
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
    const buyer = await init();
    const result = await buyer.findByPk(id);
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
    const buyer = await init();
    const result = await buyer.findOne({ where: { order_id: orderId }, raw: true });
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
const create = async (body, orderId) => {
  if (!body) {
    throw new Error('We need a body to create a new buyer');
  }
  try {
    const buyer = await init();
    const newBuyer = {
      order_id: orderId,
      name: body.buyer_name,
      phone_number: body.buyer_phone_number,
      email: body.buyer_email,
      rut: body.buyer_rut,
    };
    const result = await buyer.create(newBuyer);
    if (!result) {
      throw new Error("We couldn't create a new buyer");
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Remove a buyer by order id
 * @param {int} orderId of the model
 */
const removeByOrderId = async (orderId) => {
  if (!orderId) {
    throw new Error('We need the id of the order');
  }
  try {
    const buyer = await init();
    await buyer.destroy({ where: { order_id: orderId } });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Update buyer info
 * @param {int} int of the model
 * @param {*} body to update
 */
const update = async (id, body) => {
  if (!id) {
    throw new Error('We need an id to update the buyer info');
  }
  if (!body) {
    throw new Error('We need a body to update the buyer info');
  }
  try {
    const buyer = await init();
    const result = await buyer.update(body, { where: { id } });
    if (!result) {
      throw new Error(`We couldn't update the buyer with id ${id}`);
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
