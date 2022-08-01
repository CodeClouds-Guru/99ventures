import { combineReducers } from '@reduxjs/toolkit';
import modules from './modulesSlice';

const reducer = combineReducers({
  modules
});

export default reducer;