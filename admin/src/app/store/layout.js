import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import { showMessage } from 'app/store/fuse/messageSlice';
import axios from 'axios';

export const getLayout = createAsyncThunk(
    'layout/getLayout',
    async (params, { dispatch }) => {
        const result = axios.post(jwtServiceConfig.getSingleLayout + '/' + params.module_id)
        .then(res => {
            if(res.data.results.result){
                return res.data.results;                
            }
        })
        .catch(errors => {
            console.log(errors);
            dispatch(showMessage({ variant: 'error', message: error.response.data.errors }));
        });

        return result;
    }
);

export const applyRevision = createAsyncThunk(
    'layout/updateLayout',
    async (params, { dispatch }) => {
        
        const result = axios.post(jwtServiceConfig.updateLayouts + '/' + params.module_id, {rev_layout_id: params.rev_layout_id})
        .then(res => {
            dispatch(getLayout({module_id: params.module_id}));
            dispatch(showMessage({ variant: 'success', message: res.data.results.message }));
            return res.data.results;
        })
        .catch(errors => {
            console.log(errors);
            dispatch(showMessage({ variant: 'error', message: error.response.data.errors }));
        });

        return result;
    }
)

const initialState = {
    revisions_data: [],
    revisions_count: 0,
    layout_data: {}
}

const layoutSlice = createSlice({
    name: 'layoutslice',
    initialState,
    reducers: {
        setRevisionData: (state, action) => {
            state.revisions_data = action.payload;
            state.revisions_count = 0;
        }
    },
    extraReducers: {
        [getLayout.fulfilled]: (state, { payload }) => {
            if(payload.result) {
                state.layout_data = payload.result
            }
            if(payload.revisions) {
                state.revisions_data = payload.revisions.rows
                state.revisions_count = payload.revisions.count
            }
        }
    }
});

export const {
    setRevisionData
} = layoutSlice.actions;

export default layoutSlice.reducer;