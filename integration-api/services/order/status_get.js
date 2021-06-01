/* eslint-disable no-console */
const axios = require('axios');
const { success, notFound, failure } = require('../../lib/http-responses');
const { processError } = require('../../lib/error_handlers');

module.exports.handler = async (event) => {
  const { serviceOrderId } = event.pathParameters;
  console.log(event);
  console.log(serviceOrderId);
  // 1. get cud in database
  // 3. get service order status
  let getStatusResponse;
  const enlaceHeaders = {
    'Content-Type': 'application/json',
    'content-language': 'es',
  };
  const statusURL = `${process.env.ENLACE_URL}/get_status_booking_delivery`;
  const statusPayload = {
    service_order_id: serviceOrderId,
  };
  console.log(statusPayload);
  try {
    getStatusResponse = await axios({
      method: 'post',
      url: statusURL,
      headers: enlaceHeaders,
      data: statusPayload,
      timeout: parseInt(process.env.ENLACE_TIMEOUT, 10) 
    });
  } catch (catchError) {
    console.log(catchError);
    processError(
      2300,
      { error: catchError.message, response: catchError.response.data },
      serviceOrderId
    );
    return notFound({ status: 'fail', message: "Enlace could not find this order" }, event.requestContext);
  }
  console.log(getStatusResponse);
  // 4. return status
  try {
    return success(
      {
        status: 'ok',
        order_status: getStatusResponse.data.data.job_result.job_status,
      },
      event.requestContext
    );
  } catch (error) {
    console.log(error);
    return failure({ status: 'fail', message: "We couldn't get the status" }, event.requestContext);
  }
};
