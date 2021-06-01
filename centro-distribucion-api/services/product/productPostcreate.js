const { success, failure, badRequest } = require('../../lib/http-responses');
const { productPostcreate } = require('../../lib/product_postcreate');

module.exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  console.log(body);
  console.log("body");

  if (!body || body.length === 0) {
    return badRequest();
  }
  console.log(body);
  console.log("sdsada");

  try {
    await Promise.all(
      body.map((entry) =>
      productPostcreate({
          cud: entry.identifier,
          newStatus: entry.status,
         
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