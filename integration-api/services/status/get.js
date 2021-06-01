const { success, failure } = require('../../lib/http-responses');
const status = require('../../data/status');

module.exports.handler = async (event) => {
  const { serviceOrderId } = event.pathParameters;
  try {
    const data = await status.getByOrderId(serviceOrderId);
    if (data.length > 0) {
      return success(
        {
          status: 'ORDER_STATUS_INFO',
          message: 'Status correctly retrieved',
          data,
        },
        event.requestContext
      );
    }
    return failure(
      { status: 'fail', message: 'There are no orders with this service order ID' },
      event.requestContext
    );
  } catch (error) {
    console.log(error);
    return failure(
      { status: 'fail', message: "We couldn't retrieve the status" },
      event.requestContext
    );
  }
};
