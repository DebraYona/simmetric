const location = require('../../data/location');
const buyer = require('../../data/buyer');
const dropoff = require('../../data/dropoff');
const order = require('../../data/order');
const product = require('../../data/product');
const receiver = require('../../data/receiver');
const pickup = require('../../data/pickup');
const status = require('../../data/status');
const { success, failure } = require('../../lib/http-responses');
const { getProductStatus } = require('../../lib/product_status');

module.exports.handler = async (event) => {
  console.log('Starting SQS Order Process...');

  // 0. Load event info
  const body = JSON.parse(event.body);
  console.log(body.last_mile);
  const cuds = [];
  body.cuds.forEach((entry) => {
    cuds.push({
      guide_number: entry.guide_number,
      cud_id: entry.cud,
      cud_status: getProductStatus('100').code,
      product_description: entry.product_description,
      product_price: entry.product_price,
      product_quantity: entry.product_quantity,
      last_mile: body.last_mile,
      returned: 0,
      cd_status: entry.cd_status,
    });
  });

  // TO_DO: Error check no cuds or wrong parameters

  // 1. Get sucursales
  const locationQuery = await location.getById(body.location_id);
  console.log(locationQuery);
  // TO_DO: database error connections or id not found

  if (!body.last_mile) {
    // change to CD if it is not a last mile delivery
    locationQuery.address = 'Direccion CD Transvip';
    locationQuery.name = 'CD Transvip';
    locationQuery.comuna = 'Comuna Transvip';
    locationQuery.latitude = '-33.454773'; // static airport, NEEDS CONFIRMATION
    locationQuery.longitude = '-70.600517'; // static airport, NEEDS CONFIRMATION
    locationQuery.pickup_time = '09:00:00';
    console.log(locationQuery);
  }

  let newOrder = {};
  try {
    const orderData = {
      service_order_id: body.service_order_id,
      contract_id: locationQuery.contract_id || '',
      last_mile: body.last_mile,
      type_of_charge: body.type_of_charge,
      status: body.status || 'Created',
      job_id: 1,
      route_id: 1,
      // request_id: event.requestContext.requestId,
      location_id: body.location_id,
      quantity_boxes: body.quantity_boxes,
    };
    newOrder = await order.create(orderData);

    // 6.5. We create all products
    await product.createBatch(cuds, newOrder.id);

    // 6.6. We create the buyer
    await buyer.create(body.buyer, newOrder.id);

    // 6.7. We create the receiver
    await receiver.create(body.receiver, newOrder.id);

    // 6.8. We create the dropoff record

    await dropoff.create({ ...body.dropoff }, newOrder.id);

    // 6.9 We create the pickup record with updated info
    const pickupData = {
      order_id: newOrder.id,
      pickup_address: locationQuery.address,
      pickup_address_line_2: locationQuery.address_2,
      pickup_comuna: locationQuery.comuna,
      pickup_observations: 'Demo',
      latitude: locationQuery.latitude,
      longitude: locationQuery.longitude,
      time: Date.now(),
    };
    await pickup.create(pickupData, newOrder.id);
  } catch (error) {
    console.log(error);
    if (newOrder.id) {
      order.removeAll(newOrder.id);
    }
    await status.create({
      service_order_id: body.service_order_id,
      status: 'ORDER_NOT_CREATED',
      message: 'There was a problem creating the order. Please verify your parameters.',
      data: '',
    });
    return failure({
      success: false,
      message:
        error.message || 'There was a problem creating the order. Please verify your parameters.',
    });
  }
  // 7. send OK notification to status table

  await status.create({
    service_order_id: body.service_order_id,
    job_id: 1,
    order_id: newOrder.id,
    status: 'ORDER_CREATED',
    message: 'Order created waiting for verification',
    data: '',
  });
  return success(
    {
      status: 'ok',
      message: 'Order created waiting for verification',
      orderId: newOrder.id,
    }
    // event.requestContext
  );
};
