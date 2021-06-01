const { success, failure, badRequest, notFound } = require('../../lib/http-responses');
const travel = require('../../data/travel');
const product = require('../../data/product');

module.exports.handler = async (event) => {
  const { travelId } = event.pathParameters;
  if (!travelId) {
    return badRequest();
  }

  try {
    const exist = await travel.getById(travelId);

    if (!exist) {
      return notFound();
    }

    const data = await product.getByTravelId(travelId);

    return success(
      {
        status: 'ok',
        data,
      },
      event.requestContext
    );
  } catch (error) {
    console.log(error);
    return failure({ status: 'fail', message: "We couldn't get the Travel" }, event.requestContext);
  }
};
