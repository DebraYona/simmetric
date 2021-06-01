const order = require('../../data/order');
const { success, failure } = require('../../lib/http-responses');

module.exports.handler = async (event) => {
  const { orderId } = event.pathParameters;
  try {
    const data = await order.getCompleteOrder(orderId);
    return success(
      {
        status: 'ok',
        order_id: orderId,
        data,
      },
      event.requestContext
    );
  } catch (error) {
    console.log(error);
    return failure({ error }, event.requestContext);
  }
};
