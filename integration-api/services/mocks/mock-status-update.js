exports.handler = (event, context, callback) => {
    let route_body = {
        message: "status received"
    }
    let response = {
    
        'statusCode' : 200,
        'body' : JSON.stringify(route_body)
    }
      console.log(response);
      callback(null, response);

};