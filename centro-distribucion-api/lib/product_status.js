const productConfirmationStatus = [
  {
    code: 0,
    description: 'Por Confirmar',
  },
  {
    code: 1,
    description: 'Confirmado',
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


const productStatus = [
  // 1XX status set initially by client or retailer
  {
    code: 100,
    description: 'Creado',
    enlace: 6,
  },
  {
    code: 110,
    description: 'MODIFIED',
    enlace: 6,
  },
  {
    code: 190,
    description: 'Cancelado',
    enlace: 9,
  },
  // 2XX status set by OPL
  {
    code: 201,
    description: 'HANDED_TO_CD_TRANSPORT',
    enlace: 6,
  },
  {
    code: 210,
    description: 'En transito a CD',
    enlace: 6,
  },
  {
    code: 215,
    description: 'En CD',
    enlace: 6,
  },
  {
    code: 220,
    description: 'VERIFIED_ON_CD',
    enlace: 6,
  },
  {
    code: 230,
    description: 'Retornado a CD',
    enlace: 6,
  },
  {
    code: 240,
    description: 'Transito a Retail',
    enlace: 6,
  },
  {
    code: 250,
    description: 'Retornado a Retail',
    enlace: 6,
  },
  // 3XX status set by last mile interaction
  {
    code: 301,
    description: 'Entregado a Ultima milla',
    enlace: 6,
  },
  // XX Enlace default status
  {
    code: 6,
    description: 'Creado',
    enlace: 6,
  },
  {
    code: 7,
    description: 'Aceptado',
    enlace: 7,
  },
  {
    code: 9,
    description: 'Cancelado',
    enlace: 9,
  },
  {
    code: 2,
    description: 'Entregado',
    enlace: 2,
  },
  {
    code: 3,
    description: 'No Entregado',
    enlace: 3,
  },
];
const getProductStatus = (code) => {
  const pStatus = productStatus.find((e) => e.code === parseInt(code, 10));
  if (!pStatus) {
    return {
      code: '999',
      description: 'UNKNOWN_STATUS',
      enlace: code,
    };
  }
  return pStatus;
};
const getProductStatusFromEnlace = (code) => {
  const intCode = parseInt(code, 10);
  if (intCode === 6) return productStatus.find((e) => e.code === 100);
  if (intCode === 9) return productStatus.find((e) => e.code === 190);
  const newStatus = productStatus.find((e) => e.code === intCode);
  if (!newStatus) {
    return {
      code,
      description: 'UNKNOWN_STATUS',
      enlace: code,
    };
  }
  return newStatus;
};

const getProductConfirmationStatus = (code) => {
  const cStatus = productConfirmationStatus.find((e) => e.code === parseInt(code, 10));
  if (!cStatus) {
    return {
      code,
      description: 'UNKNOWN_STATUS',
    };
  }
  return cStatus;
};

module.exports = {
  getProductStatus,
  getProductStatusFromEnlace,
  getProductConfirmationStatus,
};
