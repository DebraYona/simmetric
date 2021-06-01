import { productActions } from '../config/actions';

const defaultState = {
  isLoading: null,
  data: [],
  currentProduct: null,
  error: null,
  message: null
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case productActions.PRODUCTS_IS_LOADING:
      return {
        ...state,
        isLoading: true,
        data: state.data || false,
        error: null
      };
    case productActions.PRODUCTS_ERROR:
      return {
        ...state,
        isLoading: false,
        data: state.data || [],
        error: action.error
      };
    case productActions.PRODUCTS_NEW:
      return {
        ...state,
        isLoading: false,
        data: [action.data, ...state.data],
        error: null
      };
    case productActions.PRODUCTS:
      return {
        ...state,
        isLoading: false,
        data: action.data,
        error: null
      };
    case productActions.PRODUCTS_RESET:
      return {
        ...state,
        isLoading: false,
        data: [],
        error: null
      };
    case productActions.SELECT_PRODUCT:
      return {
        ...state,
        isLoading: false,
        data: state.data || [],
        currentProduct: action.data,
        error: null
      };
    case productActions.SELECT_PRODUCT_RESET:
      return {
        ...state,
        isLoading: false,
        data: state.data || [],
        currentProduct: null,
        error: null
      };
    case productActions.PRODUCT_POSTCREATE:
      return {
        ...state,
        isLoading: false,
        data: state.data || [],
        currentProduct: null,
        error: null
      };
    default:
      return state;
  }
};
