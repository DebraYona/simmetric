exports.handler = (event, context, callback) => {
    let route_body = {
        "message": "The task has been created.",
        "status": 200,
        "data": {
            "job_id": 3197073,
            "job_hash": "4ddf940d5ebda8fab6d5b734b57c44bd",
            "customer_name": "WEB PAGE",
            "customer_address": "Calle República Arabe de Egipto 400, Las Condes, Región Metropolitana de Santiago",
            "job_pickup_name": "fabian",
            "job_pickup_address": "Calle República Arabe de Egipto 400, Las Condes, Región Metropolitana de Santiago",
            "job_token": "d64bfd90bfaff8e260bac224a8ca4d7b",
            "timezone": 240,
            "payment_status": 0,
            "payment_state": 0,
            "job_time_utc": "2020-07-18 18:00:00",
            "route_type": 0,
            "customer_phone": "226773010",
            "is_vip": 0,
            "type_of_trip": "P",
            "schedule_ride": 1,
            "customer_username": "WEB PAGE",
            "customer_email": "contactoweb@transvip.cl",
            "job_address": "Pasaje Augusto Barcia 7619, Peñalolén, Región Metropolitana de Santiago",
            "number_of_passangers": 1,
            "estimated_payment_cost": 5620,
            "estimated_toll_price": 0
        },
        "jobs": {
            "key": 0,
            "data": [
                {
                    "job_id": 3197073,
                    "pickup_datetime": "2020-07-18T18:00:00Z"
                }
            ]
        },
        "pdf_data_resp": [
            {
                "job_id": 3197073,
                "payment_status": 0,
                "payment_state": 0,
                "job_time_utc": "2020-07-18T18:00:00Z",
                "route_type": 0,
                "is_vip": 0,
                "customer_phone": "226773010",
                "customer_username": "WEB PAGE",
                "job_pickup_address": "Calle República Arabe de Egipto 400, Las Condes, Región Metropolitana de Santiago",
                "customer_email": "contactoweb@transvip.cl",
                "job_address": "Pasaje Augusto Barcia 7600, Peñalolén, Región Metropolitana de Santiago",
                "number_of_passangers": 1,
                "estimated_payment_cost": 5620,
                "estimated_toll_price": 0
            }
        ]
    }
    let response = {
    
        'statusCode' : 200,
        'body' : JSON.stringify(route_body)
    }
      console.log(response);
      callback(null, response);

};