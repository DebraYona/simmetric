const {
  success,
  failure,
  unAuthorized,
  badRequest,
  notFound,
} = require('../../lib/http-responses');
const { getData } = require('../../lib/authorizer');
const travel = require('../../data/travel');
const { getError } = require('../../lib/error_codes');
const { updateBatchProductStatusByWithNewTravel } = require('../../lib/update_product_status');

module.exports.handler = async (event) => {
  const { travelId } = event.pathParameters;
  if (!travelId) {
    return badRequest();
  }
  const body = JSON.parse(event.body);
  const userData = getData(event.requestContext);

  console.log(event.requestContext);
  console.log(body);
  console.log(userData);

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

  // It's not a driver
  if (userData.role !== '2' && userData.role !== '4') {
    return unAuthorized({}, event.requestContext);
  }

  const dataTravel = await travel.getById(travelId);

  if (!dataTravel) {
    return notFound();
  }
  // trace statuschange
// trace statuschange
const dataProduct = await updateBatchProductStatusByWithNewTravel(
  body.products,
  dataTravel.id,
  'saveTravelLoad'
);

  console.log(dataProduct);

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
