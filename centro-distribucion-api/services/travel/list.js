const { success, failure } = require('../../lib/http-responses');
const travel = require('../../data/travel');

module.exports.handler = async (event) => {
  const { status } = event.queryStringParameters;
  const filter = {};
  if (status) {
    filter.status = status;
  }

  try {
    const data = await travel.listAll(filter);
    console.log(data);

    return success(
      {
        status: 'ok',
        data,
      },
      event.requestContext
    );
  } catch (error) {
    console.log(error);
    return failure(
      { status: 'fail', message: "We couldn't get list of travels" },
      event.requestContext
    );
  }
};
