const { success, failure } = require('../../lib/http-responses');
const { getData } = require('../../lib/authorizer');
const travel = require('../../data/travel');
const user = require('../../data/user');
const userTravel = require('../../data/user-travel');

module.exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const userData = getData(event.requestContext);

  console.log(body);
  console.log(userData);

  // body.travel.initiated_date = now;

  // It's a driver
  if (userData.role === '2') {
    body.travel.driver_name = userData.name;
    body.travel.driver_last_name = userData.lastName;
  }

  let dataUser = await user.getByCognitoId(userData.userId);

  if (!dataUser) {
    dataUser = await user.create({
      cognito_id: userData.userId,
      first_name: userData.name,
      last_name: userData.lastName,
      role: userData.role,
    });
  }

  console.log(dataUser.id);

  const dataTravel = await travel.create(body.travel);

  await userTravel.create({ travel_id: dataTravel.id, user_id: dataUser.id });

  try {
    return success(
      {
        status: 'ok',
        data: dataTravel,
      },
      event.requestContext
    );
  } catch (error) {
    console.log(error);
    return failure(
      { status: 'fail', message: "We couldn't get create a new Travel" },
      event.requestContext
    );
  }
};
