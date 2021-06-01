const { success, failure } = require('../../lib/http-responses');
const status = require('../../data/status');

module.exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  console.log(event)
  console.log(body)
  try {
    const data = await status.create(body);
    console.log('SUCCESS')
    return success(
      {
        status: 'ok',
        message: 'Status created',
        data,
      },
      event.requestContext
    );
  } catch (error) {
    console.log(error);
    return failure(
      { status: 'fail', message: "We couldn't create the status" },
      event.requestContext
    );
  }
};
