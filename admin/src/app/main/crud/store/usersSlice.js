import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const getUsers = createAsyncThunk('crud/getUsers', async (params) => {

  let apiURL = '/users?v=1';
  if(params){
    let queryString = Object.keys(params).map(key => key + '=' + params[key]).join('&');
    apiURL +='&'+queryString
  }

  const response = await axios.get(apiURL);
  const data = await response.data.results;

  return data;
});

// export const removeOrders = createAsyncThunk(
//   'eCommerceApp/orders/removeOrders',
//   async (orderIds, { dispatch, getState }) => {
//     await axios.delete('/api/ecommerce/orders', { data: orderIds });

//     return orderIds;
//   }
// );

const usersAdapter = createEntityAdapter({});

export const { selectAll: selectUsers, selectById: selectUserById } = usersAdapter.getSelectors(
  (state) => state.crud.users
);
const initialState = {
  searchText: '',
  users:[],
  fields:null,
  pages:1,
  totalRecords:0
}

const usersSlice = createSlice({
  name: 'app/users',
  initialState,
  reducers: {
    setUsersSearchText: {
      reducer: (state, action) => {
        state.searchText = action.payload;
      },
      prepare: (event) => ({ payload: event.target.value || '' }),
    },
  },
  extraReducers: {
    [getUsers.fulfilled]: (state, action) =>{
      state.users = action.payload.result.data;
      state.fields = action.payload.fields;
      state.pages = action.payload.result.pages;
      state.totalRecords = action.payload.result.total;
    },
    // [removeOrders.fulfilled]: (state, action) => ordersAdapter.removeMany(state, action.payload),
  },
});

export const { setUsersSearchText } = usersSlice.actions;

// export const selectUsersSearchText = ({crud}) => crud.users.searchText;


export default usersSlice.reducer;
