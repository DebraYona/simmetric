import { combineReducers } from 'redux';
import products from './product-reducer';
import users from './user-reducer';
import reservations from './reservation-reducer';

export default combineReducers({ products, users, reservations });
