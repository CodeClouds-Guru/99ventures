import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import FuseUtils from '@fuse/utils';

export const getModuleFields = createAsyncThunk('crud/getModuleFields', async ({ module }) => {
    const response = await axios.get(`/${module}/fields`);
    const data = await response.data.results;

    return data === undefined ? null : data;
});

export const getProduct = createAsyncThunk('crud/getModule', async (productId) => {
    const response = await axios.get(`/api/ecommerce/products/${productId}`);
    const data = await response.data;

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
    async (moduleData, { dispatch, getState }) => {
        const{module,...restData} = moduleData
        const response = await axios.post(`${module}/store`, restData);
        const data = await response.data.results;
        return data;
    }
);

const initialState = {
    fields: {},
    data: {}
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
        [getProduct.fulfilled]: (state, action) => action.payload,
        [saveModule.fulfilled]: (state, action) => {
            return state
        },
        [removeProduct.fulfilled]: (state, action) => null,
        [getModuleFields.fulfilled]: (state, action) => {
            state.fields = action.payload.fields
        }
    },
});

export const { newProduct, resetProduct } = productSlice.actions;

export const selectProduct = ({ crud }) => crud.module;

export default productSlice.reducer;
