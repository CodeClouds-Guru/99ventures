import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const getUsers = createAsyncThunk('crud/getUsers', async () => {
  const response = await axios.get('/users');
  const data = await response.data.results.result.data;

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
  users:[]
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
      state.users = action.payload
    },
    // [removeOrders.fulfilled]: (state, action) => ordersAdapter.removeMany(state, action.payload),
  },
});

export const { setUsersSearchText } = usersSlice.actions;

export const selectUsersSearchText = ({crud}) => crud.users.searchText;


export default usersSlice.reducer;
