import { combineReducers } from '@reduxjs/toolkit';
import modules from './modulesSlice';
import module from './moduleSlice';

const reducer = combineReducers({
  modules,
  module
});

export default reducer;