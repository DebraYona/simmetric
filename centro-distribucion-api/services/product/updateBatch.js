const { success, failure, badRequest } = require('../../lib/http-responses');
const { updateProductStatus } = require('../../lib/update_product_status');

module.exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  if (!body.products || body.products.length === 0) {
    return badRequest();
  }
  console.log(body);

  try {
    await Promise.all(
      body.products.map((entry) =>
        updateProductStatus({
          cudCode: entry.identifier,
          newStatus: entry.status,
          info: 'updateProductBatch',
        })
      )
    );

    return success(
      {
        status: 'ok',
      },
      event.requestContext
    );
  } catch (error) {
    console.log(error);
    return failure(
      { status: 'fail', message: "We couldn't update the product" },
      event.requestContext
    );
  }
};
