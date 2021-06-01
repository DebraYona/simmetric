/* eslint-disable no-console */
const { success, failure, unAuthorized, badRequest } = require('../../lib/http-responses');
const { getData } = require('../../lib/authorizer');
const travel = require('../../data/travel');
const { getError } = require('../../lib/error_codes');
const { updateBatchProductStatusByWithNewTravel,
  processListInNewTravel } = require('../../lib/update_product_status');

module.exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const userData = getData(event.requestContext);
  const now = new Date();

  if (!body.products || body.products.length === 0) {
    const error = getError(1200);
    return badRequest({
      message: error.message,
      code: error.code,
      description: error.description,
      time: new Date(),
      statusCode: 400,
    });
  }
  body.travel.driver_user_id = userData.userId;
  body.travel.initiated_date = now;
  body.travel.driver_name = userData.name;
  body.travel.driver_last_name = userData.lastName;

  // It's not a driver
  if (userData.role !== '2') {
    return unAuthorized({}, event.requestContext);
  }


  console.log("TravelCreate")

  body.travel.packages_quantity = body.products.length;
  let dataTravel;
  if (body.travel.id) {
    dataTravel = await travel.getById(body.travel.id);
    if (dataTravel == null) {
      const error = getError(3000);
      return badRequest({
        message: error.message,
        code: error.code,
        description: error.description,
        time: new Date(),
        statusCode: 400,
      });
    }
    await travel.update(body.travel.id, body.travel);
  } else {
    dataTravel = await travel.create(body.travel);
  }
    // Process list of product to new travel in integration-api
    console.log("ProcessList")
    const requestValue = await processListInNewTravel(body);
    console.log(requestValue)

  // trace statuschange
  console.log("StatusUpdate")
  const dataProduct = await updateBatchProductStatusByWithNewTravel(
    dataTravel.id,
    body.products,
    'newTravel'
  );

  try {
    return success(
      {
        status: 'ok',
        data: dataTravel,
      },
      event.requestContext
    );
  } catch (error) {
    console.log(error);
    return failure(
      { status: 'fail', message: "We couldn't get create a new Travel" },
      event.requestContext
    );
  }
};
