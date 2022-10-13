import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { showMessage } from 'app/store/fuse/messageSlice';
import axios from 'axios';
import { isEmpty } from 'lodash';


export const getList = createAsyncThunk(
    'filemanager/getList',
    async(params, {dispatch, getState}) => {   
        const { filemanager } = getState();
        if(filemanager.listData.length && params) {
            const result = navigateToNested(filemanager.jsonData, dispatch);
            return {
                'list_data': result,
            };
        }
        
        const result = await axios.post('file-manager/list')
        .then(res => {
            if(res.status === 200 && res.data.results.data) {
                const result = res.data.results.data;
                return {
                    'list_data': navigateToNested(result, dispatch),
                    'json_data': result
                }
            }
            return {};
        })
        .catch(error => {
            dispatch(showMessage({ variant: 'error', message: error.response.data.errors }));
            return {};
        })

        return result;
    }
);

export const deleteData = createAsyncThunk(
    'filemanager/deleteData',
    async(params, {dispatch, getState}) => {
        if(isEmpty(params)) {
            dispatch(showMessage({ variant: 'error', message: 'Unable to process your request!' }));
            return {'status': false};
        }
        const { filemanager } = getState();        
        const currentListData = filemanager.listData;
        const listData  = currentListData.filter(file => !params.includes(file.id));        
        console.log(listData)
        return {
            'status': true,
            'list_data':  listData
        }

        const result = await axios.post('file-manager/delete', {modelIds: params})
        .then(result => {
            if(result.status === 200 && result.data.results.status) {
                dispatch(showMessage({ variant: 'success', message: result.data.results.message }));
                const { filemanager } = getState();        
                const currentListData = filemanager.listData;
                const listData  = currentListData.filter(file => !params.includes(file.id));        
                return {
                    'status': true,
                    'list_data':  listData
                }
            } else {
                dispatch(showMessage({ variant: 'error', message: 'Something went wrong!' }));
                return {'status': false};
            }
        })
        .catch(error => {
            dispatch(showMessage({ variant: 'error', message: error.response.data.errors }));
            return {'status': false};
        })

        return result;
    }
)

function navigateToNested(jsonData, dispatch){    
    const pathname = location.pathname.replace(/\/$/, "");	// Remove trailing slash
    const pathArry = pathname.split('/');
    const breadCrumbArray = [];

    //Cleared selected items while navigate
    dispatch(setSelectedItemsId([]));

    if(pathArry.length > 3 && jsonData.length) {
        const staticPath = pathArry.splice(0, 3);	// truncate frist three static path, like ['/', 'app', 'filemanager']
        
        var finalResult = [];
        for(let i=0; i<pathArry.length; i++) {
            if(i < 1) {
                finalResult = jsonData.filter(file => file.id === pathArry[i]);					
            } else if(finalResult[0].details.length){
                finalResult = finalResult[0].details.filter(file => file.id === pathArry[i]);					
            }

            staticPath.push(finalResult[0].id);
            breadCrumbArray.push({
                name: finalResult[0].name, 
                path: staticPath.join('/')
            });            	
        }
        dispatch(setBreadCrumb(breadCrumbArray));
        return (finalResult.length && finalResult[0].details.length) ? finalResult[0].details : [];
    }
    dispatch(setBreadCrumb(breadCrumbArray));
    return jsonData;
}

const initialState = {
    show_sidebar: false,
    selectedItem: null,
    selectAll: false,
    selectedItemsId: [],
    lightBox: {isOpen: false, src: null},
    viewType: 'grid',
    jsonData: [],
    listData: [],
    breadCrumb: []
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
        }
    },
    extraReducers: {
        [getList.fulfilled]: (state, {payload}) => {
            state.listData = payload.list_data;
            if(payload.json_data){
                state.jsonData = payload.json_data;
            }
        },
        [deleteData.fulfilled]: (state, { payload }) => {
            if(payload.status === true){
                state.listData = payload.list_data;
                console.log(state.jsonData)
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
    setBreadCrumb
} = fileManagerSlice.actions

export default fileManagerSlice.reducer