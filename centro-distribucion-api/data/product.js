const { Op } = require("sequelize");
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
const getByTravelId = async (travelId) => {
  if (!travelId) {
    return [];
  }
  try {
    const product = await init();
    const { Order, Location, Dropoff } = await db();
    const result = await product.findAll({
      where: { travel_id: travelId },
      include: [
        {
          model: Order,
          include: [
            { model: Location, attributes: ['id', 'name', 'address', 'comuna'] },
            { model: Dropoff, attributes: ['id', 'address', 'comuna'] },
          ],
        },
      ],
      raw: true,
    });
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
 * Return an array of object of the model by Location id empty if doesn't exist
 * @param {int} id of the model
 */
const getByLocationId = async (locationId, status = 100) => {
  if (!locationId) {
    return [];
  }
  try {
    const product = await init();
    const { Order, Location, Dropoff } = await db();
    const result = await product.findAll({
      where: { status },
      include: [
        {
          model: Order,
          where: { location_id: locationId },
          include: [
            { model: Location, attributes: ['id', 'name', 'address', 'comuna'] },
            { model: Dropoff, attributes: ['id', 'address', 'comuna'] },
          ],
        },
      ],
      raw: true,
    });
    if (!result) {
      return [];
    }
    return result;
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

const getAllCD = async (filter,whereDates) => {
  try {
    const product = await init();
    const { Order, Location, Dropoff, Pickup, Receiver } = await db();

     // To filter with dates
     const whereConditionAssociation = {};

     if (whereDates.length) {
       whereConditionAssociation.time = {
         [Op.between]: whereDates
       }
     }

    // MISSING is_last_mile verification
    const result = await product.findAll({
      where: {
        last_mile: 0,
        ...filter,
      },
      include: [
        {
          model: Order,
          attributes: ['id', 'service_order_id', 'location_id'],
          include: [
            { model: Location, attributes: ['comuna', 'name'] },
            { model: Dropoff, attributes: ['comuna', 'address', 'address_2', 'time'] },
            { model: Receiver, attributes: ['name'] },
            {
              model: Pickup,
              attributes: ['comuna', 'time'],
              required: false,
              where: whereConditionAssociation
            },
          ],
        },
      ],
      raw: true,
    });
    if (!result) {
      return [];
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const listAllCDWthTravel = async (filter, pagination = { limit: 1000, offset: 0 }, whereDates) => {
  try {
    const product = await init();
    const { Travel, Order, Location, Dropoff, Pickup, Receiver } = await db();
    // MISSING is_last_mile verification
    const { limit, offset } = pagination;

    // To filter with dates
    const whereConditionAssociation = {};

    if (whereDates.length) {
      whereConditionAssociation.time = {
        [Op.between]: whereDates
      }
    }

    const result = await product.findAndCountAll({
      where: {
        last_mile: 0,
        ...filter,
      },
      include: [
        { model: Travel },
        {
          model: Order,
          attributes: ['id', 'service_order_id', 'location_id'],
          include: [
            { model: Location, attributes: ['id', 'name', 'address', 'comuna'] },
            { model: Dropoff, attributes: ['id', 'address', 'comuna','address_2', 'time'] },
            { model: Receiver, attributes: ['name'] },
            {
              model: Pickup,
              attributes: ['comuna', 'time'],
              required: false,
              where: whereConditionAssociation
            },
          ],
        },
      ],
      raw: true,
      limit,
      offset,
    });

    if (!result) {
      return { count: 0, rows: [] };
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
      fields: ['id', 'status', 'order_id'],
      updateOnDuplicate: ['id', 'status', 'order_id'],
    });
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const updateNewTravel = async (products, travelId, newStatus) => {
  if (products.length <= 0) {
    return 0;
  }
  try {
    const product = await init();
    const updatedProducts = products.map((p) => {
      const newP = {
        id: p.id,
        order_id: p.order_id || 9999999,
        status: newStatus || p.status,
        travel_id: travelId,
      };
      return newP;
    });
    console.log(updatedProducts)
    const result = await product.bulkCreate(updatedProducts, {
      fields: ['id', 'status', 'order_id', 'travel_id'],
      updateOnDuplicate: ['id', 'status', 'order_id', 'travel_id'],
      raw: true,
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

/**
 * Update a product by cud id
 * @param {int} cudId of the model
 */
const updateByCudId = async (cudId, body) => {
  if (!cudId) {
    throw new Error('We need the id of the CUD');
  }
  try {
    const product = await init();
    const result = await product.findOne({ where: { identifier: cudId } });
    return await result.update(body);
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
 * Update all product by order id
 * @param {int} cudId of the model
 */
const updateStatusByTravelId = async (travelId, status) => {
  if (!travelId) {
    throw new Error('We need the id of the order');
  }
  if (!status) {
    throw new Error('We need a status');
  }
  try {
    const product = await init();
    const result = await product.update({ status }, { where: { travel_id: travelId } });
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
  getByLocationId,
  getByOrderId,
  getByTravelId,
  listAllCDWthTravel,
  removeByOrderId,
  update,
  updateBatch,
  updateByCudId,
  updateNewTravel,
  updateStatusByOrderId,
  updateStatusByTravelId,
};
