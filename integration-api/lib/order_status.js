const orderConfirmationStatus = [
  {
    code: 0,
    description: 'Por Confirmar',
  },
  {
    code: 1,
    description: 'Confirmar',
  },
  {
    code: 2,
    description: 'Falla en confirmación',
  },
  {
    code: 3,
    description: 'Sin Reserva',
  },
  {
    code: 4,
    description: 'Falla definitiva',
  },
];


const orderStatus = [
  {
    code: 100,
    description: 'CREATED',
    enlace: 6,
  },
  {
    code: 190,
    description: 'CANCELLED',
    enlace: 9,
  },
];
const getOrderStatus = (code) => {
  const pStatus = orderStatus.find((e) => e.code === parseInt(code, 10));
  if (!pStatus) {
    return {
      code,
      description: 'UNKNOWN_STATUS',
    };
  }
  return pStatus;
};
const getOrderStatusFromEnlace = (code) => {
  const intCode = parseInt(code, 10);
  if (intCode === 6) return orderStatus.find((e) => e.code === 100);
  if (intCode === 9) return orderStatus.find((e) => e.code === 190);
  return {
    code,
    description: 'UNKNOWN_STATUS',
  };
};

const getOrderConfirmationStatus = (code) => {
  const cStatus = orderConfirmationStatus.find((e) => e.code === parseInt(code, 10));
  if (!cStatus) {
    return {
      code,
      description: 'UNKNOWN_STATUS',
    };
  }
  return cStatus;
};

module.exports = {
  getOrderStatus,
  getOrderStatusFromEnlace,
  getOrderConfirmationStatus
};
