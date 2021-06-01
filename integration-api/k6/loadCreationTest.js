import { sleep } from 'k6'
import http from 'k6/http'
import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.0.0/index.js";

export let options = {
  duration: '30s',
  vus: 2,
}
// k6 cloud filename.js
const url = 'https://dijrf9sdld.execute-api.us-east-1.amazonaws.com/dev/order'
const locationarray = [10034, 10029, 10071, 10095]

export default function() {
    const payload = JSON.stringify({
        service_order_id: uuidv4().substring(0,10),
        location_id: locationarray[Math.floor(Math.random()*locationarray.length)],
        last_mile: 0,
        quantity_boxes: 1,
        pickup_date: '2020-10-25',
        cuds: [
          {
            cud: uuidv4().substring(0,10),
            product_description: 'Set platos Rojos New Age',
            product_price: '18980',
            product_quantity: '2',
          },
          {
            cud: uuidv4().substring(0,10),
            product_description: 'Vasos rojos Old Age',
            product_price: '6990',
            product_quantity: '1',
          },
        ],
        buyer: {
          buyer_name: uuidv4().substring(0,10),
          buyer_phone_number: '987654321',
          buyer_email: 'reservas.ripley.transvip@gmail.com',
        },
        receiver: {
          receiver_rut: '24689658-5',
          receiver_name: uuidv4().substring(0,10),
          receiver_phone_number: '998754456645',
        },
        dropoff: {
          drop_address: 'Argomedo 60',
          drop_comuna: 'Santiago',
          drop_date: '2020-10-27',
        },
      })
    const params = {
        headers: {
          'x-api-key': '2geTXHDNjJ68Ae1cmPJJZ6BCgUf2lGsr3nIpd2CX',
          'Content-Type': 'application/json',
        },
      }
  const response = http.post(url,payload,params)

  sleep(1)
}