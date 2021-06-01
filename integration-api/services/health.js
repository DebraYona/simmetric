const { success } = require('../lib/http-responses');

module.exports.handler = async (event) => {
  return success(
    {
      status: 'ok',
      message: 'All services ok!!!',
    },
    event.requestContext
  );
};
