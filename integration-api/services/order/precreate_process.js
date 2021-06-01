/* eslint-disable no-console */
const { getProductStatus, getProductConfirmationStatus } = require('../../lib/product_status');
const { getOrderStatus, getOrderConfirmationStatus } = require('../../lib/order_status');
const {
  randomStartMinutes,
  returnTransvipCD,
  enlaceConstantsGenerator,
  dateConsolidationManager,
  updateProductStatus,
} = require('../../lib/enlace');
const location = require('../../data/location');
const buyer = require('../../data/buyer');
const dropoff = require('../../data/dropoff');
const order = require('../../data/order');
const product = require('../../data/product');
const receiver = require('../../data/receiver');
const pickup = require('../../data/pickup');
const status = require('../../data/status');
const { success, failure } = require('../../lib/http-responses');

module.exports.handler = async (event) => {
  console.log(event);
  // 0. Load event info
  const body = JSON.parse(event.Records[0].body);
  // 0.1 generate cuds lists
  const cuds = [];
  body.cuds.forEach((entry) => {
    cuds.push({
      guide_number: entry.guide_number || '',
      cud_id: entry.cud,
      cud_status: getProductStatus('100').code,
      confirmed_status: getProductConfirmationStatus(0).code,
      product_description: entry.product_description,
      product_price: entry.product_price,
      product_quantity: entry.product_quantity,
      last_mile: body.last_mile,
    });
  });
  // 0.2 Generate body dropoff optional parameters
  body.dropoff.drop_address_line_2 = body.dropoff.drop_address_line_2 || '';
  body.dropoff.drop_observations = body.dropoff.drop_observations || '';
  // 1 Generate additional data
  // 1.1 get location data
  const locationQuery = await location.getById(body.location_id);

  if (!body.last_mile) {
    // change to CD if it is not a last mile delivery
    const transvipCD = returnTransvipCD();
    locationQuery.address = transvipCD.address;
    locationQuery.name = transvipCD.name;
    locationQuery.comuna = transvipCD.comuna;
    locationQuery.latitude = transvipCD.latitude;
    locationQuery.longitude = transvipCD.longitude;
    locationQuery.pickup_time = transvipCD.pickup_time;
    console.log(locationQuery);
  }
  // 1.2 get constants
  const constantsContract = await enlaceConstantsGenerator(body.last_mile, locationQuery);
  // 1.3 get dates
  const start = `${body.pickup_date}T${locationQuery.pickup_time.substring(
    0,
    locationQuery.pickup_time.length - 6
  )}:${randomStartMinutes()}Z`;
  const end = `${body.dropoff.drop_date}T23:00:00.000Z`;
  const correctedDates = dateConsolidationManager(start, end, body.last_mile);
  const startDate = new Date(correctedDates.pickupTime);
  const endDate = new Date(correctedDates.dropoffTime);
  const startRetailDate = new Date(correctedDates.pickupTimeRetail);
  const startTimeString = `${startDate.getUTCFullYear()}-${(startDate.getUTCMonth() + 1)
    .toString()
    .padStart(2, '0')}-${startDate
    .getUTCDate()
    .toString()
    .padStart(2, '0')} ${startDate
    .getUTCHours()
    .toString()
    .padStart(2, '0')}:${startDate
    .getUTCMinutes()
    .toString()
    .padStart(2, '0')}:${startDate.getUTCSeconds().toString().padStart(2, '0')}`;
  console.log(startTimeString);
  const endTimeString = `${endDate.getUTCFullYear()}-${(endDate.getUTCMonth() + 1)
    .toString()
    .padStart(2, '0')}-${endDate
    .getUTCDate()
    .toString()
    .padStart(2, '0')} ${endDate
    .getUTCHours()
    .toString()
    .padStart(2, '0')}:${endDate
    .getUTCMinutes()
    .toString()
    .padStart(2, '0')}:${endDate.getUTCSeconds().toString().padStart(2, '0')}`;
  console.log(endTimeString);
  const startTimeRetailString = `${startRetailDate.getUTCFullYear()}-${(
    startRetailDate.getUTCMonth() + 1
  )
    .toString()
    .padStart(2, '0')}-${startRetailDate
    .getUTCDate()
    .toString()
    .padStart(2, '0')} ${startRetailDate
    .getUTCHours()
    .toString()
    .padStart(2, '0')}:${startRetailDate
    .getUTCMinutes()
    .toString()
    .padStart(2, '0')}:${startRetailDate.getUTCSeconds().toString().padStart(2, '0')}`;
  // 3 log all data in database
  let newOrder = {};
  try {
    // 3.1 order first
    newOrder = await order.create({
      service_order_id: body.service_order_id,
      contract_id: constantsContract.contract_id || '',
      last_mile: body.last_mile,
      type_of_charge: body.type_of_charge || '',
      status: getOrderStatus(100).code,
      confirmed_status: getOrderConfirmationStatus(0).code,
      job_id: '',
      route_id: '',
      location_id: body.location_id,
      quantity_boxes: body.quantity_boxes,
    });
    // 3.2 products
    await product.createBatch(cuds, newOrder.id);
    // 3.3 buyer
    await buyer.create(body.buyer, newOrder.id);
    // 3.4 receiver
    await receiver.create(body.receiver, newOrder.id);
    // 3.5 dropoff
    const dropoffExtraData = {
      drop_latitude: null,
      drop_longitude: null,
      time: endTimeString,
    };
    await dropoff.create({ ...body.dropoff, ...dropoffExtraData }, newOrder.id);
    // 3.6 pickup
    const pickupData = {
      order_id: newOrder.id,
      pickup_address: locationQuery.address,
      pickup_address_line_2: locationQuery.address_2,
      pickup_comuna: locationQuery.comuna,
      pickup_observations: '',
      latitude: locationQuery.latitude,
      longitude: locationQuery.longitude,
      time: startTimeString,
      time_retail: startTimeRetailString,
    };
    await pickup.create(pickupData, newOrder.id);
    // 3.7 statuschange
    await Promise.all(
      cuds.map((entry) =>
        updateProductStatus({
          cudCode: entry.cud_id,
          info: 'orderPreCreationProcess',
          updateUploadFailed: false,
        })
      )
    );
  } catch (error) {
    console.log(error);
    if (newOrder.id) {
      order.removeAll(newOrder.id);
    }
    await status.create({
      service_order_id: body.service_order_id,
      status: 'ORDER_NOT_PRECREATED',
      message: 'There was a problem precreating the order. Please verify your parameters.',
      data: '',
    });
    return failure({
      success: false,
      message:
        error.message ||
        'There was a problem precreating the order. Please verify your parameters.',
    });
  }
  // 3.7 status
  await status.create({
    service_order_id: body.service_order_id,
    job_id: '',
    order_id: newOrder.id,
    status: 'ORDER_PRECREATED',
    message: 'Order precreated, not verified in enlace',
    data: '',
  });
  return success({
    status: 'ok',
    message: 'Order precreated, not verified in enlace',
    orderId: newOrder.id,
  });
};
