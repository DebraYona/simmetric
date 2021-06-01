/* eslint-disable no-console */
const axios = require('axios');
const { success } = require('../../lib/http-responses');
const { processError } = require('../../lib/error_handlers');
const status = require('../../data/status');

module.exports.handler = async (event) => {
  // 0. Load event info
  const body = JSON.parse(event.Records[0].body);
  // 1. Send to enlace endpoint
  console.log(body);
  const enlaceHeaders ={
          'Content-Type': 'application/json',
          'content-language': 'es',
        };
  const cancelUrl =`${process.env.CLICKLABS_URL}/cancel_booking_delivery`;
  let CancelResponse;
  try {
    CancelResponse = await axios({
      method: 'post',
      url: cancelUrl,
      headers: enlaceHeaders,
      data: body,
      timeout: parseInt(process.env.ENLACE_TIMEOUT, 10) 
    });
  } catch (catchError) {
    return processError(2100, { error: catchError.message, response: catchError.response.data }, body.service_order_id);
  }
  console.log(CancelResponse);
  // 2. Update status on DB - TO_DO UPDATE IN DB - Status is get on enlace, not needed
  // 3. send ok notification to status table
  await status.create({
    service_order_id: body.service_order_id,
    job_id: null,
    order_id: null,
    status: 'ORDER_CANCELLED',
    message: 'Order cancelled, waiting for verification',
    data: '',
  });
  return success({
    status: 'ok',
    message: 'Order cancelled waiting for verification',
    orderId: null,
  });
};
