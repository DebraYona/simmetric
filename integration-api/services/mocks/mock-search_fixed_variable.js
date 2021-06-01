exports.handler = (event, context, callback) => {
    let route_body = {
        "message": "Exitoso",
        "status": 200,
        "data": {
            "id": 6302,
            "coverage_area_id": 1,
            "status": 1,
            "comments": "",
            "price": null,
            "price_list_id": 4823,
            "is_deleted": 0,
            "perKMChanges": 420,
            "waitTimeCharges": 0,
            "waitTimeInTrip": 0,
            "baseFare": 1500,
            "minimumFare": 3000,
            "time_of_trip_price": 80,
            "is_current": 1,
            "is_scheduled": 1,
            "category": 0,
            "type_of_trip": "P",
            "via_controlled_price": 0,
            "controlled_way_flag": 1,
            "branch": 1,
            "time_trip_shared_service": 35,
            "minimal_time_to_shared_booking_to_airport": 180,
            "pickup_travel_time_pap": 0,
            "pickup_tolerance_time_pap": 0,
            "travel_time_service_pick_up": 10,
            "tolerance_time_withdrawal_pickup": 10,
            "method_range_pickup": 1,
            "tolerance": 1,
            "fare_type": 0,
            "is_group_allowed": 0,
            "is_grouped_external": 0,
            "apply_estimated_distance_variable_fare": 1,
            "apply_charge_by_toll": 1,
            "collect_estimated_tag": 1,
            "price_list": [
                {
                    "id": 7656,
                    "type_of_service_id": 23,
                    "variable_pricing_id": 6302,
                    "is_deleted": 0,
                    "type_of_service_service_name": "Encomienda Taxi",
                    "type_of_service_status": 1,
                    "type_of_service_max_limit": 100,
                    "is_current": 1,
                    "is_scheduled": 1,
                    "category": 0,
                    "show_time_range": 1,
                    "typeOfService": {
                        "name": "Encomienda Taxi",
                        "status": 1,
                        "max_limit": 100,
                        "show_time_range": 1
                    },
                    "itemOfCharge": [
                        {
                            "id": 9216,
                            "variable_pricing_id": 6302,
                            "item_of_charge_id": 4,
                            "price": 3000,
                            "is_deleted": 0,
                            "tic_id": 4,
                            "tic_short_name": "QTH AC",
                            "tic_description": "QTH Adicional Cercano: QTH adicional dentro de la misma comuna.",
                            "tic_long_name": "Domicilio Adicional misma Comuna",
                            "tic_mode": 1,
                            "tic_manually": 1
                        },
                        {
                            "id": 9217,
                            "variable_pricing_id": 6302,
                            "item_of_charge_id": 3,
                            "price": 5000,
                            "is_deleted": 0,
                            "tic_id": 3,
                            "tic_short_name": "QTH AL",
                            "tic_description": "QTH Adicional Lejano: QTH adicional dentro de otra comuna.",
                            "tic_long_name": "Domicilio Adicional otra Comuna",
                            "tic_mode": 1,
                            "tic_manually": 1
                        },
                        {
                            "id": 9218,
                            "variable_pricing_id": 6302,
                            "item_of_charge_id": 19,
                            "price": 9000,
                            "is_deleted": 0,
                            "tic_id": 19,
                            "tic_short_name": "QTH Adicional Entre Ciudades",
                            "tic_description": "QTH Adicional Entre Ciudades",
                            "tic_long_name": "QTH Adicional Entre Ciudades",
                            "tic_mode": 1,
                            "tic_manually": 1
                        }
                    ]
                }
            ],
            "type_of_route": 0,
            "return_flag": true,
            "finalResult_return": {
                "id": 6302,
                "coverage_area_id": 1,
                "status": 1,
                "comments": "",
                "price": null,
                "price_list_id": 4823,
                "is_deleted": 0,
                "perKMChanges": 420,
                "waitTimeCharges": 0,
                "waitTimeInTrip": 0,
                "baseFare": 1500,
                "minimumFare": 3000,
                "time_of_trip_price": 80,
                "is_current": 1,
                "is_scheduled": 1,
                "category": 0,
                "type_of_trip": "P",
                "via_controlled_price": 0,
                "controlled_way_flag": 1,
                "branch": 1,
                "time_trip_shared_service": 35,
                "minimal_time_to_shared_booking_to_airport": 180,
                "travel_time_service_pick_up": 10,
                "tolerance_time_withdrawal_pickup": 10,
                "method_range_pickup": 1,
                "tolerance": 1,
                "fare_type": 0,
                "is_group_allowed": 0,
                "is_grouped_external": 0,
                "apply_estimated_distance_variable_fare": 1,
                "apply_charge_by_toll": 1,
                "collect_estimated_tag": 1,
                "price_list": [
                    {
                        "id": 7656,
                        "type_of_service_id": 23,
                        "variable_pricing_id": 6302,
                        "is_deleted": 0,
                        "type_of_service_service_name": "Encomienda Taxi",
                        "type_of_service_status": 1,
                        "type_of_service_max_limit": 100,
                        "is_current": 1,
                        "is_scheduled": 1,
                        "category": 0,
                        "show_time_range": 1,
                        "typeOfService": {
                            "name": "Encomienda Taxi",
                            "status": 1,
                            "max_limit": 100,
                            "show_time_range": 1
                        },
                        "itemOfCharge": [
                            {
                                "id": 9216,
                                "variable_pricing_id": 6302,
                                "item_of_charge_id": 4,
                                "price": 3000,
                                "is_deleted": 0,
                                "tic_id": 4,
                                "tic_short_name": "QTH AC",
                                "tic_description": "QTH Adicional Cercano: QTH adicional dentro de la misma comuna.",
                                "tic_long_name": "Domicilio Adicional misma Comuna",
                                "tic_mode": 1,
                                "tic_manually": 1
                            },
                            {
                                "id": 9217,
                                "variable_pricing_id": 6302,
                                "item_of_charge_id": 3,
                                "price": 5000,
                                "is_deleted": 0,
                                "tic_id": 3,
                                "tic_short_name": "QTH AL",
                                "tic_description": "QTH Adicional Lejano: QTH adicional dentro de otra comuna.",
                                "tic_long_name": "Domicilio Adicional otra Comuna",
                                "tic_mode": 1,
                                "tic_manually": 1
                            },
                            {
                                "id": 9218,
                                "variable_pricing_id": 6302,
                                "item_of_charge_id": 19,
                                "price": 9000,
                                "is_deleted": 0,
                                "tic_id": 19,
                                "tic_short_name": "QTH Adicional Entre Ciudades",
                                "tic_description": "QTH Adicional Entre Ciudades",
                                "tic_long_name": "QTH Adicional Entre Ciudades",
                                "tic_mode": 1,
                                "tic_manually": 1
                            }
                        ]
                    }
                ],
                "type_of_route": 0
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