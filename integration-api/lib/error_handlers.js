/* eslint-disable no-console */
const { errorNotification } = require('./http-responses');
const status = require('../data/status');
const { getError } = require('./error_codes');

async function processError(errorCode, errorReturn, serviceOrderId, verbose = true, toDB = true){
    if(verbose){console.log(`ERROR DETECTED: ${errorCode}`)}
    if(verbose){console.log(`Catched: ${JSON.stringify(errorReturn)}`)}
    const error = getError(errorCode);
    const requestError = errorNotification(error, serviceOrderId);
    if(verbose){console.log(requestError)}
    if(toDB){await status.create({
        service_order_id: serviceOrderId,
        status: error.message,
        message: error.description,
        data: JSON.stringify(errorReturn),
      });}
    return `ERROR: operation failed with code ${errorCode}, service order: ${serviceOrderId}`

}

class ResponseError extends Error{
    constructor(error, details){
        super(error)
        this.response = {data: details}
        this.name = this.constructor.name
        this.message = error
        this.code = 'RESPONSEERROR'
        console.log(error)
        console.log(details)
    }
}

module.exports = {
    processError,
    ResponseError
}