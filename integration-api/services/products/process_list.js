/* eslint-disable no-console */
const AWS = require('aws-sdk');
const { success, failure } = require('../../lib/http-responses');
const product = require('../../data/product');
const { createProductWithoutPreOrder } = require('../../lib/enlace');

const sqs = new AWS.SQS({ region: process.env.REGION });
const queueName = process.env.targetQueue;
const defaultLocationId = 10095;

module.exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  console.log(body)
  // 0. get product list
  try {
    const allProducts = body.products;
    const listOfNonCreated = [];
    // 1. look for every product in the list in the database
    await Promise.all(
      allProducts.map(async (entry) => {
        const productQuery = await product.getByCudId(entry.identifier);
        // 1.1 if there is no product, add a new entry to listofNonCreated
        if (Object.keys(productQuery).length === 0) {
          listOfNonCreated.push({
            identifier: entry.identifier,
            status: entry.status,
          });
          return productQuery;
        }
        // 1.2 if it exists, send to postcreation queue
        return sqs
          .sendMessage({
            MessageBody: JSON.stringify({ cud: entry.identifier }),
            QueueUrl: `https://sqs.${process.env.REGION}.amazonaws.com/${process.env.ACCOUNT_ID}/${queueName}`,
          })
          .promise();
      })
    );
    // 2. Create a product in the database, even if it doesn't exist
    console.log(listOfNonCreated);
    await Promise.all(
      listOfNonCreated.map((entry) =>
        createProductWithoutPreOrder(entry.identifier, entry.status, defaultLocationId)
      )
    );
    return success(
      {
        status: 'PROCESS_LIST_COMPLETED',
        message: `list processed without errors`,
      },
      event.requestContext
    );
  } catch (error) {
    console.log(error);
    return failure({ error }, event.requestContext);
  }
};
