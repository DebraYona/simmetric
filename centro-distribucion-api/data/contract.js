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
    const { Contract } = await db();
    singleton = Contract;
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
    const contract = await init();
    const result = await contract.findByPk(id);
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
 * Create a new contract
 * @param {*} body of the model
 */
const create = async (body) => {
  if (!body) {
    throw new Error('We need a body to create a new contract');
  }
  try {
    const contract = await init();
    const result = await contract.create(body);
    if (!result) {
      throw new Error("We couldn't create a new contract");
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Remove a contract by id
 * @param {int} id of the model
 */
const removeById = async (id) => {
  if (!id) {
    throw new Error('We need the id of the order');
  }
  try {
    const contract = await init();
    await contract.destroy({ where: { id } });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

module.exports = {
  getById,
  create,
  removeById,
};
