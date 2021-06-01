const buyer = require('../data/buyer');
const dropoff = require('../data/dropoff');
const location = require('../data/location');
const order = require('../data/order');
const product = require('../data/product');
const receiver = require('../data/receiver');
const { success, failure, badRequest } = require('../lib/http-responses');
const { getError } = require('../lib/error_codes');

module.exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  let newOrder = {};
  try {
    // 1. Verify that is a unique service order id
    const existingOrder = await order.getByServiceOrderId(body.service_order_id);
    if (Object.keys(existingOrder).length > 0) {
      const error = getError(1000);
      return badRequest(
        {
          message: error.message,
          code: error.code,
          description: error.description,
          service_order_id: body.service_order_id,
        },
        event.requestContext
      );
    }

    // 2. Check location
    const checkLocation = await location.getById(body.location_id);
    if (Object.keys(checkLocation).length === 0) {
      const error = getError(1100);
      return badRequest(
        {
          message: error.message,
          code: error.code,
          description: error.description,
          service_order_id: body.service_order_id,
        },
        event.requestContext
      );
    }

    // TODO: Check if is necesary to match the location contact_id with the request contract_id

    // 3. Check that the array of products is not empty
    if (body.cuds.length <= 0) {
      const error = getError(1200);
      return badRequest(
        {
          message: error.message,
          code: error.code,
          description: error.description,
          service_order_id: body.service_order_id,
        },
        event.requestContext
      );
    }

    // 4. We create a new order

    const orderData = {
      service_order_id: body.service_order_id,
      contract_id: body.contract_id || '',
      last_mile: body.last_mile || 1,
      type_of_charge: body.type_of_charge,
      status: body.status || 'Pending',
      request_id: event.requestContext.requestId,
      location_id: body.location_id,
    };
    newOrder = await order.create(orderData);

    // 5. We create all products
    await product.createBatch(body.cuds, newOrder.id);

    // 6. We create the buyer
    await buyer.create(body.buyer, newOrder.id);

    // 7. We create the receiver
    await receiver.create(body.receiver, newOrder.id);

    // 8. We create the dropoff record
    await dropoff.create(body.dropoff, newOrder.id);

    return success(
      {
        status: 'ok',
        message: 'Order created waiting for verification',
        orderId: newOrder.id,
      },
      event.requestContext
    );
  } catch (error) {
    console.log(error);
    if (newOrder.id) {
      order.removeAll(newOrder.id);
    }
    return failure({
      success: false,
      message:
        error.message || 'There was a problem creating the order. Please verify your parameters.',
    });
  }
};
