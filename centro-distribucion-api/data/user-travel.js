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
    const { UserTravel } = await db();
    singleton = UserTravel;
    return singleton;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Return an object of the model by id empty if doesn't exist
 * @param {int} id of the model
 */
const getByUserId = async (userId) => {
  if (!userId) {
    return {};
  }
  try {
    const user = await init();
    const result = await user.find({ where: { user_id: userId } });
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
 * Return an object of the model by Cognito id empty if doesn't exist
 * @param {int} id of the model
 */
const getByTravelId = async (travelId) => {
  if (!travelId) {
    return {};
  }
  try {
    const user = await init();
    const result = await user.findOne({ where: { travel_id: travelId }, raw: true });
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
 * Create a new usertravel
 * @param {*} body of the model
 */
const create = async (body) => {
  if (!body) {
    throw new Error('We need a body to create a new usertravel');
  }
  try {
    const user = await init();

    const result = await user.create(body);
    if (!result) {
      throw new Error("We couldn't create a new user");
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * Update user info
 * @param {int} int of the model
 * @param {*} body to update
 */
const update = async (id, body) => {
  if (!id) {
    throw new Error('We need an id to update the user info');
  }
  if (!body) {
    throw new Error('We need a body to update the user info');
  }
  try {
    const user = await init();
    const result = await user.update(body, { where: { id } });
    if (!result) {
      throw new Error(`We couldn't update the user with id ${id}`);
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

module.exports = {
  create,
  getByUserId,
  getByTravelId,
  update,
};
