/* eslint-disable no-console */
const axios = require('axios');
const async = require('async');
const { getGeocodingFromEndpoint, getGeocodingFromGoogleMaps } = require('../../lib/heremaps.js');
const location = require('../../data/location');
const buyer = require('../../data/buyer');
const dropoff = require('../../data/dropoff');
const order = require('../../data/order');
const product = require('../../data/product');
const receiver = require('../../data/receiver');
const pickup = require('../../data/pickup');
const status = require('../../data/status');
const { success, failure } = require('../../lib/http-responses');
const { processError, ResponseError } = require('../../lib/error_handlers');
const { getProductStatus } = require('../../lib/product_status');
const { getOrderStatus } = require('../../lib/order_status');
const {
  randomStartMinutes,
  cleanAddress,
  itemOfChargeTranslator,
  returnTransvipCD,
  dateConsolidationManager,
  enlaceConstantsGenerator,
} = require('../../lib/enlace');

module.exports.handler = async (event) => {
  console.log('Starting SQS Order Process...');
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
      product_description: entry.product_description,
      product_price: entry.product_price,
      product_quantity: entry.product_quantity,
      last_mile: body.last_mile,
    });
  });
  const cudsEnlace = [];
  body.cuds.forEach((entry) => {
    cudsEnlace.push({
      guide_number: entry.guide_number || '',
      cud_id: entry.cud,
      cud_status: getProductStatus('100').enlace,
      product_description: entry.product_description,
      product_price: entry.product_price,
      product_quantity: entry.product_quantity,
    });
  });
  console.log(body);
  console.log(cuds);
  console.log(cudsEnlace);
  // 0.2 Generate body dropoff optional parameters
  body.dropoff.drop_address_line_2 = body.dropoff.drop_address_line_2 || '';
  body.dropoff.drop_observations = body.dropoff.drop_observations || '';

  // 1. Get sucursales
  const locationQuery = await location.getById(body.location_id);
  console.log(locationQuery);
  // TO_DO: database error connections or id not found

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

  // 2. Get Geocoding of delivery address
  const deliveryAddress = `${body.dropoff.drop_address}, ${body.dropoff.drop_comuna}, Chile`;
  console.log(deliveryAddress);
  let coordinates = {};
  try {
    coordinates = await getGeocodingFromEndpoint(deliveryAddress);
  } catch (catchError) {
    // generate original error, don't finish
    const originalError = processError(
      1300,
      { error: catchError.message, response: 'original attempt' },
      body.service_order_id
    );
    // retry with new address
    let retryCoordinates;
    const newAddress = cleanAddress(body.dropoff.drop_address);
    const retryAddress = `${newAddress.address}, ${body.dropoff.drop_comuna}, Chile`;
    console.log(newAddress);
    console.log(retryAddress);
    try {
      retryCoordinates = await getGeocodingFromEndpoint(retryAddress);
    } catch (retryCatchError) {
      // if retry failed, generate retry error and return with the original one
      processError(
        1300,
        { error: retryCatchError.message, response: 'cleaned attempt' },
        body.service_order_id
      );
      // return originalError;
      // retry with googlemaps
      try {
        retryCoordinates = await getGeocodingFromGoogleMaps(retryAddress);
      } catch (gmapsCatchError) {
        // if second retry failed, generate retry error and return
        processError(
          1300,
          { error: gmapsCatchError.message, response: 'gmaps attempt' },
          body.service_order_id
        );
        return originalError;
      }
    }
    // if retry worked, change address data and continue
    body.dropoff.drop_address = newAddress.address;
    body.dropoff.drop_address_line_2 += newAddress.address_line_2;
    coordinates = retryCoordinates;
  }
  console.log(coordinates);
  const dropLat = coordinates[0];
  const dropLong = coordinates[1];

  // 3. Get Route estimate on search_fixed_variable_price
  // 3.1 Create payload
  const constantsContract = await enlaceConstantsGenerator(body.last_mile, locationQuery);
  console.log(constantsContract);
  const routePayload = {
    access_token: process.env.ENLACE_TOKEN,
    contract_id:
      process.env.STAGE === 'dev' || process.env.STAGE === 'qa'
        ? '68'
        : constantsContract.contract_id,
    pickup_lat: locationQuery.latitude,
    pickup_long: locationQuery.longitude,
    drop_lat: dropLat.toString(),
    drop_long: dropLong.toString(),
    service_type: constantsContract.service_type,
  };
  console.log(routePayload);
  // 3.2 create request variables
  const routeUrl = `${process.env.ENLACE_URL}/search_fixed_variable`;
  const enlaceHeaders = {
    'Content-Type': 'application/json',
    'content-language': 'es',
  };
  let routeResponse;
  try {
    routeResponse = await axios({
      method: 'post',
      url: routeUrl,
      headers: enlaceHeaders,
      data: routePayload,
      timeout: parseInt(process.env.ENLACE_TIMEOUT, 10),
    });
    if (routeResponse.data.status.toString() !== '200') {
      throw new ResponseError(routeResponse.data.status, routeResponse.data.message);
    }
  } catch (catchError) {
    let errorBody;
    if (catchError.code === 'ECONNABORTED') {
      errorBody = { error: catchError.message, response: catchError.code };
    } else {
      errorBody = { error: catchError.message, response: catchError.response.data };
    }
    return processError(2000, errorBody, body.service_order_id);
  }
  console.log(routeResponse);
  const routeBody = routeResponse.data;
  const start = `${body.pickup_date}T${locationQuery.pickup_time.substring(
    0,
    locationQuery.pickup_time.length - 6
  )}:${randomStartMinutes()}Z`;
  const end = `${body.dropoff.drop_date}T23:00:00.000Z`;
  const way0 = `${locationQuery.latitude},${locationQuery.longitude}`;
  const way1 = `${dropLat},${dropLong}`;
  // 3.3 modify item of charge
  let itemOfChargeModified;
  try {
    itemOfChargeModified = itemOfChargeTranslator(routeBody.data.price_list[0].itemOfCharge);
  } catch (catchError) {
    return processError(2001, { error: catchError.message, response: '' }, body.service_order_id);
  }
  console.log(itemOfChargeModified);
  // 4 Get Toll cost and estimated route info
  // 4.1 Create payload
  const tollPayload = {
    waypoint0: way0, // HOTFIX `${locationQuery['latitude']}, ${locationQuery['longitude']}`, '-33.440449,-70.645889'
    waypoint1: way1, // HOTFIX`${dropLat}, ${dropLong}`, '-33.413872,-70.568962';
    departure_date: start, // TO_DO: confirm this date
  };
  console.log(tollPayload);
  // 4.2 create request variables
  const tollUrl = `${process.env.ENLACE_URL}/toll-cost-estimated-route`;
  let tollResponse;
  try {
    tollResponse = await async.retry(
      parseInt(process.env.ENLACE_TOLLCOST_RETRIES, 10),
      async () => {
        console.log('trying tollcost');
        tollResponse = await axios({
          method: 'post',
          url: tollUrl,
          headers: enlaceHeaders,
          data: tollPayload,
          timeout: parseInt(process.env.ENLACE_TIMEOUT, 10),
        }).catch((error) => {
          console.log(error);
          throw error;
        });
        if (tollResponse.data.status.toString() !== `200`) {
          throw new ResponseError(tollResponse.data.status, tollResponse.data.message);
        }
        return tollResponse;
      }
    );
  } catch (catchError) {
    let errorBody;
    if (catchError.code === 'ECONNABORTED') {
      errorBody = { error: catchError.message, response: catchError.code };
    } else {
      errorBody = { error: catchError.message, response: catchError.response.data };
    }
    return processError(2200, errorBody, body.service_order_id);
  }
  console.log(tollResponse);
  // 5.0 Correct data from designed flow
  const correctedDates = dateConsolidationManager(start, end, body.last_mile);
  console.log(correctedDates);
  // 5. Create the booking on Enlace backend
  let bookingPayload = {};
  console.log(routeResponse);
  try {
    bookingPayload = {
      timezone: 180, // Should be dynamic
      contract_id:
        process.env.STAGE === 'dev' || process.env.STAGE === 'qa'
          ? '68'
          : constantsContract.contract_id,
      booking_type: 0, // HOTFIXED TO WORK Shared booking
      service_order: [{ service_order_id: body.service_order_id, cud: cudsEnlace }],
      quantity_boxes: body.quantity_boxes,
      booking_for: 1, // siempre para terceros
      customer_phone_number: body.receiver.receiver_phone_number || '', // HOTFIX
      customer_email: body.buyer.buyer_email,
      sender_rut: body.buyer.buyer_rut || '',
      passenger_rut: body.receiver.receiver_rut,
      full_name: body.receiver.receiver_name,
      phone_number: body.receiver.receiver_phone_number || '',
      email: body.receiver.receiver_email || '',
      route_id: routeBody.data.id,
      pickup_lat: locationQuery.latitude,
      pickup_long: locationQuery.longitude,
      location_id: body.location_id,
      location_name: locationQuery.name,
      pickup_location: `${locationQuery.address}, ${locationQuery.comuna}`,
      drop_lat: dropLat.toString(),
      drop_long: dropLong.toString(),
      drop_location:
        body.dropoff.drop_address_line_2.length > 0
          ? `${body.dropoff.drop_address} - ${body.dropoff.drop_address_line_2} - ${body.dropoff.drop_comuna}`
          : `${body.dropoff.drop_address} - ${body.dropoff.drop_comuna}`,
      location_time_pickup: correctedDates.pickupTime,
      travel_distance_route: tollResponse.data.data.distanceInMeters,
      booking_eta: tollResponse.data.data.etaInSeconds,
      drop_off_time: correctedDates.dropoffTime, // HOTFIX body['dropoff']['drop_time'], // fecha de entrega en dia
      observations: body.dropoff.drop_observations,
      service_type: constantsContract.service_type,
      type_of_charge: body.type_of_charge || '',
      created_by_admin: 8, // From API
      payment_status: 1, // Bookings are always paid
      payment_method: constantsContract.payment_method,
      estimated_payment_cost: 0, // 0 for this contract
      is_routing: 0, // No routing
      time: [correctedDates.pickupTime], // HOTFIX [locationQuery['pickuptime']],
      transport_type_id: 0, // From service types table
      schedule_ride: 1, // scheduled
      round_trip: 0, // not a round trip
      route_type: 0, // variable route
      type_of_agreement: 1, // enterprise
      is_wait_time_included: 0, // no waiting time
      travel_time: '', // UNKNOWN, static podria ser eta en minutos redondeado
      tolerance_time: routeBody.data.tolerance_time_withdrawal_pickup,
      estimated_toll_price: 0, // en encomienda no se cobran tags
      apply_charge_by_toll: routeBody.data.apply_charge_by_toll,
      apply_estimated_distance_variable_fare: routeBody.data.apply_estimated_distance_variable_fare,
      return_date_time: '', // UNKNOWN no deberia ir
      promo_type: 0,
      discount_type: 0,
      discount_amount: 0,
      is_item_of_charges: itemOfChargeModified.length > 0 ? 1 : 0,
      item_of_charges: itemOfChargeModified,
      reaccurringTimeZone: [], // UNKNOWN, 180 240 ?
      profile: 1, // corporate is 1
      number_of_passangers: 1, // was mispelled in example postman
      job_pickup_comuna: locationQuery.comuna,
      job_dropoff_comuna: body.dropoff.drop_comuna,
      return_booking_eta: 0, // validar pero es 0
      heremaps_toll_details: {}, // UNKNOWN // TO_DO toll-cost-estimated-route
      heremaps_estimated_tolls: 0, // Debe ser 0, validar
      item_of_charge_tolls_price: 0, // Debe ser 0, validar
      reaccurring: 0, // UNKNOWN
      auth_required: 0, // UNKNOWN
      airport: 0,
      route_id_return: 4644, // UNKNOWN
      route_type_return: 1, // UNKNOWN
      estimated_payment_cost_return: 0, // UNKNOWN
      is_POS_booking: 0,
      is_adjusting_discounted_amount: 0,
    };
  } catch (catchError) {
    return processError(2001, catchError, body.service_order_id);
  }
  console.log(bookingPayload);
  // 5.2 create request variables
  const bookingUrl = `${process.env.CLICKLABS_URL}/create_booking_delivery`;
  let bookingResponse;
  try {
    bookingResponse = await axios({
      method: 'post',
      url: bookingUrl,
      headers: enlaceHeaders,
      data: bookingPayload,
      timeout: parseInt(process.env.ENLACE_TIMEOUT, 10),
    });
  } catch (catchError) {
    let errorBody;
    if (catchError.code === 'ECONNABORTED') {
      errorBody = { error: catchError.message, response: catchError.code };
    } else {
      errorBody = { error: catchError.message, response: catchError.response.data };
    }
    return processError(2100, errorBody, body.service_order_id);
  }
  console.log(bookingResponse);
  console.log(bookingResponse.data.data);
  // 6. upload to database
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
  console.log(startTimeRetailString);
  let newOrder = {};
  try {
    const orderData = {
      service_order_id: body.service_order_id,
      contract_id: constantsContract.contract_id || '',
      last_mile: body.last_mile,
      type_of_charge: body.type_of_charge || '',
      status: body.status || getOrderStatus(100).code,
      job_id: bookingResponse.data.data.job_result.job_id || '',
      route_id: routeResponse.data.data.id,
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
    const dropoffExtraData = {
      drop_latitude: dropLat,
      drop_longitude: dropLong,
      time: endTimeString,
    };
    await dropoff.create({ ...body.dropoff, ...dropoffExtraData }, newOrder.id);

    // 6.9 We create the pickup record with updated info
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
    job_id: bookingResponse.data.data.job_result.job_id,
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
