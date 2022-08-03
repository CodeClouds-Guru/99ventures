import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const getModules = createAsyncThunk('crud/getModules', async (params) => {
  let module = (params && params.module) ?? 'users'
  let apiURL = `${module}/?v=1`;
  if(params){
    let queryString = Object.keys(params).map(key => key + '=' + params[key]).join('&');
    apiURL +='&'+queryString
  }

  const response = await axios.get(apiURL);
  const data = await response.data.results;

  return data;
});

export const removeModules = createAsyncThunk(
  'crud/removeModules',
  async (params, { dispatch, getState }) => {
    const {module,orderIds} = params
    await axios.delete(`${module}/delete`, { data: {orderIds} });

    return orderIds;
  }
);

const usersAdapter = createEntityAdapter({});

export const { selectAll: selectUsers, selectById: selectUserById } = usersAdapter.getSelectors(
  (state) => state.crud.users
);
const initialState = {
  searchText: '',
  data:[],
  fields:null,
  pages:1,
  totalRecords:0,
}

const modulesSlice = createSlice({
  name: 'app/modules',
  initialState,
  reducers: {
    setModulesSearchText: {
      reducer: (state, action) => {
        state.searchText = action.payload;
      },
      prepare: (event) => ({ payload: event.target.value || '' }),
    },
    resetModule(state){
      state.searchText = '';
    }
  },
  extraReducers: {
    [getModules.fulfilled]: (state, action) =>{
      state.data = action.payload.result.data;
      state.fields = action.payload.fields;
      state.pages = action.payload.result.pages;
      state.totalRecords = action.payload.result.total;
    },
    // [removeOrders.fulfilled]: (state, action) => ordersAdapter.removeMany(state, action.payload),
  },
});

export const { setModulesSearchText,resetModule } = modulesSlice.actions;

export const selectModulesSearchText = ({crud}) => crud.modules.searchText;


export default modulesSlice.reducer;
