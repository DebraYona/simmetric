const { success, failure, badRequest, notFound } = require('../../lib/http-responses');
const order = require('../../data/order');
const pickup = require('../../data/pickup');
const dropoff = require('../../data/dropoff');

module.exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const { serviceOrder, ...newData } = body;
  if (!serviceOrder || !newData) {
    return badRequest();
  }

  const { pickupTime, ...newDropoff } = newData;
  
  try {
    const getOrder = await order.getByServiceOrderId(serviceOrder);

    const updatedPickup = await pickup.update(getOrder.id, {time: pickupTime});
    const updatedDropoff = await dropoff.update(getOrder.id, newDropoff);

    if (!updatedPickup || Object.keys(updatedPickup).length === 0) {
      return notFound();
    }
    if (!updatedDropoff || Object.keys(updatedDropoff).length === 0) {
      return notFound();
    }
    return success(
      {
        status: 'ok',
        data: {updatedDropoff, updatedPickup}
      },
      event.requestContext
    );
  } catch (error) {
    console.log(error);
    return failure(
      { status: 'fail', message: "We couldn't update the product" },
      event.requestContext
    );
  }
};