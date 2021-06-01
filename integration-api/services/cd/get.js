const { success, failure, badRequest } = require('../../lib/http-responses');
const product = require('../../data/product');

module.exports.handler = async (event) => {
  const { status } = event.queryStringParameters;
  const filter = {};
  if (product.statusCd.includes(status)) {
    filter.cd_status = status;
  } else {
    return badRequest({ status: 'fail', message: 'Incorrect status filter' }, event.requestContext);
  }
  try {
    const data = await product.getAllCD(filter);

    return success(
      {
        status: 'ok',
        products: data,
        count: data.length,
      },
      event.requestContext
    );
  } catch (error) {
    console.log(error);
    return failure(
      { status: 'fail', message: "We couldn't get the consolidated CUDs" },
      event.requestContext
    );
  }
};
