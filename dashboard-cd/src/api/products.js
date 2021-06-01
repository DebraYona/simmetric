/* eslint-disable import/prefer-default-export */
import { Auth, API } from 'aws-amplify';

export const createSource = async (name, description) => {
  const token = (await Auth.currentSession()).getIdToken().getJwtToken();
  try {
    const result = await API.post('tv', 'sources', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        name,
        description
      }
    });

    return result.data.sourceId;
  } catch (e) {
    return false;
  }
};

export const getProducts = async () => {
  const token = (await Auth.currentSession()).getIdToken().getJwtToken();
  const result = await API.get('tv', 'packages/travel', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return result.data;
};

/**
 * Get all products by status
 * @param {*} status Status to find products
 * @param {*} filter Object filter to query
 * products for example: { dateFrom: value, dateUntil: value }
 */
export const getProductsByStatus = async (status, filter) => {
  const token = (await Auth.currentSession()).getIdToken().getJwtToken();

  let url = `packages/travel?status=${status}`;

  let filterFields = [];

  if (filter) {
    filterFields = Object.keys(filter);
  }

  if (filterFields.length) {
    let urlFiltered = '';
    filterFields.forEach(item => {
      urlFiltered = `${urlFiltered}&${item}='${filter[item]}'`;
    });
    url = `${url}${urlFiltered}`;
  }

  const result = await API.get('tv', url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return result.data;
};

export const getProductsNoConfirmed = async (status, filter) => {
  const token = (await Auth.currentSession()).getIdToken().getJwtToken();
  let url = `packages?status=${status}`;

  let filterFields = [];

  if (filter) {
    filterFields = Object.keys(filter);
  }

  if (filterFields.length) {
    let urlFiltered = '';
    filterFields.forEach(item => {
      urlFiltered = `${urlFiltered}&${item}='${filter[item]}'`;
    });
    url = `${url}${urlFiltered}`;
  }
  const result = await API.get('tv', url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return result.data;
};

export const updateProduct = async body => {
  try {
    const token = (await Auth.currentSession()).getIdToken().getJwtToken();
    const result = await API.post('tv', 'order/update', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      body
    });
    return result.data;
  } catch(error) {
    return error.response.data;
  }
};
export const productPostcreate = async body => {
  try {
    const token = (await Auth.currentSession()).getIdToken().getJwtToken();
    const result = await API.post('tv', 'product/postcreate', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      body
    });
    console.log(result);
    return result;
  } catch(error) {
    return error.response.data;
  }
};

/**
 * Set status in product by cud
 * @param {*} cud Cud to find
 * @param {*} status Status to update
 */
export const setProductByStatus = async (cud, status) => {
  try {
    const token = (await Auth.currentSession()).getIdToken().getJwtToken();
    const result = await API.put('tv', `product/cud/${cud}/status/${status}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return result.data;
  } catch (error) {
    return error.response.data;
  }

};
