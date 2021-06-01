/* eslint-disable no-console */
const { success, failure } = require('../../lib/http-responses');
const order = require('../../data/order');
const product = require('../../data/product');
const { getProductStatusFromEnlace } = require('../../lib/product_status');
const { getOrderStatusFromEnlace } = require('../../lib/order_status');
const { updateProductStatus } = require('../../lib/enlace');

module.exports.handler = async (event) => {
  console.log(event);
  // 1. check service_order_id
  const body = JSON.parse(event.body);
  console.log(body);
  const serviceOrderId = body.service_order_id;
  let foundOrder;
  try {
    foundOrder = await order.getByServiceOrderId(serviceOrderId);
    console.log(foundOrder);
  } catch (catchError) {
    return failure(
      { status: 'fail', message: "We couldn't find the order in the database" },
      event.requestContext
    );
  }
  console.log(foundOrder);
  console.log(foundOrder.length);
  if (Object.keys(foundOrder).length === 0) {
    return failure(
      { status: 'fail', message: "We couldn't find the order in the database" },
      event.requestContext
    );
  }
  console.log('---');
  // 2. update order_state for service order
  await order.update(foundOrder.id, {
    status: getOrderStatusFromEnlace(body.order_state).code,
  });
  // 3. for each cud, update cud_status
  const cudUpdate = body.cuds.map(async (element) => {
    const thisProduct = await product.getByCudId(element.cud_id);
    if (Object.keys(thisProduct).length === 0) {
      return Promise.resolve();
    }
    if (thisProduct.status >= 200 && thisProduct.status < 300) {
      return Promise.resolve();
    }
    return updateProductStatus({
      cudCode: element.cud_id,
      newStatus: getProductStatusFromEnlace(element.cud_status).code,
      info: 'notificationReceive',
      updateUploadFailed: false,
    });
  });
  await Promise.all(cudUpdate);
  // 4. update soap from ripley
  // NOT AVAILABLE
  return success(
    {
      status: 'ok',
      message: 'Notification received',
    },
    event.requestContext
  );
};
