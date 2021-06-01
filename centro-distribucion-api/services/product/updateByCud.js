const { success, failure, badRequest, notFound } = require('../../lib/http-responses');
const { updateProductStatus } = require('../../lib/update_product_status');

module.exports.handler = async (event) => {
  const { cud, status } = event.pathParameters;
  if (!cud) {
    return badRequest();
  }

  try {
    const productUpdate = await updateProductStatus({
      cudCode: cud,
      newStatus: status,
      info: 'CDA_updateProductStatusByCud'
    })

    if (Object.keys(productUpdate).length === 0) {
      return notFound();
    }

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
