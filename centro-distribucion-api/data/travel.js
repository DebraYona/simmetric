const { Op } = require('sequelize');
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
    const { Travel } = await db();
    singleton = Travel;
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
    const travel = await init();
    const result = await travel.findByPk(id);
    if (!result) {
      return null;
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Return a list of the model
 *
 */
const listAll = async (filter) => {
  let whereCondition = {};
  if (filter.status === 'dispatch') {
    whereCondition = { [Op.or]: [{ status: 210 }, { status: 215 }] };
  }

  if (filter.status === 'verified') {
    whereCondition = { status: 220 };
  }

  if (filter.status === 'delivered') {
    whereCondition = { status: 301 };
  }

  if (filter.status === 'returned') {
    whereCondition = { [Op.or]: [{ status: 240 }, { status: 230 }, { status: 290 }] };
  }

  if (filter.status === 'active') {
    whereCondition = { status: 201 };
  }

  try {
    const travel = await init();
    const result = await travel.findAll({
      where: whereCondition,
      raw: true,
      order: [['created_at', 'DESC']],
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
 * Create a new travel
 * @param {*} body of the model
 */
const create = async (body) => {
  if (!body) {
    throw new Error('We need a body to create a new travel');
  }
  try {
    const travel = await init();
    const result = await travel.create(body);
    if (!result) {
      throw new Error("We couldn't create a new travel");
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Update travel info
 * @param {int} int of the model
 * @param {*} body to update
 */
const update = async (id, body) => {
  if (!id) {
    throw new Error('We need an id to update the travel info');
  }
  if (!body) {
    throw new Error('We need a body to update the travel info');
  }
  try {
    const travel = await init();
    const result = await travel.update(body, { where: { id } });
    if (!result) {
      throw new Error(`We couldn't update the travel with id ${id}`);
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
  listAll,
  update,
};
