/* eslint-disable no-console */
const AWS = require('aws-sdk');
const XLSX = require('xlsx');
const { success, failure } = require('../../lib/http-responses');
const order = require('../../data/order');
const product = require('../../data/product');
const consolidation = require('../../data/consolidation');
const { updateProductStatus } = require('../../lib/enlace');

module.exports.handler = async (event) => {
  const s3 = new AWS.S3();
  // 0. check the inputs
  console.log(event);
  const srcBucket = event.Records[0].s3.bucket.name;
  const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
  console.log(srcBucket);
  console.log(srcKey);
  // CASE 1 : CONSOLIDATION FILENAME
  if (srcKey.includes('CONSOLIDATION')) {
    // 1. download the file
    let consolidatedFile;
    try {
      const params = {
        Bucket: srcBucket,
        Key: srcKey,
      };
      consolidatedFile = await s3.getObject(params).promise();
      console.log(consolidatedFile);
      // 2. parse the file
      const worksheets = XLSX.read(consolidatedFile.Body, { type: 'buffer' });
      console.log(worksheets);
      const fileParsed = XLSX.utils.sheet_to_json(worksheets.Sheets[worksheets.SheetNames[0]]);
      console.log(fileParsed);
      // 3. update the DB
      // 3.1 get the job id from the file
      let orderQuery = fileParsed.map((entry) =>
        order.getByJobId(entry.Reserva, {
          sharedServiceId: entry.shared_service_id,
          jobIdFromFile: entry.Reserva,
        })
      );
      console.log(orderQuery);
      orderQuery = await Promise.all(orderQuery);
      console.log(orderQuery);
      // 3.2 get the service order id linked with job id
      // 3.3 get all cuds with that service order
      let productQuery = orderQuery.map((entry) =>
        product.getByOrderIdWithAdditionalObject(entry.id, {
          sharedServiceId: entry.sharedServiceId,
          jobIdFromFile: entry.jobIdFromFile,
          service_order_id: entry.service_order_id,
        })
      );
      console.log(productQuery);
      productQuery = await Promise.all(productQuery);
      console.log(productQuery);
      // 3.4 insert an entry per cud with the consolidation data in the database
      const consArgs = productQuery.map((entry) => {
        return entry.map((thiscud) => {
          return {
            identifier: thiscud.identifier,
            order_id: thiscud.order_id,
            product_id: thiscud.id,
            grouping: thiscud.sharedServiceId,
            scanned: 0,
            service_order_id: thiscud.service_order_id,
            booking_id: thiscud.jobIdFromFile,
          };
        });
      });
      console.log(consArgs);
      const insertQuery = consArgs.map((entry) => consolidation.createBatch(entry));
      console.log(insertQuery);
      await Promise.all(insertQuery);
      console.log(insertQuery);
      return success(
        {
          status: 'ok',
          message: 'finished processing data',
        },
        event.requestContext
      );
    } catch (error) {
      console.log(error);
      return failure(
        {
          status: 'failed',
          message: 'failed to download the target file',
        },
        event.requestContext
      );
    }
    // CASE 2 : UPDATE215 filename
  } else if (srcKey.includes('UPDATE215')) {
    // 1. download the file
    let consolidatedFile;
    try {
      const params = {
        Bucket: srcBucket,
        Key: srcKey,
      };
      consolidatedFile = await s3.getObject(params).promise();
      console.log(consolidatedFile);
      // 2. parse the file
      const worksheets = XLSX.read(consolidatedFile.Body, { type: 'buffer' });
      console.log(worksheets);
      const fileParsed = XLSX.utils.sheet_to_json(worksheets.Sheets[worksheets.SheetNames[0]]);
      console.log(fileParsed);
      // 3. update the DB
      // 3.1 update each value
      let updateQuery = fileParsed.map((entry) =>
        updateProductStatus({
          cudCode: entry.cud,
          newStatus: 215,
          info: 'fileUpdate215',
          updateUploadFailed: true,
        })
      );
      console.log(updateQuery);
      updateQuery = await Promise.all(updateQuery);
      console.log(updateQuery);
      return success(
        {
          status: 'ok',
          message: 'finished processing data',
        },
        event.requestContext
      );
    } catch (error) {
      console.log(error);
      return failure(
        {
          status: 'failed',
          message: 'failed to download the target file',
        },
        event.requestContext
      );
    }
    // CASE 3 : UPDATE301 filename
  } else if (srcKey.includes('UPDATE301')) {
    // 1. download the file
    let consolidatedFile;
    try {
      const params = {
        Bucket: srcBucket,
        Key: srcKey,
      };
      consolidatedFile = await s3.getObject(params).promise();
      console.log(consolidatedFile);
      // 2. parse the file
      const worksheets = XLSX.read(consolidatedFile.Body, { type: 'buffer' });
      console.log(worksheets);
      const fileParsed = XLSX.utils.sheet_to_json(worksheets.Sheets[worksheets.SheetNames[0]]);
      console.log(fileParsed);
      // 3. update the DB
      // 3.1 update each value
      let updateQuery = fileParsed.map((entry) =>
        updateProductStatus({
          cudCode: entry.cud,
          newStatus: 301,
          info: 'fileUpdate301',
          updateUploadFailed: true,
        })
      );
      console.log(updateQuery);
      updateQuery = await Promise.all(updateQuery);
      console.log(updateQuery);
      return success(
        {
          status: 'ok',
          message: 'finished processing data',
        },
        event.requestContext
      );
    } catch (error) {
      console.log(error);
      return failure(
        {
          status: 'failed',
          message: 'failed to download the target file',
        },
        event.requestContext
      );
    }
  } else {
    console.log("filename doesn't match filter, ignoring");
    return success(
      {
        status: 'ok',
        message: 'file ignored, no action taken',
      },
      event.requestContext
    );
  }
};
