import { combineReducers } from '@reduxjs/toolkit';
import users from './userSlice';

const reducer = combineReducers({
  users
});

export default reducer;