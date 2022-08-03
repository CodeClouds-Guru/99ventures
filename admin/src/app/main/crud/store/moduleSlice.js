import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import FuseUtils from '@fuse/utils';

export const getModuleFields = createAsyncThunk('crud/getModuleFields', async ({ module }) => {
    const response = await axios.get(`/${module}/fields`);
    const data = await response.data.results;

    return data === undefined ? null : data;
});

export const getModule = createAsyncThunk('crud/getModule', async ({ module, moduleId }) => {
    const response = await axios.get(`/${module}/show/${moduleId}`);
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
            const response = await axios.post(`${module}/store`, restData);
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
            const response = await axios.post(`${module}/update/${moduleId}`, restData);
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

const productSlice = createSlice({
    name: 'crud/module',
    initialState: initialState,
    reducers: {
        resetProduct: () => initialState,
        newProduct: {
            reducer: (state, action) => action.payload,
            prepare: (event) => ({
                payload: {
                    id: FuseUtils.generateGUID(),
                    name: '',
                    handle: '',
                    description: '',
                    categories: [],
                    tags: [],
                    images: [],
                    priceTaxExcl: 0,
                    priceTaxIncl: 0,
                    taxRate: 0,
                    comparedPrice: 0,
                    quantity: 0,
                    sku: '',
                    width: '',
                    height: '',
                    depth: '',
                    weight: '',
                    extraShippingFee: 0,
                    active: true,
                },
            }),
        },
    },
    extraReducers: {
        [getModule.fulfilled]: (state, action) => {
            state.data = action.payload.result;
            state.fields = action.payload.fields;
        },
        [saveModule.fulfilled]: (state, action) => {
            return state
        },
        [saveModule.rejected]: (state, action) => {
            state.errors = action.payload.errors;
        },
        [updateModule.fulfilled]: (state, action) => {
            return state
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

export const { newProduct, resetProduct } = productSlice.actions;

export const selectProduct = ({ crud }) => crud.module;

export const selectModule = (state) => state.crud.module.data;

export default productSlice.reducer;
