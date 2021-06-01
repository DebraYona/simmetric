/* eslint-disable no-console */
const AWS = require('aws-sdk');
const { success, failure } = require('../../lib/http-responses');

const sqs = new AWS.SQS({ region: process.env.REGION });
const queueName = process.env.targetQueue;

module.exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  // 1. no check is done
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
        status: 'PRODUCT_POSTCREATE_RECEIVED',
        message: `Product with cud id ${body.cud} is pending to be postcreated`,
      },
      event.requestContext
    );
  } catch (error) {
    console.log(error);
    return failure({ error }, event.requestContext);
  }
};
