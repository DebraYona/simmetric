const AWS = require('aws-sdk');
const location = require('../../data/location');
const order = require('../../data/order');
const { success, failure, badRequest } = require('../../lib/http-responses');
const { getError } = require('../../lib/error_codes');

const sqs = new AWS.SQS({ region: process.env.REGION });
const queueName = process.env.ORDER_MODIFICATION_QUEUE;

module.exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  // 1. Verify that is a unique service order id
  const existingOrder = await order.getByServiceOrderId(body.service_order_id);
  if (Object.keys(existingOrder).length < 1) {
    console.log('DETECTED ERROR 1001');
    const error = getError(1001);
    return badRequest(
      {
        message: error.message,
        code: error.code,
        description: error.description,
        service_order_id: body.service_order_id,
      },
      event.requestContext,
      404
    );
  }
  if ('location_id' in body) {
    // 2. Check location
    const checkLocation = await location.getById(body.location_id);
    if (Object.keys(checkLocation).length === 0) {
      console.log('DETECTED ERROR 1100');
      const error = getError(1100);
      return badRequest(
        {
          message: error.message,
          code: error.code,
          description: error.description,
          service_order_id: body.service_order_id,
        },
        event.requestContext,
        409
      );
    }
  }
  console.log('Starting SQS Creation...');

  const sqsParams = {
    MessageBody: event.body,
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
        status: 'ORDER_MODIFY_RECEIVED',
        message: `Order with service id ${body.service_order_id} is pending to be modified`,
      },
      event.requestContext
    );
  } catch (error) {
    console.log(error);
    return failure({ error }, event.requestContext);
  }
};
