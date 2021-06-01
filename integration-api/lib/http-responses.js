function buildResponse(statusCode, body, requestContext = null) {
  const bodyContent = body;

  if (requestContext && requestContext.path) {
    bodyContent.url = requestContext.path;
  }
  if (requestContext && requestContext.requestId) {
    bodyContent.requestId = requestContext.requestId;
  }

  if (requestContext && requestContext.requestTimeEpoch) {
    bodyContent.timestamp = requestContext.requestTimeEpoch;
  }
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Headers':
        'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    },
    body: JSON.stringify(bodyContent),
  };
}

function success(body, requestContext = null) {
  return buildResponse(200, body, requestContext);
}

function failure(error, requestContext = null) {
  return buildResponse(
    500,
    {
      message: error.message,
      code: error.code || 'INTERNAL_ERROR',
      time: new Date(),
      statusCode: 500,
    },
    requestContext
  );
}

function notFound(body, requestContext = null) {
  return buildResponse(
    404,
    {
      message: body.message || 'Not found',
      code: body.code || 'NOT_FOUND',
      time: new Date(),
      statusCode: 404,
    },
    requestContext
  );
}

function badRequest(body, requestContext = null, code = 400) {
  return buildResponse(
    code,
    {
      message: body.message || 'Bad request',
      code: body.code || 'BAD_REQUEST',
      description: body.description || 'There is a problem with your request',
      time: new Date(),
      statusCode: 400,
    },
    requestContext
  );
}

function unAuthorized(body, requestContext = null) {
  return buildResponse(
    403,
    {
      message: body.message || 'UNAUTHORIZED',
      code: body.code || 'UNAUTHORIZED',
      time: new Date(),
      statusCode: 403,
    },
    requestContext
  );
}

// eslint-disable-next-line camelcase
function errorNotification(error, service_order_id) {
  return {
    code: error.code,
    description: error,
    service_order_id,
    time: new Date(),
  };
}

module.exports = {
  success,
  failure,
  notFound,
  badRequest,
  unAuthorized,
  errorNotification,
};
