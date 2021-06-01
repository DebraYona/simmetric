const axios = require('axios');
const product = require('../data/product');


const productPostcreate = async (data) => {
  console.log('data', data)

  const config = {
    method: 'put',
    url: `${process.env.URL_INTEGRATION_API}/product/postcreate`,
    headers: {
      'x-api-key': process.env.X_API_KEY, 
      'Content-Type': 'application/json'
    },
    data
  };

  axios(config)
  .then( (response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch( (error) => {
    console.log(error);
  });
}

module.exports = {
  productPostcreate 
};