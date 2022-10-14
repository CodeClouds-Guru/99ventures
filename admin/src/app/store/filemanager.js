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
                /**
                 * setTimeout has used to delay the api call
                 * It's taking time to delete file from S3
                 */                
                setTimeout(()=>{
                    dispatch(
                        getList(filemanager.pathObject.join('/'))
                    );
                }, 5000)
                return {'status': true};
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
)

/*function navigateToNested(jsonData, dispatch){    
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
}*/

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
        }
    },
    extraReducers: {
        [getList.pending]: (state) => {            
            state.loading = 'pending';
            state.listData = [];
        },
        [getList.fulfilled]: (state, {payload}) => {
            state.listData = payload;
            state.loading = 'idle'
        },
        [getList.rejected]: (state) => {
            state.loading = 'failed'
        },
        [deleteData.pending]: (state) => {
            state.loading = 'pending';
            state.listData = [];
        },
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
    setPathObject
} = fileManagerSlice.actions

export default fileManagerSlice.reducer