const { success, failure, unAuthorized } = require('../../lib/http-responses');
const { getUsers } = require('../../lib/users');
const { getData } = require('../../lib/authorizer');

module.exports.handler = async (event) => {
  const userData = getData(event.requestContext);

  if (userData.role !== '1') {
    return unAuthorized({}, event.requestContext);
  }

  try {
    const data = await getUsers();

    const users = data.Users.map((u) => {
      const rut = u.Username;
      let cognitoId;
      let email;
      let phone;
      let firstName;
      let lastName;
      let role;
      u.Attributes.forEach((a) => {
        if (a.Name === 'sub') {
          cognitoId = a.Value;
        }
        if (a.Name === 'email') {
          email = a.Value;
        }
        if (a.Name === 'phone_number') {
          phone = a.Value;
        }
        if (a.Name === 'family_name') {
          lastName = a.Value;
        }
        if (a.Name === 'name') {
          firstName = a.Value;
        }
        if (a.Name === 'custom:role') {
          role = a.Value;
        }
      });
      return {
        rut,
        cognitoId,
        email,
        phone,
        firstName,
        lastName,
        role,
      };
    });

    return success(
      {
        status: 'ok',
        data: users,
        count: users.length,
      },
      event.requestContext
    );
  } catch (error) {
    console.log(error);
    return failure(
      { status: 'fail', message: "We couldn't get the user list" },
      event.requestContext
    );
  }
};
