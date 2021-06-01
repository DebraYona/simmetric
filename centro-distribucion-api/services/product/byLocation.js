const { badRequest, success, failure } = require('../../lib/http-responses');
const product = require('../../data/product');

/**
 * Return a list of products by location id with the total number of products with status (default 100)
 * Used in app to get the list of products to load
 * @param {*} event
 * example return:
 * {
 *    "status": "ok",
 *    "data": [
 *        {
 *            "id": 3,
 *            "order_id": 2,
 *            "guide_number": "",
 *            "identifier": "TESTCUD001-604",
 *            "sku": "",
 *            "status": 215,
 *            "description": "Set platos Rojos New Age",
 *            "price": 18980,
 *            "quantity": 2,
 *            "last_mile": 0,
 *            "returned": 0,
 *            "travel_id": 1,
 *            "created_at": "2020-08-11T23:02:29.000Z",
 *            "updated_at": "2020-08-11T23:02:29.000Z",
 *            "Order.id": 2,
 *            "Order.service_order_id": "ENLACE-TEST-604",
 *            "Order.contract_id": "1088",
 *            "Order.client_id": null,
 *            "Order.job_id": 3234367,
 *            "Order.route_id": 6650,
 *            "Order.last_mile": 0,
 *            "Order.quantity_boxes": 2,
 *            "Order.location_id": 10034,
 *            "Order.type_of_charge": "",
 *            "Order.status": "100",
 *            "Order.request_id": null,
 *            "Order.created_at": "2020-08-11T23:02:29.000Z",
 *            "Order.updated_at": "2020-08-11T23:02:29.000Z",
 *            "Order.Location.id": 10034,
 *            "Order.Location.name": "Costanera Center",
 *            "Order.Location.address": "ANDRES BELLO 2447",
 *            "Order.Location.comuna": "Providencia",
 *            "Order.Dropoffs.id": 2,
 *            "Order.Dropoffs.address": "Argomedo 60",
 *            "Order.Dropoffs.comuna": "Santiago"
 *        },
 *        {
 *            "id": 4,
 *            "order_id": 2,
 *            "guide_number": "",
 *            "identifier": "TESTCUD002-604",
 *            "sku": "",
 *            "status": 215,
 *            "description": "Vasos rojos Old Age",
 *            "price": 6990,
 *            "quantity": 1,
 *            "last_mile": 0,
 *            "returned": 0,
 *            "travel_id": 1,
 *            "created_at": "2020-08-11T23:02:29.000Z",
 *            "updated_at": "2020-08-11T23:02:29.000Z",
 *            "Order.id": 2,
 *            "Order.service_order_id": "ENLACE-TEST-604",
 *            "Order.contract_id": "1088",
 *            "Order.client_id": null,
 *            "Order.job_id": 3234367,
 *            "Order.route_id": 6650,
 *            "Order.last_mile": 0,
 *            "Order.quantity_boxes": 2,
 *            "Order.location_id": 10034,
 *            "Order.type_of_charge": "",
 *            "Order.status": "100",
 *            "Order.request_id": null,
 *            "Order.created_at": "2020-08-11T23:02:29.000Z",
 *            "Order.updated_at": "2020-08-11T23:02:29.000Z",
 *            "Order.Location.id": 10034,
 *            "Order.Location.name": "Costanera Center",
 *            "Order.Location.address": "ANDRES BELLO 2447",
 *            "Order.Location.comuna": "Providencia",
 *            "Order.Dropoffs.id": 2,
 *            "Order.Dropoffs.address": "Argomedo 60",
 *            "Order.Dropoffs.comuna": "Santiago"
 *        },
 *        {
 *            "id": 5,
 *            "order_id": 2,
 *            "guide_number": "",
 *            "identifier": "TESTCUD003-604",
 *            "sku": "",
 *            "status": 215,
 *            "description": "Toallas Sport",
 *            "price": 5990,
 *            "quantity": 4,
 *            "last_mile": 0,
 *            "returned": 0,
 *            "travel_id": 1,
 *            "created_at": "2020-08-11T23:02:29.000Z",
 *            "updated_at": "2020-08-11T23:02:29.000Z",
 *            "Order.id": 2,
 *            "Order.service_order_id": "ENLACE-TEST-604",
 *            "Order.contract_id": "1088",
 *            "Order.client_id": null,
 *            "Order.job_id": 3234367,
 *            "Order.route_id": 6650,
 *            "Order.last_mile": 0,
 *            "Order.quantity_boxes": 2,
 *            "Order.location_id": 10034,
 *            "Order.type_of_charge": "",
 *            "Order.status": "100",
 *            "Order.request_id": null,
 *            "Order.created_at": "2020-08-11T23:02:29.000Z",
 *            "Order.updated_at": "2020-08-11T23:02:29.000Z",
 *            "Order.Location.id": 10034,
 *            "Order.Location.name": "Costanera Center",
 *            "Order.Location.address": "ANDRES BELLO 2447",
 *            "Order.Location.comuna": "Providencia",
 *            "Order.Dropoffs.id": 2,
 *            "Order.Dropoffs.address": "Argomedo 60",
 *            "Order.Dropoffs.comuna": "Santiago"
 *        },
 *        {
 *            "id": 6,
 *            "order_id": 2,
 *            "guide_number": "",
 *            "identifier": "TESTCUD004-604",
 *            "sku": "",
 *            "status": 215,
 *            "description": "Consola de Juegos",
 *            "price": 996990,
 *            "quantity": 1,
 *            "last_mile": 0,
 *            "returned": 0,
 *            "travel_id": 1,
 *            "created_at": "2020-08-11T23:02:29.000Z",
 *            "updated_at": "2020-08-11T23:02:29.000Z",
 *            "Order.id": 2,
 *            "Order.service_order_id": "ENLACE-TEST-604",
 *            "Order.contract_id": "1088",
 *            "Order.client_id": null,
 *            "Order.job_id": 3234367,
 *            "Order.route_id": 6650,
 *            "Order.last_mile": 0,
 *            "Order.quantity_boxes": 2,
 *            "Order.location_id": 10034,
 *            "Order.type_of_charge": "",
 *            "Order.status": "100",
 *            "Order.request_id": null,
 *            "Order.created_at": "2020-08-11T23:02:29.000Z",
 *            "Order.updated_at": "2020-08-11T23:02:29.000Z",
 *            "Order.Location.id": 10034,
 *            "Order.Location.name": "Costanera Center",
 *            "Order.Location.address": "ANDRES BELLO 2447",
 *            "Order.Location.comuna": "Providencia",
 *            "Order.Dropoffs.id": 2,
 *            "Order.Dropoffs.address": "Argomedo 60",
 *            "Order.Dropoffs.comuna": "Santiago"
 *        }
 *    ],
 *    "count": 4,
 *    "url": "/product/location/10034",
 *    "requestId": "ckfzyv5c70004ewfq310ph9qg",
 *    "timestamp": 1602109893307
 * }
 */

module.exports.handler = async (event) => {
  let productStatus = 100;
  const { locationId } = event.pathParameters;
  if (!locationId) {
    return badRequest();
  }

  if (event.queryStringParameters != null) {
    const { status } = event.queryStringParameters;
    if (status) {
      productStatus = status;
    }
  }

  try {
    const data = await product.getByLocationId(locationId, productStatus);

    console.log(data);

    return success(
      {
        status: 'ok',
        data,
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
