/* eslint-disable no-console */
const AWS = require('aws-sdk');
const location = require('../../data/location');
const order = require('../../data/order');
const creation = require('../../data/creation');
const product = require('../../data/product');
const { success, failure, badRequest } = require('../../lib/http-responses');
const { getError } = require('../../lib/error_codes');
const { manageAnExistingCud } = require('../../lib/enlace');

const sqs = new AWS.SQS({ region: process.env.REGION });
const queueName = process.env.targetQueue;

module.exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  // 1. Verify that is a unique service order id
  const existingOrder = await order.getByServiceOrderId(body.service_order_id);
  if (Object.keys(existingOrder).length > 0) {
    console.log('DETECTED ERROR 1000');
    const error = getError(1000);
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
      404
    );
  }
  // 3. Check if cuds are not duplicated
  if (process.env.CHECK_CUDS_ON_CREATION === 'YES') {
    const mapReturn = body.cuds.map((element) => {
      const cudCode = element.cud;
      const cudQuery = product.getByCudId(cudCode);
      console.log(cudQuery);
      return cudQuery;
    });
    const queryReturn = await Promise.all(mapReturn);
    const cudExistence = queryReturn.map((element) => {
      if (Object.keys(element).length > 0) {
        return element.identifier;
      }
      return null;
    });
    console.log(cudExistence);
    const nullChecker = cudExistence.filter((c) => c !== null);
    console.log(nullChecker);
    const deleters = [];
    nullChecker.forEach((element) => {
      if (element !== null) {
        console.log(`Found existing cud: ${element}`);
        deleters.push(manageAnExistingCud(element));
      }
    });
    await Promise.all(deleters);
  }
  // 4. add entries to creation database
  const creationPayload = body.cuds.map((element)=>{
    return {
      identifier: element.cud,
      service_order_id: body.service_order_id
    }
  })
  creation.createBatch(creationPayload)
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
        status: 'ORDER_RECEIVED',
        message: `Order with service id ${body.service_order_id} is pending to be created`,
      },
      event.requestContext
    );
  } catch (error) {
    console.log(error);
    return failure({ error }, event.requestContext);
  }
};
