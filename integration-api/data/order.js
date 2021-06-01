/* eslint-disable no-console */
const db = require('../models');
const dropoff = require('./dropoff');
const buyer = require('./buyer');
const receiver = require('./receiver');
const product = require('./product');
const pickup = require('./pickup');

let singleton;

/**
 * Singleton for retreive model
 */
const init = async () => {
  if (singleton) {
    return singleton;
  }
  try {
    const { Order } = await db();
    singleton = Order;
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
    const order = await init();
    const result = await order.findByPk(id, { raw: true });
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
 * Return an order by service_order_id
 * @param {int} serviceOrder of the model
 */
const getByServiceOrderId = async (serviceOrder) => {
  if (!serviceOrder) {
    return {};
  }
  try {
    const order = await init();
    const result = await order.findOne({ where: { service_order_id: serviceOrder }, raw: true });
    if (!result) {
      return {};
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const getByJobId = async (jobID, additionalObject) => {
  if (!jobID) {
    return {};
  }
  try {
    const order = await init();
    const result = await order.findOne({ where: { job_id: jobID }, raw: true });
    if (!result) {
      return {};
    }
    return {...result, ...additionalObject};
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Create a new order
 * @param {*} body of the model
 */
const create = async (body) => {
  if (!body) {
    throw new Error('We need a body to create a new order');
  }
  try {
    const order = await init();
    const result = await order.create(body);
    if (!result) {
      throw new Error("We couldn't create a new order");
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Remove an order and all the related data
 * @param {*} body of the model
 */
const removeAll = async (orderId) => {
  if (!orderId) {
    throw new Error('We need the id of the order');
  }
  try {
    const result = await getById(orderId);
    const order = await init();

    if (!result) {
      throw new Error("The order doesn't exists");
    }

    await dropoff.removeByOrderId(orderId);
    await buyer.removeByOrderId(orderId);
    await product.removeByOrderId(orderId);
    await pickup.removeByOrderId(orderId);
    await receiver.removeByOrderId(orderId);

    await order.destroy({ where: { id: orderId } });

    if (!result) {
      throw new Error("We couldn't create a new order");
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Remove an order and all the related data
 * @param {*} body of the model
 */
const getCompleteOrder = async (orderId) => {
  if (!orderId) {
    throw new Error('We need the id of the order');
  }
  try {
    const result = await getById(orderId);

    if (!result) {
      throw new Error("The order doesn't exists");
    }

    const dropoffResult = await dropoff.getByOrderId(orderId);
    const buyerResult = await buyer.getByOrderId(orderId);
    const productResult = await product.getByOrderId(orderId);
    const pickupResult = await pickup.getByOrderId(orderId);
    const receiverResult = await receiver.getByOrderId(orderId);

    const getOrder = {
      ...result,
      dropoff: { ...dropoffResult },
      buyer: { ...buyerResult },
      products: [...productResult],
      pickup: { ...pickupResult },
      receiver: { ...receiverResult },
    };
    return getOrder;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Update an order
 * @param {int} int of the model
 */
const update = async (id, body) => {
  if (!id) {
    throw new Error('We need a id to update a order');
  }
  if (!body) {
    throw new Error('We need a body to update a order');
  }
  try {
    const order = await init();
    const result = await order.update(body, { where: { id } });
    if (!result) {
      throw new Error(`We couldn't update the order with id ${id}`);
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
  getByServiceOrderId,
  getByJobId,
  getCompleteOrder,
  removeAll,
  update,
};
