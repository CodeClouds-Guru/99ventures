import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { showMessage } from 'app/store/fuse/messageSlice';
import axios from 'axios';

export const getList = createAsyncThunk(
    'filemanager/getList',
    async(params, {dispatch}) => {
        const result = await axios.post('file-manager/list', {path: params })
        .then(res => {
            if(res.status === 200 && res.data.results.data) {
                dispatch(setSelectedItemsId([]));
                return res.data.results.data;
            }
            return [];
        })
        .catch(error => {
            dispatch(showMessage({ variant: 'error', message: error.response.data.errors }));            
            return error.response;
        })
        return result;
    }
);

export const deleteData = createAsyncThunk(
    'filemanager/deleteData',
    async(params, {dispatch, getState}) => {
        if(!params.length) {
            dispatch(showMessage({ variant: 'error', message: 'Unable to process your request!' }));
            return {'status': false};
        }
                
        const result = await axios.post('file-manager/delete', {modelIds: params})
        .then(result => {
            if(result.status === 200 && result.data.results.status) {
                dispatch(showMessage({ variant: 'success', message: result.data.results.message }));
                const { filemanager } = getState();
                const listData = filemanager.listData;
                const newlistData = listData.filter(file => !params.includes(file.id));
                return {'status': true, 'list_data': newlistData};
            } else {
                dispatch(showMessage({ variant: 'error', message: 'Something went wrong!' }));
                return {'status': false};
            }
        })
        .catch(error => {
            dispatch(showMessage({ variant: 'error', message: error.response.data.errors }));
            return error.response;
        });
        return result;
    }
);

/**
 * jsonData is the replicate of the listData Array.
 * It has been used to filter the listData.
 * After filtering the data, when we reset the filter, 
 * original value from jsonData will be taken and assigned to listData.
 * 
 * jsonData will be updating whenever file/folder will be deleted & new data will be fetched.
 * 
 */

const initialState = {
    loading: 'idle',
    show_sidebar: false,
    selectedItem: null,
    selectAll: false,
    selectedItemsId: [],
    lightBox: {isOpen: false, src: null},
    viewType: 'grid',
    jsonData: [],
    listData: [],
    breadCrumb: [],
    pathObject: []
}

const fileManagerSlice = createSlice({
    name: 'fileManager',
    initialState,
    reducers: {
        toggleSidebar: (state, action) => {
            state.show_sidebar = action.payload
        },
        setSelectedItem: (state, action) => {
            state.selectedItem = action.payload;
        },
        setSelectAll: (state, action) => {
            state.selectAll = action.payload
        },
        setSelectedItemsId: (state, action) => {
            state.selectedItemsId = action.payload
        },
        setlightBoxStatus: (state, action) => {
            state.lightBox = action.payload
        },
        setViewType: (state, action) => {
            state.viewType = action.payload
        },
        setBreadCrumb: (state, action) => {
            state.breadCrumb = action.payload
        },
        setPathObject: (state, action) => {
            state.pathObject = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setListData: (state, action) => {
            state.listData = action.payload
        },
        setJsonData: (state, action) => {
            state.jsonData = action.payload
        }
    },
    extraReducers: {
        [getList.pending]: (state) => {            
            state.loading = 'pending';
            state.listData = [];
        },
        [getList.fulfilled]: (state, {payload}) => {
            state.jsonData = payload;
            state.listData = payload;
            state.loading = 'idle'
        },
        [getList.rejected]: (state) => {
            state.loading = 'failed'
        },
        [deleteData.pending]: (state) => {
            state.loading = 'pending';
        },
        [deleteData.fulfilled]: (state, {payload}) => {
            state.loading = 'idle';
            if(payload.list_data){
                state.listData = payload.list_data;
                state.jsonData = payload.list_data;
            }
        }
    }
});

export const { 
    toggleSidebar, 
    setSelectedItem, 
    setSelectAll, 
    setSelectedItemsId,
    setlightBoxStatus,
    setViewType,
    setBreadCrumb,
    setPathObject,
    setLoading,
    setListData,
    setJsonData
} = fileManagerSlice.actions

export default fileManagerSlice.reducer