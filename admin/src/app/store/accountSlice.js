import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const confirmAccountPassword = createAsyncThunk(
    'user/confirmAccountPassword',
    async () => {
      console.log('confirm');
      return true;
    }
);

const initialState = {
    confirm_account: false
}

const accountSlice = createSlice({
    name: 'account',
    initialState,
    extraReducers: {
        [confirmAccountPassword.fulfilled]: (state, action) => {
            state.confirm_account = action.payload
        }
    }
});

export default accountSlice.reducer