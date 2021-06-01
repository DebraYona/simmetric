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
    const { Product } = await db();
    singleton = Product;
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
    const product = await init();
    const result = await product.findByPk(id);
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
 * Return an array of object of the model by Order id empty if doesn't exist
 * @param {int} id of the model
 */
const getByOrderId = async (orderId) => {
  if (!orderId) {
    return [];
  }
  try {
    const product = await init();
    const result = await product.findAll({ where: { order_id: orderId }, raw: true });
    if (!result) {
      return [];
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Return an array of object of the model by Order id empty if doesn't exist
 * @param {int} id of the model
 */
const getByOrderIdWithAdditionalObject = async (orderId, additionalObject) => {
  if (!orderId) {
    return [];
  }
  try {
    const product = await init();
    const result = await product.findAll({ where: { order_id: orderId }, raw: true });
    if (!result) {
      return [];
    }
    return result.map((entry) => {
      return { ...entry, ...additionalObject };
    });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const getAllByStatus = async (status) => {
  if (!status) {
    return [];
  }
  try {
    const product = await init();
    // MISSING is_last_mile verification
    const result = await product.findAll({ where: { status }, raw: true });
    if (!result) {
      return [];
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const getAllCD = async (filter) => {
  try {
    const product = await init();
    // MISSING is_last_mile verification
    const result = await product.findAll({ where: { last_mile: 0, ...filter }, raw: true });
    if (!result) {
      return [];
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const getByCudId = async (cudId) => {
  if (!cudId) {
    return {};
  }
  try {
    const product = await init();
    const result = await product.findOne({ where: { identifier: cudId } });
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
 * Create a new product
 * @param {*} body of the model
 */
const create = async (body) => {
  if (!body) {
    throw new Error('We need a body to create a new product');
  }
  try {
    const product = await init();
    const result = await product.create(body);
    if (!result) {
      throw new Error("We couldn't create a new product");
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const createBatch = async (products, orderId) => {
  if (products.length <= 0) {
    return 0;
  }
  try {
    const product = await init();
    const newProducts = products.map((p) => {
      const newP = {
        order_id: orderId,
        guide_number: p.guide_number || '',
        identifier: p.cud_id,
        sku: p.sku || '',
        status: p.cud_status,
        description: p.product_description,
        price: p.product_price,
        quantity: p.product_quantity || 1,
        last_mile: p.last_mile,
        returned: p.returned || 0,
        confirmed_status: p.confirmed_status
      };
      return newP;
    });
    const result = await product.bulkCreate(newProducts);
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const updateBatch = async (products) => {
  if (products.length <= 0) {
    return 0;
  }
  try {
    const product = await init();

    const result = await product.bulkCreate(products, {
      updateOnDuplicate: ['guide_number', 'description', 'price', 'quantity'],
    });
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Remove a product by order id
 * @param {int} orderId of the model
 */
const removeByOrderId = async (orderId) => {
  if (!orderId) {
    throw new Error('We need the id of the order');
  }
  try {
    const product = await init();
    await product.destroy({ where: { order_id: orderId } });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const removeByCudId = async (cudId) => {
  if (!cudId) {
    throw new Error('We need the id of the cud');
  }
  try {
    const product = await init();
    await product.destroy({ where: { identifier: cudId } });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Update a product by cud id and register
 * @param {int} cudId of the model
 */
const updateByCudId = async (cudId, body) => {
  if (!cudId) {
    throw new Error('We need the id of the CUD');
  }
  try {
    const product = await init();
    const { UploadFail } = await db();
    const result = await product.findOne({ where: { identifier: cudId } });
    if (!result) {
      console.log(`CUD NOT FOUND ${cudId}`);
      await UploadFail.create({ identifier: cudId });
      return result;
    }
    await result.update(body);
    console.log(result);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Update a product by cud id and register without registering to uploadFail table
 * @param {int} cudId of the model
 */
const updateByCudIdWithoutUpload = async (cudId, body) => {
  if (!cudId) {
    throw new Error('We need the id of the CUD');
  }
  try {
    const product = await init();
    const result = await product.findOne({ where: { identifier: cudId } });
    if (!result) {
      console.log(`CUD NOT FOUND ${cudId}`);
      return result;
    }
    await result.update(body);
    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Update all product by order id
 * @param {int} cudId of the model
 */
const updateStatusByOrderId = async (orderId, status) => {
  if (!orderId) {
    throw new Error('We need the id of the order');
  }
  if (!status) {
    throw new Error('We need a status');
  }
  try {
    const product = await init();
    const result = await product.update({ status }, { where: { order_id: orderId } });
    console.log(result);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Update product info
 * @param {int} int of the model
 * @param {*} body to update
 */
const update = async (id, body) => {
  if (!id) {
    throw new Error('We need an id to update the product info');
  }
  if (!body) {
    throw new Error('We need a body to update the product info');
  }
  try {
    const product = await init();
    const result = await product.update(body, { where: { id } });
    if (!result) {
      throw new Error(`We couldn't update the product with id ${id}`);
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

module.exports = {
  create,
  createBatch,
  getAllByStatus,
  getAllCD,
  getByCudId,
  getById,
  getByOrderId,
  getByOrderIdWithAdditionalObject,
  removeByOrderId,
  removeByCudId,
  update,
  updateBatch,
  updateByCudId,
  updateByCudIdWithoutUpload,
  updateStatusByOrderId,
};
