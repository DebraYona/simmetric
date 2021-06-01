const errorCodes = [
  {
    code: 1000,
    message: 'EXISTING_ORDER',
    description:
      'There is an existing order with that service id, please check the service_order_id parameter',
  },
  {
    code: 1001,
    message: 'NON_EXISTING_ORDER',
    description:
      'An order with that service id could not be found, please check the service_order_id parameter',
  },
  {
    code: 1100,
    message: 'LOCATION_INVALID',
    description: 'The location was not found, please check the location_id parameter',
  },
  {
    code: 1200,
    message: 'PRODUCT_LIST_IS_EMPTY',
    description: 'The product list is empty, please check the cuds parameter',
  },
  {
    code: 1300,
    message: 'ADDRESS_NOT_FOUND',
    description: 'The address could not be found, please check the address and comuna parameters',
  },
  {
    code: 2000,
    message: 'FAILED_TO_ROUTE',
    description: 'The backend could not retrieve an estimated route for this service',
  },
  {
    code: 2001,
    message: 'ROUTE_MALFORMED',
    description: 'The backend returned a malformed route response',
  },
  {
    code: 2100,
    message: 'FAILED_TO_BOOK',
    description: 'The backend could not retrieve a booking for this service',
  },
  {
    code: 2101,
    message: 'BOOKING_MALFORMED',
    description: 'The backend returned a malformed booking response',
  },
  {
    code: 2201,
    message: 'TOLL_MALFORMED',
    description: 'The backend returned a malformed toll response',
  },
  {
    code: 2200,
    message: 'FAILED_TO_TOLL',
    description: 'The backend could not retrieve a toll for this service',
  },
  {
    code: 3000,
    message: 'TRAVEL_NOT_FOUND',
    description: 'The travel was not found with that id',
  },
];

/**
 * Get an Error code object
 * {
 *   code: 1000,
 *   message: 'EXISTING_ORDER',
 *   description: 'There is an existing order with that service id',
 * }
 * @param {int} code
 * @returns {object} Error code object
 */
const getError = (code) => {
  const error = errorCodes.find((e) => e.code === code);
  if (!error) {
    return {
      code: 9999,
      message: 'UNKNOW_ERROR',
      description: 'Unknow error',
    };
  }
  return error;
};

module.exports = {
  getError,
};
