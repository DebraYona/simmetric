const hm = require('heremap');
const axios = require('axios');

hm.config({
  app_id: process.env.HEREMAPS_APP_ID,
  app_code: process.env.HEREMAPS_APP_CODE,
});

const getGeocoding = async (address) => {
  const result = await hm.geocode(address);
  return result.coord;
};

const getGeocodingFromEndpoint = async (address) => {
  const apikey = process.env.HEREMAPS_APIKEY;
  const url = `https://geocode.search.hereapi.com/v1/geocode?q=${address}&apiKey=${apikey}`;
  const config = {
    method: 'get',
    url,
    headers: {},
    timeout: parseInt(process.env.ENLACE_TIMEOUT, 10),
  };
  return axios(config).then(function (response) {
    console.log(JSON.stringify(response.data));
    if (response.data.items.length === 0) {
      throw new Error('No addresses found');
    }
    for (let i = 0; i < response.data.items.length; i += 1) {
      if (response.data.items[i].address.countryCode === 'CHL') {
        return [response.data.items[i].position.lat, response.data.items[i].position.lng];
      }
    }
    throw new Error('No CHL addresses found');
  });
};

const getGeocodingFromGoogleMaps = async (address) => {
  const apikey = process.env.GOOGLEMAPS_APIKEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apikey}`;
  const config = {
    method: 'get',
    url,
    headers: {},
    timeout: parseInt(process.env.ENLACE_TIMEOUT, 10),
  };
  return axios(config).then(function (response) {
    console.log(JSON.stringify(response.data));
    return [
      response.data.results[0].geometry.location.lat,
      response.data.results[0].geometry.location.lng,
    ];
  });
};
module.exports = { getGeocoding, getGeocodingFromEndpoint, getGeocodingFromGoogleMaps };
