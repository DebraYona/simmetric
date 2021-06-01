/* eslint-disable no-console */
const AWS = require('aws-sdk');
const order = require('../../data/order');
const { success, failure } = require('../../lib/http-responses');
const product = require('../../data/product');
const { getProductStatus } = require('../../lib/product_status');

const sqs = new AWS.SQS({ region: process.env.REGION });
const queueName = process.env.ORDER_MODIFICATION_QUEUE;

module.exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  // 1. find cud in database
  let productQuery; 
  try {
    productQuery = await product.getByCudId(body.cud);
    console.log(productQuery);
    if (Object.keys(productQuery).length === 0) {
        return failure(
          { status: 'fail', message: "We couldn't find the defined cud" },
          event.requestContext
        );
      }
  }catch (error) {
    console.log(error);
    return failure({ status: 'fail', message: "We couldn't get the status" }, event.requestContext);
  }
  // 2. change status to cancelled
  const updateObject = {
    status: getProductStatus('190').code
  }
  try {
    const data = await product.updateByCudId(body.cud, updateObject);
    console.log(data);
} catch (error) {
    console.log(error);
    return failure(
      { status: 'fail', message: "We couldn't update the status" },
      event.requestContext
    );
  }
  console.log(productQuery.order_id)
  // 3. find service_order for that cud
  const orderQuery = await order.getById(productQuery.order_id)
  console.log(orderQuery)
  const SQSBody = {service_order_id: orderQuery.service_order_id}
  // 4. send a modification without extra parameters, order will be rebuilt and sent with the cancelled cuds in DB
  console.log('Starting SQS Creation...');

  const sqsParams = {
    MessageBody: JSON.stringify(SQSBody),
    QueueUrl: `https://sqs.${process.env.REGION}.amazonaws.com/${process.env.ACCOUNT_ID}/${queueName}`,
  };

  console.log(sqsParams);

  // const returnMessage = {
  //   MessageToQueue: sqsParams.MessageBody,
  // };

  try {
    const data = await sqs.sendMessage(sqsParams).promise();
    console.log(data);
    return success(
      {
        status: 'CUD_CANCEL_RECEIVED',
        message: `cud ${body.cud} with service id ${orderQuery.service_order_id} is pending to be cancelled`,
      },
      event.requestContext
    );
  } catch (error) {
    console.log(error);
    return failure({ error }, event.requestContext);
  }
};
