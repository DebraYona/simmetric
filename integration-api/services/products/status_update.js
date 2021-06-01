/* eslint-disable no-console */
const { success, failure } = require('../../lib/http-responses');
const { getProductStatus, getProductConfirmationStatus } = require('../../lib/product_status');
const { updateProductStatus } = require('../../lib/enlace');

module.exports.handler = async (event) => {
  const { cud } = event.pathParameters;
  const body = JSON.parse(event.body);
  console.log(body);
  let newStatus = body.status;
  let newConfirmedStatus = body.confirmed_status;
  // 1. Check if input is valid
  // 1.1 if no input, reject
  if (!newStatus && !newConfirmedStatus) {
    return failure(
      { status: 'fail', message: 'No data provided for status update' },
      event.requestContext
    );
  }
  // 1.2 if an input is not valid, reject
  if (newStatus && getProductStatus(newStatus).description === 'UNKNOWN_STATUS') {
    return failure(
      { status: 'fail', message: 'status parameter is invalid, please use a valid code' },
      event.requestContext
    );
  }
  if (
    newConfirmedStatus &&
    getProductConfirmationStatus(newConfirmedStatus).description === 'UNKNOWN_STATUS'
  ) {
    return failure(
      { status: 'fail', message: 'confirmed_status parameter is invalid, please use a valid code' },
      event.requestContext
    );
  }
  // 1.3 check if product exists - Is done in updateProductStatus
  // 1.4 update input vars
  newStatus = newStatus ? getProductStatus(newStatus).code : null;
  newConfirmedStatus = newConfirmedStatus
    ? getProductConfirmationStatus(newConfirmedStatus).code
    : null;
  // 2. Update the database entry
  const updateResult = await updateProductStatus(
    ({
      cudCode: cud,
      newStatus,
      newConfirmedStatus,
      info : 'updateProductStatus',
      updateUploadFailed : false
    })
  );
  if (Object.keys(updateResult).length === 0) {
    return failure({ status: 'fail', message: 'product does not exist' }, event.requestContext);
  }
  // 3. return success
  return success(
    {
      status: 'ok',
      message: 'Product status updated',
      updateResult,
    },
    event.requestContext
  );
};
