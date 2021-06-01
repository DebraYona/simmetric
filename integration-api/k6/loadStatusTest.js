import { sleep } from 'k6'
import http from 'k6/http'
import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.0.0/index.js";

export let options = {
  duration: '1m',
  vus: 20,
}

const url = 'https://trvzaygnm9.execute-api.us-east-1.amazonaws.com/dev/product/status/21306979-2093-4f3b-a017-12f0e43d7e03'

export default function() {
    const params = {
        headers: {
          'x-api-key': 'OckJ3FrRHR8TufCUtz0JE28VqaZA6eok6EFcEWM8',
          'Content-Type': 'application/json',
        },
      }
  const response = http.get(url,params)

  sleep(1)
}