const { success, failure } = require('../../lib/http-responses');
const product = require('../../data/product');

module.exports.handler = async (event) => {
  const filter = {};
  let whereDates = [];
  if (event.queryStringParameters != null) {
    const { status,dateFrom, dateUntil } = event.queryStringParameters;
    if (status) {
      filter.status = status;
    }
    if (dateFrom && dateUntil) {
      whereDates = [dateFrom, dateUntil];
    }
  }

  try {
    const data = await product.getAllCD(filter,whereDates);


    // const filtered = data.map((d) => {
    //   const pickupTime = new Date(d['Order.Pickups.time']);
    //   const oneDay = new Date(Date.now() - 72 * 60 * 60 * 1000);
    //   const futureDay = new Date(Date.now() + 32 * 60 * 60 * 1000);
    //   if (pickupTime > oneDay && pickupTime < futureDay) {
    //     return d;
    //   }
    //   return null;
    // });

    const pickupPackages = data; // filtered.filter((f) => f != null);

    console.log(pickupPackages);
    console.log(pickupPackages.length);
    return success(
      {
        status: 'ok',
        data: pickupPackages,
        count: data.length,
      },
      event.requestContext
    );
  } catch (error) {
    console.log(error);
    return failure(
      { status: 'fail', message: "We couldn't get the consolidated CUDs" },
      event.requestContext
    );
  }
};
