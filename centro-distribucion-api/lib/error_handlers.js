const { errorNotification } = require('./http-responses');
const status = require('../data/status');
const { getError } = require('./error_codes');

async function processError(errorCode, errorReturn, serviceOrderId, verbose = true, toDB = true){
    if(verbose){console.log(`ERROR DETECTED: ${errorCode}`)}
    if(verbose){console.log(`Catched: ${errorReturn}`)}
    const error = getError(errorCode);
    const requestError = errorNotification(error, serviceOrderId);
    if(verbose){console.log(requestError)}
    if(toDB){await status.create({
        service_order_id: serviceOrderId,
        status: error.message,
        message: error.description,
        data: '',
      });}
    return `ERROR: operation failed with code ${errorCode}, service order: ${serviceOrderId}`

}

module.exports = {
    processError
}