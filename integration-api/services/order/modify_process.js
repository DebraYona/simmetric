/* eslint-disable no-console */
const buyer = require('../../data/buyer');
const dropoff = require('../../data/dropoff');
const {
  getBooking,
  getRoute,
  cleanAddress,
  itemOfChargeTranslator,
  returnTransvipCD,
  dateConsolidationManager,
  enlaceConstantsGenerator
} = require('../../lib/enlace');
const { getGeocodingFromEndpoint } = require('../../lib/heremaps.js');
const order = require('../../data/order');
const { processError } = require('../../lib/error_handlers');
const status = require('../../data/status');
const receiver = require('../../data/receiver');
const product = require('../../data/product');
const pickup = require('../../data/pickup');
const location = require('../../data/location');
const { getProductStatus } = require('../../lib/product_status');

module.exports.handler = async (event) => {
  console.log('Starting update');
  const newBody = JSON.parse(event.Records[0].body);
  console.log(newBody);

  let originalOrder;
  let originalBuyer;
  let originalDropoff;
  let originalReceiver;
  let originalProducts;
  let originalPickup;

  const updatedOrder = {};
  let orderModified = false;
  // let recalculateRoute = false;

  try {
    const orderQuery = await order.getByServiceOrderId(newBody.service_order_id);
    console.log(orderQuery);
    originalOrder = { ...orderQuery };

    originalProducts = await product.getByOrderId(orderQuery.id);
    originalDropoff = await dropoff.getByOrderId(orderQuery.id);
    originalReceiver = await receiver.getByOrderId(orderQuery.id);
    originalBuyer = await buyer.getByOrderId(orderQuery.id);
    originalPickup = await pickup.getByOrderId(orderQuery.id);
    let locationQuery = await location.getById(originalOrder.location_id);

    if ('cuds' in newBody && newBody.cuds.length > 0) {
      console.log('Updating products');
      const promises = newBody.cuds.map((c) => {
        const exist = originalProducts.find((p) => p.identifier === c.cud);
        if (exist) {
          const payload = {
            status: c.cud_status,
            description: c.product_description,
            price: c.product_price,
            quantity: c.product_quantity,
            guide_number: c.guide_number,
          };
          if (c.guide_number) {
            payload.guide_number = c.guide_number;
          }
          return product.update(exist.id, payload);
        }
        return product.create({
          order_id: orderQuery.id,
          guide_number: c.guide_number || '',
          identifier: c.cud,
          sku: c.sku || '',
          status: getProductStatus('100').code,
          description: c.product_description || '',
          price: c.product_price || '0',
          quantity: c.product_quantity || 1,
        });
      });

      await Promise.all(promises);
    }

    // 1. Check what was changed from the order.
    if (newBody.location_id && newBody.location_id !== orderQuery.location_id) {
      console.log('Updating location id');
      console.log(
        `Update order ${orderQuery.service_order_id} location_id from ${orderQuery.location_id} to ${newBody.location_id}`
      );

      updatedOrder.location_id = newBody.location_id;
      // recalculateRoute = true;
    }

    if (newBody.type_of_charge && newBody.type_of_charge !== orderQuery.type_of_charge) {
      console.log('Updating location type_of_charge');
      console.log(
        `Update order ${orderQuery.service_order_id} type_of_charge from ${orderQuery.type_of_charge} to ${newBody.type_of_charge}`
      );
      updatedOrder.type_of_charge = newBody.type_of_charge;
    }

    const lastMile = orderQuery.last_mile === 1;

    if ('last_mile' in newBody && newBody.last_mile !== lastMile) {
      console.log('Updating location last_mile');
      console.log(
        `Update order ${orderQuery.service_order_id} last_mile from ${orderQuery.last_mile} to ${newBody.last_mile}`
      );
      if (newBody.last_mile) {
        updatedOrder.last_mile = 1;
      } else {
        updatedOrder.last_mile = 0;
      }

      // recalculateRoute = true;
    }

    if ('buyer' in newBody && Object.keys(newBody.buyer).length > 0) {
      console.log('Updating location buyer');
      const buyerQuery = await buyer.getByOrderId(orderQuery.id);
      const newBuyer = {
        name: newBody.buyer.buyer_name || buyerQuery.name,
        phone_number: newBody.buyer.buyer_phone_number || buyerQuery.phone_number,
        email: newBody.buyer.buyer_email || buyerQuery.email,
        rut: newBody.buyer.buyer_rut || buyerQuery.rut,
      };

      await buyer.update(buyerQuery.id, newBuyer);
    }

    if ('receiver' in newBody && Object.keys(newBody.receiver).length > 0) {
      console.log('Updating location receiver');
      const receiverQuery = await receiver.getByOrderId(orderQuery.id);
      const newReceiver = {
        name: newBody.receiver.receiver_name || receiverQuery.name,
        phone_number: newBody.receiver.receiver_phone_number || receiverQuery.phone_number,
        email: newBody.receiver.receiver_email || receiverQuery.email,
        rut: newBody.receiver.receiver_rut || receiverQuery.rut,
      };

      await receiver.update(receiverQuery.id, newReceiver);
    }

    if ('dropoff' in newBody && Object.keys(newBody.dropoff).length > 0) {
      console.log('Updating location dropoff');
      const dropoffQuery = await dropoff.getByOrderId(orderQuery.id);
      const newDropoff = {
        address: newBody.dropoff.drop_address || dropoffQuery.address,
        address_2: newBody.dropoff.drop_address_line_2 || dropoffQuery.address_2,
        comuna: newBody.dropoff.drop_comuna || dropoffQuery.comuna,
        observations: newBody.dropoff.drop_observations || dropoffQuery.observations,
        time: `${newBody.dropoff.drop_date} 23:00:00` || dropoffQuery.time,
      };

      updatedOrder.dropoff = newDropoff;

      const deliveryAddress = `${newDropoff.address}, ${newDropoff.comuna}, Chile`;
      console.log(deliveryAddress);
      let coordinates = {};
      try {
        coordinates = await getGeocodingFromEndpoint(deliveryAddress);
      } catch (catchError) {
        // generate original error, don't finish
        const originalError = processError(
          1300,
          { error: catchError.message, response: 'original attempt' },
          orderQuery.service_order_id
        );
        // retry with new address
        let retryCoordinates;
        const newAddress = cleanAddress(newDropoff.address);
        const retryAddress = `${newAddress.address}, ${newDropoff.comuna}, Chile`;
        console.log(newAddress);
        console.log(retryAddress);
        try {
          retryCoordinates = await getGeocodingFromEndpoint(retryAddress);
        } catch (retryCatchError) {
          // if retry failed, generate retry error and return with the original one
          processError(
            1300,
            { error: retryCatchError.message, response: 'cleaned attempt' },
            orderQuery.service_order_id
          );
          return originalError;
        }
        // if retry worked, change address data and continue
        newDropoff.address = newAddress.address;
        newDropoff.address_2 += newAddress.address_line_2;
        coordinates = retryCoordinates;
      }

      const [dropLat, dropLong] = coordinates;

      newDropoff.latitude = dropLat;
      newDropoff.longitude = dropLong;

      await dropoff.update(dropoffQuery.id, newDropoff);
      // recalculateRoute = true;
    }
    if (
      ('location_id' in newBody && originalOrder.location_id !== newBody.location_id) ||
      'pickup_date' in newBody ||
      'last_mile' in newBody
    ) {
      const pickupQuery = await pickup.getByOrderId(orderQuery.id);
      locationQuery = await location.getById(newBody.location_id || originalOrder.location_id);
      const newPickup = {
        address: locationQuery.address,
        address_2: locationQuery.address_2,
        comuna: locationQuery.comuna,
        latitude: locationQuery.latitude,
        longitude: locationQuery.longitude,
      };
      let tempPickupTime = locationQuery.pickup_time;
      if ('last_mile' in newBody && newBody.last_mile === 0) {
        // change to CD if it is not a last mile delivery
        const transvipCD = returnTransvipCD();
        newPickup.address = transvipCD.address;
        newPickup.comuna = transvipCD.comuna;
        newPickup.latitude = transvipCD.latitude;
        newPickup.longitude = transvipCD.longitude;
        tempPickupTime = transvipCD.pickup_time;
      }
      if ('pickup_date' in newBody) {
        newPickup.time = `${newBody.pickup_date}T${tempPickupTime}.000Z`;
      }
      await pickup.update(pickupQuery.id, newPickup);
    }

    const dropoffQuery = await dropoff.getByOrderId(orderQuery.id);
    const productsQuery = await product.getByOrderId(orderQuery.id);
    const receiverQuery = await receiver.getByOrderId(orderQuery.id);
    const buyerQuery = await buyer.getByOrderId(orderQuery.id);
    const pickupQuery = await pickup.getByOrderId(orderQuery.id);
    // create cud object:
    const cuds = [];
    productsQuery.forEach((element) => {
      const newCud = {
        guide_number: element.guide_number,
        cud_id: element.identifier,
        cud_status: getProductStatus(element.status).enlace,
        product_description: element.description,
        product_price: element.price,
        product_quantity: element.quantity,
      };
      cuds.push(newCud);
    });
    console.log(cuds);
    // if (recalculateRoute) {
    console.log('Recalculating route');
    const dropQuery = await dropoff.getByOrderId(orderQuery.id);
    const locationId = updatedOrder.location_id || orderQuery.location_id;
    const isLastMile = 'last_mile' in updatedOrder ? updatedOrder.last_mile : orderQuery.last_mile;
    const route = await getRoute(
      orderQuery.service_order_id,
      locationId,
      isLastMile,
      dropQuery.latitude,
      dropQuery.longitude,
      new Date(pickupQuery.time).toISOString(),
      new Date(dropoffQuery.time).toISOString()
    );
    let itemOfChargeModified;
    try {
      itemOfChargeModified = itemOfChargeTranslator(route.item_of_charges);
    } catch (catchError) {
      return processError(
        2001,
        { error: catchError.message, response: '' },
        route.service_order_id
      );
    }
    console.log(itemOfChargeModified);
    // Correct data from designed flow
    const correctedDates = dateConsolidationManager(
      route.start_time,
      route.end_time,
      isLastMile
    );
    console.log(correctedDates);
  const constantsContract = await enlaceConstantsGenerator(
    isLastMile,
    route.location
  );
  console.log(constantsContract);
    const bookingPayload = {
      timezone: 180, // Should be dynamic
      contract_id:
        process.env.STAGE === 'dev' || process.env.STAGE === 'qa'
          ? '68'
          : constantsContract.contract_id,
      booking_type: 0, // HOTFIX TO WORK shared booking
      service_order: [{ service_order_id: orderQuery.service_order_id, cud: cuds }],
      quantity_boxes: originalOrder.quantity_boxes,
      booking_for: 1, // siempre para terceros
      customer_phone_number: buyerQuery.phone_number,
      customer_email: buyerQuery.email, // HOTFIX 2, 'reservas.ripley.transvip@gmail.com',// HOTFIX buyerQuery.email,
      sender_rut: buyerQuery.rut || '',
      passenger_rut: receiverQuery.rut,
      full_name: receiverQuery.name,
      phone_number: receiverQuery.phone_number || '',
      email: receiverQuery.email || '',
      route_id: route.id, // awaiting validation
      pickup_lat: route.location.latitude,
      pickup_long: route.location.longitude,
      location_id: updatedOrder.location_id || orderQuery.location_id,
      location_name: route.location.name,
      pickup_location: `${route.location.address}, ${route.location.comuna}`,
      drop_lat: dropoffQuery.latitude.toString(),
      drop_long: dropoffQuery.longitude.toString(),
      drop_location: `${dropoffQuery.address} - ${dropoffQuery.address_2} - ${dropoffQuery.comuna}`,
      location_time_pickup: correctedDates.pickupTime, // HOTFIX locationQuery['pickup_time'],
      travel_distance_route: route.travel_distance_route,
      booking_eta: route.booking_eta,
      drop_off_time: correctedDates.dropoffTime, // HOTFIX body['dropoff']['drop_time'], // fecha de entrega en dia
      observations: dropoffQuery.observations,
      service_type: constantsContract.service_type,
      type_of_charge: updatedOrder.type_of_charge || orderQuery.type_of_charge,
      created_by_admin: 8, // From API
      payment_status: 1, // Bookings are always paid
      payment_method: constantsContract.payment_method,
      estimated_payment_cost: 0, // 0 for this contract
      is_routing: 0, // No routing
      time: [correctedDates.pickupTime], // HOTFIX [locationQuery['pickuptime']],
      transport_type_id: 0, // From service types table
      schedule_ride: 1, // scheduled
      round_trip: 0, // not a round trip
      route_type: 0, // fixed route
      type_of_agreement: 1, // enterprise
      is_wait_time_included: 0, // no waiting time
      travel_time: '', // UNKNOWN, static podria ser eta en minutos redondeado
      tolerance_time: route.tolerance_time,
      estimated_toll_price: 0, // en encomienda no se cobran tags
      apply_charge_by_toll: route.apply_charge_by_toll,
      apply_estimated_distance_variable_fare: route.apply_estimated_distance_variable_fare,
      return_date_time: '', // UNKNOWN no deberia ir
      promo_type: 0,
      discount_type: 0,
      discount_amount: 0,
      is_item_of_charges: route.is_item_of_charges,
      item_of_charges: itemOfChargeModified,
      // from clicklabs
      reaccurringTimeZone: [], // UNKNOWN, 180 240 ?
      profile: 1, // corporate is 1
      number_of_passangers: 1, // was mispelled in example postman
      job_pickup_comuna: route.location.comuna,
      job_dropoff_comuna: dropoff.comuna,
      return_booking_eta: 0, // validar pero es 0
      heremaps_toll_details: {}, // UNKNOWN // TO_DO toll-cost-estimated-route
      heremaps_estimated_tolls: 0, // Debe ser 0, validar
      item_of_charge_tolls_price: 0, // Debe ser 0, validar
      reaccurring: 0, // UNKNOWN
      auth_required: 0, // UNKNOWN
      airport: 0,
      route_id_return: 4644, // UNKNOWN
      route_type_return: 1, // UNKNOWN
      estimated_payment_cost_return: 0, // UNKNOWN
      is_POS_booking: 0,
      is_adjusting_discounted_amount: 0,
    };
    let jobId;
    try {
      jobId = await getBooking(bookingPayload, orderQuery.service_order_id);
    } catch (catchError) {
      let errorBody;
    if (catchError.code === 'ECONNABORTED'){
      errorBody = { error: catchError.message, response: catchError.code}
    }else{
      errorBody = { error: catchError.message, response: catchError.response.data}
    }
      return processError(
        2100,
        errorBody,
        orderQuery.service_order_id
      );
    }
    updatedOrder.jobId = jobId;
    const pickupData = {
      order_id: orderQuery.id,
      pickup_address: route.location.address,
      pickup_address_line_2: route.location.address_2,
      pickup_comuna: route.location.comuna,
      pickup_observations: '',
      latitude: route.location.latitude,
      longitude: route.location.longitude,
      pickup_time: route.location.pickup_time,
    };

    await pickup.update(orderQuery.id, pickupData);
    // }

    // If there were any changes on the order we update it.
    if (Object.keys(updatedOrder).length > 0) {
      await order.update(orderQuery.id, updatedOrder);
      orderModified = true;
    }
    // HOTFIX: CUD cancel comes with no parameters, is successful even if no updates are done
    orderModified = true;
    if (orderModified) {
      await status.create({
        service_order_id: newBody.service_order_id,
        status: 'ORDER_UPDATED',
        message: `The order with service order id: ${newBody.service_order_id} was updated.`,
        data: '',
      });
    } else {
      await status.create({
        service_order_id: newBody.service_order_id,
        status: 'ORDER_NOT_UPDATED',
        message: `The parameters were indentical to the current order parameters.`,
        data: '',
      });
    }

    return 'done';
  } catch (error) {
    // Rollback
    console.log('Rollback');
    console.error(error);

    try {
      await order.update(originalOrder.id, originalOrder);
      await pickup.update(originalOrder.id, originalPickup);
      await dropoff.update(originalOrder.id, originalDropoff);
      await receiver.update(originalOrder.id, originalReceiver);
      await buyer.update(originalOrder.id, originalBuyer);
      await product.updateBatch(originalProducts);
      await status.create({
        service_order_id: newBody.service_order_id,
        status: 'ORDER_NOT_UPDATED',
        message: `There was a problem updating the order with service order id: ${newBody.service_order_id}. Please verify your parameters.`,
        data: '',
      });
    } catch (err) {
      console.log(err);
      return 'done';
    }
    return 'done';
  }
};
