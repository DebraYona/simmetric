/* eslint-disable no-console */
const axios = require('axios');
const { success, notFound, failure } = require('../../lib/http-responses');
const { processError } = require('../../lib/error_handlers');
const product = require('../../data/product');
const order = require('../../data/order');
const { getProductStatus, getProductStatusFromEnlace } = require('../../lib/product_status');

module.exports.handler = async (event) => {
  const { cud } = event.pathParameters;
  // 1. get cud in database
  let data;
  try {
    data = await product.getByCudId(cud);
    console.log(data);
    if (Object.keys(data).length === 0) {
      return notFound(
        { status: 'fail', message: "We couldn't find the defined cud" },
        event.requestContext
      );
    }
  } catch (error) {
    console.log(error);
    return failure({ status: 'fail', message: "We couldn't get the status" }, event.requestContext);
  }
  // 2. get service_order_id in database
  let orderdata;
  try {
    orderdata = await order.getById(data.order_id);
    console.log(orderdata);
    if (Object.keys(orderdata).length === 0) {
      return notFound(
        { status: 'fail', message: "We couldn't find the service order for the indicated cud" },
        event.requestContext
      );
    }
  } catch (error) {
    console.log(error);
    return failure({ status: 'fail', message: "We couldn't get the status" }, event.requestContext);
  }
  // 3. get service order status
  let getStatusResponse;
  const enlaceHeaders = {
    'Content-Type': 'application/json',
    'content-language': 'es',
  };
  const statusURL = `${process.env.ENLACE_URL}/get_status_booking_delivery`;
  const statusPayload = {
    service_order_id: orderdata.service_order_id,
  };
  console.log(statusPayload);
  try {
    getStatusResponse = await axios({
      method: 'post',
      url: statusURL,
      headers: enlaceHeaders,
      data: statusPayload,
      timeout: parseInt(process.env.ENLACE_TIMEOUT, 10),
    });
  } catch (catchError) {
    processError(
      2300,
      { error: catchError.message, response: catchError.response.data },
      orderdata.service_order_id
    );
    return notFound(
      { status: 'fail', message: 'Enlace could not find this order' },
      event.requestContext
    );
  }
  console.log(getStatusResponse);
  // 4. look for cud inside and return the current status
  let cudStatus = null;
  try {
    getStatusResponse.data.data.job_cuds_result.forEach((element) => {
      if (element.cud_id === cud) {
        cudStatus = element.cud_status;
      }
    });
    if (cudStatus === null) {
      return notFound(
        { status: 'fail', message: "We couldn't find the cud within the registered order" },
        event.requestContext
      );
    }
  } catch (error) {
    console.log(error);
    return failure({ status: 'fail', message: "We couldn't get the status" }, event.requestContext);
  }
  // 5. state machine
  let stateToReturn;
  let descriptionToReturn;
  const internalState = getProductStatus(data.status).code;
  const internalDescription = getProductStatus(data.status).description;
  cudStatus = parseInt(cudStatus, 10);
  const cudDescription = getProductStatusFromEnlace(cudStatus).description;
  console.log(internalState);
  console.log(cudStatus);
  // 5.1 if internal state is 2XX return this state
  if (internalState >= 200 && internalState < 300) {
    stateToReturn = internalState;
    descriptionToReturn = internalDescription;

    // 5.2 if internal is 301, check if external is 6, return 301 or not 6
  } else if (internalState === 301) {
    if (cudStatus === 6) {
      stateToReturn = internalState;
      descriptionToReturn = internalDescription;
    } else {
      stateToReturn = cudStatus;
      descriptionToReturn = cudDescription;
    }
    // 5.3 return enlace status by default
  } else {
    stateToReturn = cudStatus;
    descriptionToReturn = cudDescription;
  }
  console.log(stateToReturn);
  return success(
    {
      status: 'ok',
      product_status: stateToReturn,
      product_status_description: descriptionToReturn,
    },
    event.requestContext
  );
};
