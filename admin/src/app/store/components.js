import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import { showMessage } from 'app/store/fuse/messageSlice';
import axios from 'axios';

export const getComponentData = createAsyncThunk(
    'components/getComponentData',
    async (params, { dispatch }) => {
        const result = axios.post(jwtServiceConfig.getSingleComponent + '/' + params.module_id)
        .then(res => {
            if(res.data.results){
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
    'components/applyRevision',
    async (params, { dispatch }) => {        
        const result = axios.post(jwtServiceConfig.updateComponents + '/' + params.module_id, {rev_component_id: params.rev_component_id})
        .then(res => {
            dispatch(getComponentData({module_id: params.module_id}));
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
    component_data: {}
}

const componentSlice = createSlice({
    name: 'componentslice',
    initialState,
    reducers: {
        setRevisionData: (state, action) => {
            state.revisions_data = action.payload;
            state.revisions_count = 0;
        }
    },
    extraReducers: {
        [getComponentData.fulfilled]: (state, { payload }) => {
            if(payload.result) {
                state.component_data = payload.result
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
} = componentSlice.actions;

export default componentSlice.reducer;