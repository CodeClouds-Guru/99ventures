import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import jwtServiceConfig from '../auth/services/jwtService/jwtServiceConfig';
import { showMessage } from 'app/store/fuse/messageSlice';


export const confirmAccountPassword = createAsyncThunk(
    'user/confirmAccountPassword',
    async (params, {dispatch}) => {
        const result = await axios.post(jwtServiceConfig.confirmAccountCheck, params)
        .then(res => {
            if(res.status)
                return true;
            else 
                return false;
        })
        .catch(error => {
            dispatch(showMessage({ variant: 'error', message: error.response.data.errors }));
            return false;
        });
        return result;
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