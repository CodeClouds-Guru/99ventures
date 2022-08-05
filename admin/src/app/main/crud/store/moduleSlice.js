import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import FuseUtils from '@fuse/utils';

export const getModuleFields = createAsyncThunk('crud/getModuleFields', async ({ module }) => {
    const response = await axios.get(`/${module}/add`);
    const data = await response.data.results;

    return data === undefined ? null : data;
});

export const getModule = createAsyncThunk('crud/getModule', async ({ module, moduleId }) => {
    const response = await axios.get(`/${module}/edit/${moduleId}`);
    const data = await response.data.results;

    return data === undefined ? null : data;
});


export const removeProduct = createAsyncThunk(
    'eCommerceApp/product/removeProduct',
    async (val, { dispatch, getState }) => {
        const { id } = getState().eCommerceApp.product;
        await axios.delete(`/api/ecommerce/products/${id}`);
        return id;
    }
);

export const saveModule = createAsyncThunk(
    'crud/saveModule',
    async (moduleData, { dispatch, getState, rejectWithValue }) => {
        const { module, ...restData } = moduleData
        try {
            const response = await axios.post(`${module}/save`, restData, {
                // Need to removed
                headers: {
                    "company_id": "1"
                }
            });
            const data = await response.data.results;
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const updateModule = createAsyncThunk(
    'crud/updateModule',
    async (moduleData, { dispatch, getState, rejectWithValue }) => {
        const { module, moduleId, ...restData } = moduleData;
        try {
            const response = await axios.post(`${module}/update/${moduleId}`, restData, {
                // Need to removed
                headers: {
                    "company_id": "1"
                }
            });
            const data = await response.data;
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }

    }
);

const initialState = {
    fields: {},
    data: {},
    errors: null
}

const moduleSlice = createSlice({
    name: 'crud/module',
    initialState: initialState,
    reducers: {
        resetModule: () => initialState,
    },
    extraReducers: {
        [getModule.fulfilled]: (state, action) => {
            state.data = action.payload.result;
            state.fields = action.payload.fields;
        },
        [saveModule.fulfilled]: (state, action) => {
            state.errors = null;
        },
        [saveModule.rejected]: (state, action) => {
            state.errors = action.payload.errors;
        },
        [updateModule.fulfilled]: (state, action) => {
            state.errors = null;
        },
        [updateModule.rejected]: (state, action) => {
            state.errors = action.payload.errors
        },
        [removeProduct.fulfilled]: (state, action) => null,
        [getModuleFields.fulfilled]: (state, action) => {
            state.fields = action.payload.fields
        }
    },
});

export const { newProduct, resetModule } = moduleSlice.actions;
export const selectModule = (state) => state.crud.module.data;

export default moduleSlice.reducer;
