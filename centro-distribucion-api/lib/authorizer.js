/**
 * Receive an event request.Context object and extract usefull data
 * @param {*} context
 */
const getData = (context) => {
  const { authorizer, requestId, identity, requestTimeEpoch } = context;
  const userId = authorizer.claims['cognito:username'];

  const { sourceIp } = identity;
  const role = context.authorizer.claims['custom:role'];
  const { name, family_name: lastName } = context.authorizer.claims;
  return {
    userId,
    requestId,
    sourceIp,
    requestTimeEpoch,
    role,
    name,
    lastName,
  };
};

module.exports = {
  getData,
};
