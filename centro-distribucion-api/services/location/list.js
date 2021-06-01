const { success, failure } = require('../../lib/http-responses');
const { groupBy } = require('../../lib/utils');
const product = require('../../data/product');

/**
 * Return a list of locations with the total number of products with status 100 (created)
 * Used in app to display the locations with products to pickup.
 * @param {*} event
 * example return:
 * {
 *   "status": "ok",
 *   "data": [
 *       {
 *           "id": 10034,
 *           "name": "Costanera Center",
 *           "count": 36
 *       },
 *       {
 *           "id": 10071,
 *           "name": "P.Egaña",
 *           "count": 926
 *       },
 *       {
 *           "id": 10095,
 *           "name": "Centro Distribución Ripley",
 *           "count": 4
 *       }
 *   ],
 *   "count": 966,
 *   "url": "/location",
 *   "requestId": "ckfzlzzz60001k5fq6cih52zf",
 *   "timestamp": 1602088284635
 *  }
 */

module.exports.handler = async (event) => {
  try {
    const data = await product.getAllCD({ status: 100 });

    const grouped = groupBy('Order.Location.name', data);
    const locationListWithProductCount = Object.keys(grouped).map((k) => {
      return { id: grouped[k][0]['Order.location_id'], name: k, count: grouped[k].length };
    });

    console.log(locationListWithProductCount);

    const totalCount = locationListWithProductCount.reduce((a, b) => a + b.count, 0);

    return success(
      {
        status: 'ok',
        data: locationListWithProductCount,
        count: totalCount,
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
