const AWS = require('aws-sdk');

const getUsers = async () => {
  const params = {
    UserPoolId: process.env.USER_POOL_ID,
  };
  try {
    const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
    const data = await cognitoidentityserviceprovider.listUsers(params).promise();
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const createUser = async (body) => {
  try {
    const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
    const data = await cognitoidentityserviceprovider
      .adminCreateUser({
        MessageAction: 'SUPPRESS',
        TemporaryPassword: body.password,
        UserAttributes: [
          {
            Name: 'email',
            Value: body.email || '',
          },
          {
            Name: 'phone_number',
            Value: body.phone || '',
          },
          {
            Name: 'custom:role',
            Value: body.role.toString() || '2',
          },
          {
            Name: 'custom:movil',
            Value: body.movil || '',
          },
          {
            Name: 'email_verified',
            Value: 'true',
          },
          {
            Name: 'phone_number_verified',
            Value: 'true',
          },
          {
            Name: 'name',
            Value: body.firstName,
          },
          {
            Name: 'family_name',
            Value: body.lastName,
          },
        ],
        Username: body.rut,
        UserPoolId: process.env.USER_POOL_ID,
      })
      .promise();
    console.log(data);
    const result = await cognitoidentityserviceprovider
      .adminSetUserPassword({
        Password: body.password,
        Permanent: true,
        Username: body.rut,
        UserPoolId: process.env.USER_POOL_ID,
      })
      .promise();
    console.log(result);
    return data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

module.exports = {
  getUsers,
  createUser,
};
