import { userActions } from '../config/actions';

const defaultState = {
  isLoading: null,
  data: [],
  created: false,
  error: null
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case userActions.USERS_IS_LOADING:
      return {
        ...state,
        isLoading: true,
        data: state.data || false,
        created: state.created,
        error: null
      };
    case userActions.USERS_ERROR:
      return {
        ...state,
        isLoading: false,
        data: state.data || [],
        created: false,
        error: action.error
      };
    case userActions.USERS_NEW:
      return {
        ...state,
        isLoading: false,
        data: [...state.data],
        created: true,
        error: null
      };
    case userActions.USERS:
      return {
        ...state,
        isLoading: false,
        data: action.data,
        created: false,
        error: null
      };
    case userActions.USERS_RESET:
      return {
        ...state,
        isLoading: false,
        data: [],
        created: false,
        error: null
      };
    default:
      return state;
  }
};
