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
const { getProductStatus, getProductConfirmationStatus } = require('../../lib/product_status');
const {
  randomStartMinutes,
  cleanAddress,
  updateProductStatus,
  enlaceConstantsGenerator,
} = require('../../lib/enlace');
// TODO update status on payload
// TODO change service_order_id to targetCud in notifications

module.exports.handler = async (event) => {
  console.log('Starting SQS Order Process...');
  console.log(event);
  // 0. Load event info
  const body = JSON.parse(event.Records[0].body);
  const targetCud = body.cud;
  let newStatus;
  if (body.newStatus) {
    newStatus = getProductStatus(body.newStatus).code;
    console.log(`new status is ${newStatus}`);
  }
  // 1 Rebuild whole order
  // 1.1 database queries
  let productQuery;
  let orderQuery;
  let dropoffQuery;
  let receiverQuery;
  let buyerQuery;
  let pickupQuery;
  let locationQuery;
  try {
    productQuery = await product.getByCudId(targetCud);
    // 1.1.1 reject postcreation if it doesn't exist
    if (Object.keys(productQuery).length === 0) {
      console.log('This product does not exist, postcreation will not be processed');
      await status.create({
        service_order_id: targetCud,
        status: 'ORDER_NOT_POSTCREATED',
        message: 'This product does not exist, postcreation will not be processed',
        data: '',
      });
      return success(
        {
          status: 'ok',
          message: 'product not postcreated, operation succesful',
          orderId: targetCud,
        }
        // event.requestContext
      );
    }
    // 1.1.2 reject postcreation if it is already confirmed
    if (
      getProductConfirmationStatus(productQuery.confirmed_status).code ===
      getProductConfirmationStatus(1).code
    ) {
      console.log('This product is already confirmed, postcreation will not be processed');
      await status.create({
        service_order_id: targetCud,
        status: 'ORDER_NOT_POSTCREATED',
        message: 'This product is already confirmed, postcreation will not be processed',
        data: '',
      });
      return success(
        {
          status: 'ok',
          message: 'product not postcreated, operation succesful',
          orderId: targetCud,
        }
        // event.requestContext
      );
    }
    orderQuery = await order.getById(productQuery.order_id);
    dropoffQuery = await dropoff.getByOrderId(orderQuery.id);
    receiverQuery = await receiver.getByOrderId(orderQuery.id);
    buyerQuery = await buyer.getByOrderId(orderQuery.id);
    pickupQuery = await pickup.getByOrderId(orderQuery.id);
    locationQuery = await location.getById(orderQuery.location_id);
    // 1.1.3 reject postcreation if it has no order and address hasn't been updated correctly
    if (
      !dropoffQuery.address ||
      dropoffQuery.address === 'NOPREORDER' ||
      dropoffQuery.address.length === 0
    ) {
      console.log(
        'This product was created without order and has not been updated, postcreation will not be processed'
      );
      await status.create({
        service_order_id: targetCud,
        status: 'ORDER_NOT_POSTCREATED',
        message: 'his product was created without order and has not been updated',
        data: '',
      });
      return success(
        {
          status: 'ok',
          message: 'product not postcreated, operation succesful',
          orderId: targetCud,
        }
        // event.requestContext
      );
    }

    console.log(productQuery);
    console.log(orderQuery);
    console.log(dropoffQuery);
    console.log(receiverQuery);
    console.log(buyerQuery);
    console.log(pickupQuery);
    console.log(locationQuery);
  } catch (catchError) {
    await updateProductStatus({
      cudCode: targetCud,
      newConfirmedStatus: getProductConfirmationStatus(2).code,
      info: 'orderPostCreationProcess',
      updateUploadFailed: false,
    });
    return processError(3000, catchError.message, targetCud);
  }
  // 2 Make validation requests
  // 2.1 Get Geocoding of delivery address
  let changedDropoff = false;
  const deliveryAddress = `${dropoffQuery.address}, ${dropoffQuery.comuna}, Chile`;
  console.log(deliveryAddress);
  let coordinates = {};
  try {
    coordinates = await getGeocodingFromEndpoint(deliveryAddress);
  } catch (catchError) {
    // generate original error, don't finish
    const originalError = processError(
      1300,
      { error: catchError.message, response: 'original attempt' },
      targetCud
    );
    // retry with new address
    let retryCoordinates;
    const newAddress = cleanAddress(dropoffQuery.address);
    const retryAddress = `${newAddress.address}, ${dropoffQuery.comuna}, Chile`;
    console.log(newAddress);
    console.log(retryAddress);
    try {
      retryCoordinates = await getGeocodingFromEndpoint(retryAddress);
    } catch (retryCatchError) {
      // if retry failed, generate retry error and return with the original one
      processError(
        1300,
        { error: retryCatchError.message, response: 'cleaned attempt' },
        targetCud
      );
      // return originalError;
      // retry with googlemaps
      try {
        retryCoordinates = await getGeocodingFromGoogleMaps(retryAddress);
      } catch (gmapsCatchError) {
        // if second retry failed, generate retry error and return
        await updateProductStatus({
          cudCode: targetCud,
          newConfirmedStatus: getProductConfirmationStatus(2).code,
          info: 'orderPostCreationProcess',
          updateUploadFailed: false,
        });
        processError(
          1300,
          { error: gmapsCatchError.message, response: 'gmaps attempt' },
          targetCud
        );
        return originalError;
      }
    }
    // if retry worked, change address data and continue
    dropoffQuery.address = newAddress.address;
    dropoffQuery.address_line_2 += newAddress.address_line_2;
    changedDropoff = true;
    coordinates = retryCoordinates;
  }
  console.log(coordinates);
  const dropLat = coordinates[0];
  const dropLong = coordinates[1];
  // 2.2 Get Route estimate on search_fixed_variable_price
  // 2.2.1 Create payload
  const constantsContract = await enlaceConstantsGenerator(orderQuery.last_mile, locationQuery);
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
  // 2.2.2 create request variables and send
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
    await updateProductStatus({
      cudCode: targetCud,
      newConfirmedStatus: getProductConfirmationStatus(2).code,
      info: 'orderPostCreationProcess',
      updateUploadFailed: false,
    });
    return processError(2000, errorBody, targetCud);
  }
  console.log(routeResponse);
  // 2.2.3 create new variables from response
  const routeBody = routeResponse.data;
  const start = `${pickupQuery.time.toISOString().substring(0, 14)}${randomStartMinutes()}Z`;
  const end = `${dropoffQuery.time.toISOString().substring(0, 14)}${randomStartMinutes()}Z`;
  const way0 = `${locationQuery.latitude},${locationQuery.longitude}`;
  const way1 = `${dropLat},${dropLong}`;
  // 2.2.4 modify item of charge
  // DEPRECATED, IT IS FIXED NOW TODO: confirm this
  const itemOfChargeModified = routeResponse.data.data;
  /* try {
    itemOfChargeModified = itemOfChargeTranslator(routeBody.data.price_list[0].itemOfCharge);
  } catch (catchError) {
    return processError(2001, { error: catchError.message, response: '' }, targetCud);
  } */
  console.log(itemOfChargeModified);
  // 2.3 Get Toll cost and estimated route info
  // 2.3.1 Create payload
  const tollPayload = {
    waypoint0: way0,
    waypoint1: way1,
    departure_date: start,
  };
  console.log(tollPayload);
  // 2.3.2 create request variables and send
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
          console.log(tollResponse);
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
    await updateProductStatus({
      cudCode: targetCud,
      newConfirmedStatus: getProductConfirmationStatus(2).code,
      info: 'orderPostCreationProcess',
      updateUploadFailed: false,
    });
    return processError(2200, errorBody, targetCud);
  }
  // 3 build required objects and send to enlace
  // 3.1 generate new variables and payload for the request
  // 3.1.1 generate cud list object
  const cudsEnlace = [
    {
      guide_number: productQuery.guide_number,
      cud_id: productQuery.identifier,
      cud_status: newStatus
        ? getProductStatus(newStatus).enlace
        : getProductStatus(productQuery.status).enlace,
      product_description: productQuery.description,
      product_price: productQuery.price,
      product_quantity: productQuery.quantity,
    },
  ];
  let bookingPayload = {};
  try {
    bookingPayload = {
      timezone: 180, // Should be dynamic
      contract_id:
        process.env.STAGE === 'dev' || process.env.STAGE === 'qa'
          ? '68'
          : constantsContract.contract_id,
      booking_type: 0, // HOTFIXED TO WORK Shared booking
      service_order: [{ service_order_id: orderQuery.service_order_id, cud: cudsEnlace }],
      quantity_boxes: orderQuery.quantity_boxes,
      booking_for: 1, // siempre para terceros
      customer_phone_number: receiverQuery.phone_number || '', // HOTFIX
      customer_email: buyerQuery.email,
      sender_rut: buyerQuery.rut || '',
      passenger_rut: receiverQuery.rut,
      full_name: receiverQuery.name,
      phone_number: receiverQuery.phone_number || '',
      email: receiverQuery.email || '',
      route_id: routeBody.data.id,
      pickup_lat: locationQuery.latitude,
      pickup_long: locationQuery.longitude,
      location_id: orderQuery.location_id,
      location_name: locationQuery.name,
      pickup_location: `${locationQuery.address}, ${locationQuery.comuna}`,
      drop_lat: dropLat.toString(),
      drop_long: dropLong.toString(),
      drop_location:
        dropoffQuery.address_line_2 && dropoffQuery.address_line_2.length > 0
          ? `${dropoffQuery.address} - ${dropoffQuery.address_line_2} - ${body.dropoff.comuna}`
          : `${dropoffQuery.address} - ${dropoffQuery.comuna}`,
      location_time_pickup: start,
      travel_distance_route: tollResponse.data.data.distanceInMeters,
      booking_eta: tollResponse.data.data.etaInSeconds,
      drop_off_time: end,
      observations: dropoffQuery.observations,
      service_type: constantsContract.service_type,
      type_of_charge: orderQuery.type_of_charge || '',
      created_by_admin: 8, // From API
      payment_status: 1, // Bookings are always paid
      payment_method: constantsContract.payment_method,
      estimated_payment_cost: 0, // 0 for this contract
      is_routing: 0, // No routing
      time: [start], // HOTFIX [locationQuery['pickuptime']],
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
      job_dropoff_comuna: dropoffQuery.comuna,
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
    console.log(catchError);
    return processError(2001, catchError, targetCud);
  }
  // 3.2 send final request
  console.log(bookingPayload);
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
    console.log(catchError);
    let errorBody;
    if (catchError.code === 'ECONNABORTED') {
      errorBody = { error: catchError.message, response: catchError.code };
    } else {
      errorBody = { error: catchError.message, response: catchError.response.data };
    }
    await updateProductStatus({
      cudCode: targetCud,
      newConfirmedStatus: getProductConfirmationStatus(2).code,
      info: 'orderPostCreationProcess',
      updateUploadFailed: false,
    });
    return processError(2100, errorBody, targetCud);
  }
  console.log(bookingResponse);
  console.log(bookingResponse.data.data);
  // 4 update in database
  try {
    // 4.1 update status in cud (status, jobid)
    const updateResult = await updateProductStatus({
      cudCode: targetCud,
      newStatus: newStatus || productQuery.status,
      newConfirmedStatus: getProductConfirmationStatus(1).code,
      jobID: bookingResponse.data.data.job_result.job_id,
      info: 'orderPostCreationProcess',
      updateUploadFailed: false,
    });
    console.log(updateResult);
    // 4.2 update dropoff
    if (changedDropoff) {
      await dropoff.update(dropoffQuery.id, dropoffQuery);
    }
    // 4.3 create status
    await status.create({
      service_order_id: targetCud,
      job_id: bookingResponse.data.data.job_result.job_id,
      order_id: orderQuery.id,
      status: 'ORDER_CREATED',
      message: 'Order postcreated successfully',
      data: '',
    });
    return success(
      {
        status: 'ok',
        message: 'Order postcreated succesfully',
        orderId: targetCud,
      }
      // event.requestContext
    );
  } catch (error) {
    await updateProductStatus({
      cudCode: targetCud,
      newConfirmedStatus: getProductConfirmationStatus(2).code,
      info: 'orderPostCreationProcess',
      updateUploadFailed: false,
    });
    await status.create({
      service_order_id: targetCud,
      status: 'ORDER_NOT_POSTCREATED',
      message: 'There was a problem postcreating the order. Please verify your parameters.',
      data: '',
    });

    return failure({
      success: false,
      message:
        error.message ||
        'There was a problem postcreating the order. Please verify your parameters.',
    });
  }
};
