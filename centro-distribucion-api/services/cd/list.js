const { success, failure } = require('../../lib/http-responses');
const product = require('../../data/product');

module.exports.handler = async (event) => {
  const limit = 3000;
  const filter = {};
  let whereDates = [];
  const pagination = { limit, offset: 0, page: 0 };

  if (event.queryStringParameters != null) {
    const { status, page, dateFrom, dateUntil } = event.queryStringParameters;
    if (status) {
      filter.status = status;
    }
    if (page) {
      pagination.page = page - 1;
    }
    if (dateFrom && dateUntil) {
      whereDates = [dateFrom, dateUntil];
    }
  }

  if (pagination.page) {
    pagination.limit = limit;
    pagination.offset = pagination.page * limit;
  }

  try {
    const data = await product.listAllCDWthTravel(filter, pagination, whereDates);
    let nextLink = null;
    let prevLink = null;
    if (limit * pagination.page < data.count) {
      if (pagination.offset + limit >= data.count) {
        nextLink = null;
      } else {
        nextLink = `${event.requestContext.resourcePath}?page=${pagination.page + 2}`;
      }
    }

    if (pagination.page > 0) {
      prevLink = `${event.requestContext.resourcePath}?page=${pagination.page}`;
    }

    return success(
      {
        status: 'ok',
        data: data.rows,
        count: data.rows.length,
        totalCount: data.count,
        nextLink,
        prevLink,
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
