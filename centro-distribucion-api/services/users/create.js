const { success, unAuthorized, badRequest } = require('../../lib/http-responses');
const { createUser } = require('../../lib/users');
const { getData } = require('../../lib/authorizer');

module.exports.handler = async (event) => {
  const userData = getData(event.requestContext);

  if (userData.role !== '1') {
    return unAuthorized({}, event.requestContext);
  }

  const body = JSON.parse(event.body);
  console.log(body);

  try {
    const data = await createUser(body);

    return success(
      {
        status: 'ok',
        data,
      },
      event.requestContext
    );
  } catch (error) {
    console.log(error.code);
    return badRequest(
      { status: 'fail', message: error.message, code: error.code },
      event.requestContext
    );
  }
};
