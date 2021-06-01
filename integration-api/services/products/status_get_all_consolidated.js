const { success, failure } = require('../../lib/http-responses');
const product = require('../../data/product');

module.exports.handler = async (event) => {
  const { status } = event.pathParameters;
  // 2. Check state machine if the status is valid - no state machine defined
  // 3. Update DB
  try {
    const data = await product.getAllByStatus(status);
    console.log(data);
    return success(
      {
        status: 'ok',
        product_status: data,
      },
      event.requestContext
    );
  } catch (error) {
    console.log(error);
    return failure({ status: 'fail', message: "We couldn't get the list of products" }, event.requestContext);
  }
};
