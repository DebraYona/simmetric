const { success, failure, badRequest, notFound } = require('../../lib/http-responses');
const travel = require('../../data/travel');
// const product = require('../../data/product');
const { getData } = require('../../lib/authorizer');
const { updateBatchProductStatusByTravelId } = require('../../lib/update_product_status');

module.exports.handler = async (event) => {
  const { travelId, status } = event.pathParameters;
  const userData = getData(event.requestContext);
  const travelBody = {};
  const now = new Date();
  if (!travelId) {
    return badRequest();
  }

  try {
    const travelData = await travel.getById(travelId);

    if (!travelData) {
      return notFound();
    }

    if (status === '220' || status === 220) {
      travelBody.warehouse_user_id = userData.userId;
      travelBody.verified_date = now;
      travelBody.warehouse_user_name = userData.name;
      travelBody.warehouse_user_last_name = userData.lastName;
    }

    await travel.update(travelId, { status: parseInt(status, 10), ...travelBody });
    // trace statuschange
    // await product.updateStatusByTravelId(travelId, parseInt(status, 10));
    await updateBatchProductStatusByTravelId(travelId, {
      newStatus: status,
      info: 'updateTravelStatus',
    });

    return success(
      {
        status: 'ok',
      },
      event.requestContext
    );
  } catch (error) {
    console.log(error);
    return failure({ status: 'fail', message: "We couldn't get the Travel" }, event.requestContext);
  }
};
