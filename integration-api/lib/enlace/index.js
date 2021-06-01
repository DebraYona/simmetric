/* eslint-disable no-console */
const axios = require('axios');
const location = require('../../data/location');
const buyer = require('../../data/buyer');
const status = require('../../data/status');
const dropoff = require('../../data/dropoff');
const order = require('../../data/order');
const product = require('../../data/product');
const receiver = require('../../data/receiver');
const pickup = require('../../data/pickup');
const contract = require('../../data/contract');
const statuschange = require('../../data/statuschange');
const { processError, ResponseError } = require('../error_handlers');
const { getProductStatus, getProductConfirmationStatus } = require('../product_status');
const { getOrderStatus, getOrderConfirmationStatus } = require('../order_status');

const enlaceConstantsGenerator = async (isLastMile, locationQuery) => {
  const constants = {};
  const contractQuery = await contract.getById(
    parseInt(isLastMile, 10) === 1
      ? locationQuery.contract_id
      : locationQuery.contract_id_consolidated
  );
  console.log(contractQuery);
  constants.contract_id =
    parseInt(isLastMile, 10) === 1
      ? locationQuery.contract_id
      : locationQuery.contract_id_consolidated;
  constants.service_type = contractQuery.service;
  constants.payment_method = contractQuery.payment;
  constants.email = contractQuery.email;
  constants.rut = contractQuery.rut;
  constants.phone_number = contractQuery.phone_number;

  return constants;
};

const returnTransvipCD = () => {
  return {
    address: 'Alcalde Fernando Castillo Velasco 8595',
    name: 'CD Transvip',
    comuna: 'La Reina',
    latitude: '-33.451313',
    longitude: '-70.541900',
    pickup_time: '13:00:00',
  };
};

const enlaceHeaders = {
  'Content-Type': 'application/json',
  'content-language': 'es',
};

const getRoute = async (
  serviceOrderId,
  locationId,
  isLastMile,
  dropLat,
  dropLong,
  pickupDate,
  dropDate
) => {
  const locationQuery = await location.getById(locationId);
  const constantsContract = await enlaceConstantsGenerator(isLastMile, locationQuery);
  console.log(constantsContract);

  if (!isLastMile) {
    // change to CD if it is not a last mile delivery
    const transvipCD = returnTransvipCD();
    locationQuery.address = transvipCD.address;
    locationQuery.name = transvipCD.name;
    locationQuery.comuna = transvipCD.comuna;
    locationQuery.latitude = transvipCD.latitude;
    locationQuery.longitude = transvipCD.longitude;
    locationQuery.pickup_time = transvipCD.pickup_time;
  }

  // 3. Get Route estimate on search_fixed_variable_price - SAME AS CREATION
  // 3.1 Create payload
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
    processError(2000, errorBody, serviceOrderId);
    throw catchError;
  }
  console.log(routeResponse);
  const routeBody = routeResponse.data;
  // HOTFIX
  const start = pickupDate;
  const end = dropDate;
  const way0 = `${locationQuery.latitude},${locationQuery.longitude}`;
  const way1 = `${dropLat},${dropLong}`;
  // 4 Get Toll cost and estimated route info
  // 4.1 Create payload
  const tollPayload = {
    waypoint0: way0, // HOTFIX `${locationQuery['latitude']}, ${locationQuery['longitude']}`, '-33.440449,-70.645889'
    waypoint1: way1, // HOTFIX`${dropLat}, ${dropLong}`, '-33.413872,-70.568962';
    departure_date: end, // TO_DO: confirm this date
  };
  console.log(tollPayload);
  // 4.2 create request variables
  const tollUrl = `${process.env.ENLACE_URL}/toll-cost-estimated-route`;
  let tollResponse;
  try {
    tollResponse = await axios({
      method: 'post',
      url: tollUrl,
      headers: enlaceHeaders,
      data: tollPayload,
      timeout: parseInt(process.env.ENLACE_TIMEOUT, 10),
    });
    if (tollResponse.data.status.toString() !== `200`) {
      throw new ResponseError(tollResponse.data.status, tollResponse.data.message);
    }
  } catch (catchError) {
    let errorBody;
    if (catchError.code === 'ECONNABORTED') {
      errorBody = { error: catchError.message, response: catchError.code };
    } else {
      errorBody = { error: catchError.message, response: catchError.response.data };
    }
    processError(2200, errorBody, serviceOrderId);
    throw catchError;
  }
  const response = {
    id: routeBody.data.id,
    location: locationQuery,
    travel_distance_route: tollResponse.data.data.distanceInMeters, // Here Maps, UNKNOWN
    booking_eta: tollResponse.data.data.etaInSeconds, // Here Maps, UNKNOWN
    start_time: start,
    end_time: end,
    tolerance_time: routeBody.data.tolerance_time_withdrawal_pickup,
    apply_charge_by_toll: routeBody.data.apply_charge_by_toll,
    apply_estimated_distance_variable_fare: routeBody.data.apply_estimated_distance_variable_fare,
    is_item_of_charges: routeBody.data.price_list[0].itemOfCharge.length > 0 ? 1 : 0,
    item_of_charges: routeBody.data.price_list[0].itemOfCharge,
  };

  return response;
};

const getBooking = async (data) => {
  console.log(data);
  // 5.2 create request variables
  const bookingUrl = `${process.env.CLICKLABS_URL}/modify_booking_delivery`;

  try {
    const bookingResponse = await axios({
      method: 'post',
      url: bookingUrl,
      headers: enlaceHeaders,
      data,
      timeout: parseInt(process.env.ENLACE_TIMEOUT, 10),
    });
    console.log(bookingResponse);
    return bookingResponse.data.data.job_id;
  } catch (catchError) {
    console.log(catchError);
    throw catchError;
  }
};

const randomStartSeconds = () => {
  const seconds = `${Math.floor(Math.random() * 60)}`.padStart(2, '0');
  const milliseconds = `${Math.floor(Math.random() * 1000)}`.padStart(3, '0');
  return `${seconds}.${milliseconds}`;
};
const randomStartMinutes = () => {
  const minutes = `${Math.floor(Math.random() * 60)}`.padStart(2, '0');
  const seconds = `${Math.floor(Math.random() * 60)}`.padStart(2, '0');
  const milliseconds = `${Math.floor(Math.random() * 1000)}`.padStart(3, '0');
  return `${minutes}:${seconds}.${milliseconds}`;
};
const cleanAddress = (address) => {
  const _cleanAddress = address.trim();
  const parts = _cleanAddress.split(',');
  if (parts.length >= 3) {
    let newAddress = parts[0].trim();
    let i;
    for (i = 1; i < parts.length - 1; i += 1) {
      newAddress = `${newAddress}, ${parts[i].trim()}`;
    }
    const newAddressLine2 = parts[parts.length - 1].trim();
    return {
      address: newAddress,
      address_line_2: newAddressLine2,
    };
  }
  let newAddress = parts[0].trim();
  let i;
  for (i = 1; i < parts.length; i += 1) {
    newAddress = `${newAddress}, ${parts[i].trim()}`;
  }
  return {
    address: newAddress,
    address_line_2: '',
  };
};
const itemOfChargeTranslator = (input) => {
  const output = [];
  input.forEach((element) => {
    output.push({
      fixed_pricing_id: element.variable_pricing_id,
      id: element.item_of_charge_id,
      item_of_charge_id: element.id,
      description: element.tic_description,
      long_name: element.tic_long_name,
      manually: element.tic_manually,
      price: element.price,
      short_name: element.tic_short_name,
      quantity: 1,
    });
  });
  return output;
};

const manageAnExistingCud = (cudCode) =>
  new Promise((resolve) => {
    product.getByCudId(cudCode).then((cudQuery) => {
      console.log(cudCode);
      console.log(cudQuery);
      if (Object.keys(cudQuery).length > 0) {
        console.log('existing cud found, deleting from database');
        product.removeByCudId(cudCode).then(() => {
          console.log('deleted entry');
          // Manage a possible empty order
          resolve();
        });
      }
      resolve();
    });
  });
const dateConsolidationManager = (pickupParam, dropoffParam, isLastMile) => {
  let pickupTime;
  let pickupTimeRetail;
  let dropoffTime;
  if (isLastMile) {
    dropoffTime = dropoffParam;
    pickupTime = pickupParam;
    pickupTimeRetail = pickupParam;
  } else {
    dropoffTime = dropoffParam;
    pickupTime = `${dropoffParam.substr(0, dropoffParam.indexOf('T'))}T21:${randomStartMinutes()}Z`; // change hours
    pickupTimeRetail = pickupParam;
  }
  return { pickupTime, pickupTimeRetail, dropoffTime };
};

const updateProductStatus = async (params) => {
  const productQuery = await product.getByCudId(params.cudCode);
  if (Object.keys(productQuery).length === 0) {
    return productQuery;
  }
  const updateObject = {};
  const logObject = {
    identifier: params.cudCode,
    previous_status: productQuery.status,
    previous_confirmed_status: productQuery.confirmed_status,
    info: params.info || '',
    new_status: productQuery.status,
    new_confirmed_status: productQuery.confirmed_status,
  };
  // 1 update status on product
  if (params.newStatus && productQuery.status !== params.newStatus) {
    updateObject.status = getProductStatus(params.newStatus).code;
    logObject.new_status = getProductStatus(params.newStatus).code;
  }
  if (params.newConfirmedStatus && productQuery.confirmed_status !== params.newConfirmedStatus) {
    updateObject.confirmed_status = getProductConfirmationStatus(params.newConfirmedStatus).code;
    logObject.new_confirmed_status = getProductConfirmationStatus(params.newConfirmedStatus).code;
  }
  if (params.jobID) {
    updateObject.job_id = params.jobID;
  }
  const updateResult = !params.updateUploadFailed
    ? await product.updateByCudIdWithoutUpload(params.cudCode, updateObject)
    : await product.updateByCudId(params.cudCode, { status: updateObject.status });

  // 2 create a statuschange entry
  await statuschange.create(logObject);
  return updateResult;
};

const createProductWithoutPreOrder = async (cudId, statusParam, locationID) => {
  // 0. generate extra values
  const locationQuery = await location.getById(locationID);
  const constantsContract = await enlaceConstantsGenerator(0, locationQuery);
  // 1. Create a dummy order for this product
  const newOrder = await order.create({
    service_order_id: `NOPREORDER-${cudId}`,
    location_id: locationID,
    contract_id: constantsContract.contract_id, // TO_DO: deal with this value, is critical
    last_mile: 0,
    status: getOrderStatus(1).code,
    confirmed_status: getOrderConfirmationStatus(3).code,
  });
  try {
    // 2. create related entries
    await product.create({
      order_id: newOrder.id,
      identifier: cudId,
      status: getProductStatus(statusParam).code,
      confirmed_status: getProductConfirmationStatus(3).code,
      description: '',
    });
    await buyer.create(
      {
        buyer_name: 'NOPREORDER',
      },
      newOrder.id
    );
    await receiver.create({ receiver_name: 'NOPREORDER' }, newOrder.id);
    await dropoff.create(
      {
        drop_address: 'NOPREORDER',
        drop_latitude: 0, // this should not resolve in enlace
        drop_longitude: 0,
        time: new Date().toISOString(), // TO_DO: deal with this value, it is critical
      },
      newOrder.id
    );
    const cdaddress = returnTransvipCD();
    await pickup.create(
      {
        address: cdaddress.address,
        address_2: '',
        comuna: cdaddress.comuna,
        latitude: cdaddress.latitude,
        longitude: cdaddress.longitude,
        time: new Date().toISOString(),
        time_retail: new Date().toISOString(),
      },
      newOrder.id
    );
    await updateProductStatus({
      cudCode: cudId,
      info: 'productWithoutPreorder',
    });
    await status.create({
      service_order_id: cudId,
      job_id: '',
      order_id: newOrder.id,
      status: 'PRODUCT_PRECREATED',
      message: 'product precreated without preorder, not verified in enlace',
      data: '',
    });

    return true;
  } catch (error) {
    console.log(error);
    if (newOrder.id) {
      order.removeAll(newOrder.id);
    }
    await status.create({
      service_order_id: cudId,
      status: 'PRODUCT_NOT_PRECREATED',
      message: 'There was a problem precreating the product without order.',
      data: '',
    });
    return false;
  }
};

module.exports = {
  getBooking,
  getRoute,
  randomStartSeconds,
  randomStartMinutes,
  cleanAddress,
  itemOfChargeTranslator,
  returnTransvipCD,
  manageAnExistingCud,
  dateConsolidationManager,
  enlaceConstantsGenerator,
  updateProductStatus,
  createProductWithoutPreOrder,
};
