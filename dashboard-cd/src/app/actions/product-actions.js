/* eslint-disable import/prefer-default-export */
import { productActions } from '../config/actions';
import {
  getProducts,
  getProductsByStatus,
  getProductsNoConfirmed,
  updateProduct,
  setProductByStatus,
  productPostcreate
} from '../../api/products';

function productIsLoading() {
  return {
    type: productActions.PRODUCTS_IS_LOADING
  };
}

function productError(e) {
  return {
    type: productActions.PRODUCTS_ERROR,
    error: e
  };
}

function productSet(products) {
  return {
    type: productActions.PRODUCTS,
    data: products
  };
}

function productUpdate(currentProduct) {
  return {
    type: productActions.SELECT_PRODUCT,
    currentProduct
  };
}

function productSuccess(currentProduct) {
  return {
    type: productActions.PRODUCT_SUCCESS,
    currentProduct
  };
}

function productFailed(message) {
  return {
    type: productActions.SELECT_PRODUCT_RESET,
    message
  };
}

function productPostCreate(message) {
  return {
    type: productActions.PRODUCT_POSTCREATE,
    message
  };
}
// function newProductAdd(product) {
//   return {
//     type: productActions.PRODUCTS_NEW,
//     data: source
//   };
// }

/**
 * Handle a new message arriving. Cognito identity id is parsed from topic. If user is cached,
 * build message immediately. Otherwise, query API for user information based on identity id.
 *
 * @param {string} message - the message
 * @param {string} topic - the topic of the form room/public/+/cognitoId
 */
// export const newSource = (name, description) => {
//   return async dispatch => {
//     console.log('new source');
//     dispatch(sourceIsLoading());
//     try {
//       const sourceId = await createSource(name, description);
//       if (sourceId) {
//         dispatch(newSourceAdd({ name, description, sourceId }));
//       } else {
//         dispatch(sourceError('Could not create source'));
//       }
//     } catch (error) {
//       dispatch(sourceError(error));
//     }
//   };
// };

export const fetchProducts = () => {
  return async dispatch => {
    dispatch(productIsLoading());
    try {
      const products = await getProducts();
      dispatch(productSet(products));
    } catch (error) {
      dispatch(productError(error));
    }
  };
};

/**
 * Fetch all products by specific status
 * @param {*} status Status to find products
 * @param {*} filter Object filter to query
 */
export const fetchProductsByStatus = (status, filter) => {
  return async dispatch => {
    dispatch(productIsLoading());
    try {
      const products = await getProductsByStatus(status, filter);
      dispatch(productSet(products));
    } catch (error) {
      dispatch(productError(error));
    }
  };
};

/**
 * Fetch all products by specific status
 * @param {*} status Status to find products
 */
export const fetchProductsNoConfirmed = (status, filter) => {
  return async dispatch => {
    dispatch(productIsLoading());
    try {
      const products = await getProductsNoConfirmed(status, filter);
      const filterProducts = products.filter(p => p.confirmed_status !== 1);
      dispatch(productSet(filterProducts));
    } catch (error) {
      dispatch(productError(error));
    }
  };
};

export const fetchupdateProduct = body => {
  return async dispatch => {
    dispatch(productUpdate(body));
    try {
      const result = await updateProduct(body);
      console.log(result);
      console.log(body);
      if (result.statusCode === 400) {
        dispatch(productFailed('error'));
        return false;
      }
      dispatch(productSuccess(result));
      return true;
    } catch (error) {
      console.log(error);
      dispatch(productFailed(error.message));
    }
  };
};

/**
 * Set status in product by cud
 * @param {*} cud Cud of the product to set status
 * @param {*} status Status to set
 */
export const setProductStatus = (cud, status) => {
  return async dispatch => {
    dispatch(productIsLoading());
    try {
      const products = await setProductByStatus(cud, status);
      if (products && products.statusCode !== 200) {
        dispatch(productError(products));
        return false;
      }
      dispatch(productSet(products));
      return true;
    } catch (error) {
      dispatch(productError(error));
      return false;
    }
  };
};

export const fetchProductPostcreate = body => {
  return async dispatch => {
    dispatch(productIsLoading());
    try {
      const result = await productPostcreate(body);
      console.log(result);
      if (result.statusCode === 400) {
        dispatch(productFailed(result));
        return false;
      }
      dispatch(productPostCreate('agregados a la  cola de postcrate'));
      return true;
    } catch (error) {
      console.log(error);
      dispatch(productFailed(error.message));
      return false;
    }
  };
};
