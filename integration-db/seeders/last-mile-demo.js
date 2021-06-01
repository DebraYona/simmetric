const faker = require("faker");
const axios = require("axios");

Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)];
};

const statusCd = [
  "pickup_pending",
  "pickup_transit",
  "pickup_finished",
  "warehouse_verified",
  "returned_pending",
  "returned_pickup",
  "returned_warehouse",
];

const comunas = [
  "Santiago",
  "Conchalí",
  "Huechuraba",
  "Independencia",
  "Quilicura",
  "Recoleta",
  "Renca",
  "Las Condes",
  "Lo Barnechea",
  "Providencia",
  "Vitacura",
  "La Reina",
  "Macul",
  "Ñuñoa",
  "Peñalolén",
  "La Florida",
  "La Granja",
  "El Bosque",
  "La Cisterna",
  "La Pintana",
  "San Ramón",
  "Lo Espejo",
  "Pedro Aguirre Cerda",
  "San Joaquín",
  "San Miguel",
  "Cerrillos",
  "Estación Central",
  "Maipú",
  "Cerro Navia",
  "Lo Prado",
  "Pudahuel",
  "Quinta Normal",
];

const createOrder = async (number = 1) => {
  const options = {
    method: "post",
    url: "http://localhost:4000/dev/order/demo",
    headers: { "x-api-key": "xyZsrtut3157mHrRyFnBGyySmQw2Hjt33yQ85466" },
  };

  const fakeOrders = [];
  for (let i = 0; i <= number; i++) {
    const order = {
      service_order_id: `DEMO-TEST-00${i}`,
      location_id: 10012,
      type_of_charge: "Non Refrigerated",
      last_mile: 0,
      quantity_boxes: 1,
      pickup_date: "2020-08-19",
      cuds: [
        {
          guide_number: "",
          cud: faker.finance.account(),
          product_description: faker.commerce.productName(),
          product_price: faker.random.number(100000).toString(),
          product_quantity: faker.random.number(10),
          cd_status: statusCd.sample(),
        },
        {
          guide_number: "",
          cud: faker.finance.account(),
          product_description: faker.commerce.productName(),
          product_price: faker.random.number(100000).toString(),
          product_quantity: faker.random.number(10),
          cd_status: statusCd.sample(),
        },
        {
          guide_number: "",
          cud: faker.finance.account(),
          product_description: faker.commerce.productName(),
          product_price: faker.random.number(100000).toString(),
          product_quantity: faker.random.number(10),
          cd_status: statusCd.sample(),
        },
        {
          guide_number: "",
          cud: faker.finance.account(),
          product_description: faker.commerce.productName(),
          product_price: faker.random.number(100000).toString(),
          product_quantity: faker.random.number(10),
          cd_status: statusCd.sample(),
        },
        {
          guide_number: "",
          cud: faker.finance.account(),
          product_description: faker.commerce.productName(),
          product_price: faker.random.number(100000).toString(),
          product_quantity: faker.random.number(10),
          cd_status: statusCd.sample(),
        },
      ],
      buyer: {
        buyer_name: faker.name.findName(),
        buyer_phone_number: faker.phone.phoneNumber(),
        buyer_email: "reservas.ripley.transvip@gmail.com",
        buyer_rut: "11111111-1",
      },
      receiver: {
        receiver_rut: "24689658-5",
        receiver_name: faker.name.findName(),
        receiver_phone_number: faker.phone.phoneNumber(),
        receiver_email: faker.internet.email(),
      },
      dropoff: {
        drop_address: "Av. Andres Bello 2425",
        drop_address_line_2: "Depto 13",
        drop_comuna: comunas.sample(),
        drop_observations: "Tocar la puerta, el citofono no funciona",
        drop_date: "2020-08-20",
      },
    };
    fakeOrders.push(order);
  }

  const requests = fakeOrders.map((o) => {
    options.data = o;
    return axios(options);
  });
  await Promise.all(requests);
  return fakeOrders;
};

createOrder(99);
