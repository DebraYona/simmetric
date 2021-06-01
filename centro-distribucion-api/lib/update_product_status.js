/* eslint-disable no-console */
const axios = require('axios');
const product = require('../data/product');
const statuschange = require('../data/statuschange');
const { getProductStatus, getProductConfirmationStatus } = require('./product_status');

const updateProductStatus = async (params) => {
  const productQuery = await product.getByCudId(params.cudCode);
  if (Object.keys(productQuery).length === 0) {
    return productQuery;
  }
  const updateObject = {};
  const logObject = {
    identifier: params.cudCode,
    previous_status: productQuery.status,
    previous_confirmed_status: productQuery.confirmed_status,
    info: params.info || '',
    new_status: productQuery.status,
    new_confirmed_status: productQuery.confirmed_status,
  };

  // 1 update status on product
  if (params.newStatus && productQuery.status !== params.newStatus) {
    updateObject.status = getProductStatus(params.newStatus).code;
    logObject.new_status = getProductStatus(params.newStatus).code;
  }
  if (params.newConfirmedStatus && productQuery.confirmed_status !== params.newConfirmedStatus) {
    updateObject.confirmed_status = getProductConfirmationStatus(params.newConfirmedStatus).code;
    logObject.new_confirmed_status = getProductConfirmationStatus(params.newConfirmedStatus).code;
  }
  if (params.jobID) {
    updateObject.job_id = params.jobID;
  }
  const updateResult = await product.updateByCudId(params.cudCode, updateObject);

  // 2 create a statuschange entry
  await statuschange.create(logObject);
  return updateResult;
};

const updateBatchProductStatusByTravelId = async (travelId, params) => {
  // 0 validate input
  console.log(travelId)
  console.log(params)
  if (!params.newStatus || getProductStatus(params.newStatus).description === 'UNKNOWN_STATUS') {
    console.log('updateBatch by travel requires a valid newStatus value');
    return {};
  }
  const productGetQuery = await product.getByTravelId(travelId);
  // 1 update in batch
  const productUpdateQuery = await product.updateStatusByTravelId(
    travelId,
    getProductStatus(params.newStatus).code
  );
  // 2 create entry for each product
  await Promise.all(
    productGetQuery.map((entry) => {
      return statuschange.create({
        identifier: entry.identifier,
        previous_status: entry.status,
        previous_confirmed_status: entry.confirmed_status,
        info: params.info || '',
        new_status: getProductStatus(params.newStatus).code,
        new_confirmed_status: entry.confirmed_status,
      });
    })
  );
  return productUpdateQuery;
};
const updateBatchProductStatusByWithNewTravel = async (travelId, products, info) => {
  // 0 get products from this list
  const previousProducts = await Promise.all(products.map((entry) => product.getByCudId(entry.identifier)));
  console.log(previousProducts)
  // 1 update with new travel
  const dataProduct = await product.updateNewTravel(previousProducts, travelId, 210);
  // 2 create trace for every product
  await Promise.all(
    products.map((entry) => {
      const previousEntry = previousProducts.filter((e) => e.identifier === entry.identifier);
      return statuschange.create({
        identifier: entry.identifier,
        previous_status: previousEntry[0].status,
        previous_confirmed_status: previousEntry[0].confirmed_status,
        info: info || '',
        new_status: entry.status,
        new_confirmed_status: previousEntry[0].confirmed_status,
      });
    })
  );

  return dataProduct;
};

const processListInNewTravel = async (data) => {
  console.log('data', data)

  const config = {
    method: 'post',
    url: `${process.env.URL_INTEGRATION_API}/product/processlist`,
    headers: {
      'x-api-key': process.env.X_API_KEY, 
      'Content-Type': 'application/json'
    },
    data
  };

  return axios(config)
  .then( (response) => {
    console.log(JSON.stringify(response.data));
    return response
  })
  .catch( (error) => {
    console.log(error);
    return error
  });
}


module.exports = {
  updateProductStatus,
  updateBatchProductStatusByTravelId,
  updateBatchProductStatusByWithNewTravel,
  processListInNewTravel
};
