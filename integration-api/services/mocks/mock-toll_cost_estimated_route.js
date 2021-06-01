exports.handler = (event, context, callback) => {
    let route_body = {
        "message": "Successful",
        "status": 200,
        "data": {
            "etaInSeconds": 1090,
            "distanceInMeters": 11482,
            "tollPrice": "2024.0",
            "tollCount": 3,
            "heremaps_response": {
                "summary": {
                    "distance": 11482,
                    "trafficTime": 1090,
                    "baseTime": 951,
                    "departure_date": "2020-07-20T18:00:00.000Z",
                    "arrival_date": "2020-07-20T18:18:00.000Z"
                },
                "cost": {
                    "totalCost": "2024.0",
                    "currency": "CLP",
                    "details": {
                        "driverCost": "0.0",
                        "vehicleCost": "0.0",
                        "tollCost": "2024.0"
                    }
                },
                "detail-cost": {
                    "0": {
                        "tollSystemId": "6087",
                        "detail": {
                            "country": "CHL",
                            "tollSystemId": "6087",
                            "name": "COSTANERA NORTE",
                            "languageCode": "ENG",
                            "amountInTargetCurrency": 2024
                        },
                        "tollStructures": {
                            "0": {
                                "name": "Providencia",
                                "amount": 420,
                                "latitude": -33.42409,
                                "longitude": -70.62187,
                                "linkId": 801460903,
                                "remainTime": 559,
                                "dateTime": "2020-07-20T18:08:00.000Z"
                            },
                            "1": {
                                "name": "Las Condes",
                                "amount": 802,
                                "latitude": -33.40908,
                                "longitude": -70.6043,
                                "linkId": 1233556862,
                                "remainTime": 426,
                                "dateTime": "2020-07-20T18:11:00.000Z"
                            },
                            "2": {
                                "name": "Las Condes",
                                "amount": 802,
                                "latitude": -33.40828,
                                "longitude": -70.59962,
                                "linkId": 1165085994,
                                "remainTime": 387,
                                "dateTime": "2020-07-20T18:11:00.000Z"
                            }
                        }
                    }
                }
            }
        }
    }
    let response = {
    
        'statusCode' : 200,
        'body' : JSON.stringify(route_body)
    }
      console.log(response);
      callback(null, response);

};