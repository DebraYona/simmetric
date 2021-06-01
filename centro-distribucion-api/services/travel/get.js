const { success, failure, badRequest } = require('../../lib/http-responses');
const travel = require('../../data/travel');

module.exports.handler = async (event) => {
  const { travelId } = event.pathParameters;
  if (!travelId) {
    return badRequest();
  }

  try {
    const data = await travel.getById(travelId);

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
