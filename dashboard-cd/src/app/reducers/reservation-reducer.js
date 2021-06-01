import { reservationActions } from '../config/actions';

const defaultState = {
  isLoading: null,
  data: [],
  error: null
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case reservationActions.RESERVATIONS_IS_LOADING:
      return {
        ...state,
        isLoading: true,
        data: state.data || false,
        error: null
      };
    case reservationActions.RESERVATIONS_ERROR:
      return {
        ...state,
        isLoading: false,
        data: state.data || [],
        error: action.error
      };
    case reservationActions.RESERVATIONS_NEW:
      return {
        ...state,
        isLoading: false,
        data: [action.data, ...state.data],
        error: null
      };
    case reservationActions.RESERVATIONS:
      return {
        ...state,
        isLoading: false,
        data: action.data,
        error: null
      };
    case reservationActions.RESERVATIONS_RESET:
      return {
        ...state,
        isLoading: false,
        data: [],
        error: null
      };
    default:
      return state;
  }
};
