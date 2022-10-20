import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
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

/*export const copyAndCreateFile = createAsyncThunk(
    'filemanager/copyAndCreateFile',
    async(params, {dispatch, getState}) => {
        dispatch(setLoading('pending'));
        const result = await axios.post(jwtServiceConfig.filemanagerUpdateFile, params)
		.then((response) => {
			if (response.data.results.status) {
				dispatch(showMessage({ variant: 'success', message: response.data.results.message }));
                const { filemanager } = getState();
				setTimeout(() => dispatch(getList(filemanager.pathObject.join('/'))), 1000);
			} else {
				dispatch(showMessage({ variant: 'error', message: 'Something went wrong!' }));
			}
            return response
		})
		.catch(error => {
			dispatch(setLoading('idle'));
			dispatch(showMessage({ variant: 'error', message: error.response.data.message }))
            return error;
		});

        return result;
    }
);*/

export const filemanagerUpdateFile = createAsyncThunk(
    'filemanager/filemanagerUpdateFile',
    async(params, {dispatch, getState}) => {
        dispatch(setLoading('pending'));
        const result = await axios.post(jwtServiceConfig.filemanagerUpdateFile, params)
		.then((response) => {
			if (response.data.results.status) {
				dispatch(showMessage({ variant: 'success', message: response.data.results.message }));
                const { filemanager } = getState();
                const listData = [...filemanager.listData];
                if(params.type === 'rename') {
                    const index = listData.findIndex(fl => fl.id === params.id && fl.type === 'folder');
                    if(index >= 0) {
                        const folderObj = Object.assign({}, listData[index]);
                        folderObj.name = params.folder_name;
                        listData.splice(index, 1, folderObj);
                    }
                } else if(params.type === 'copy-file') {
                    const index = listData.findIndex(fl => fl.id === params.id && fl.type === 'file');
				    if(index >= 0) {
                        const pathObject = filemanager.pathObject;
                        const newFile = Object.assign({}, listData[index]);
                        newFile.name = params.file_name;
                        var prefix = `CodeClouds/1/file-manager`;
                        if(pathObject.length >= 1) {
                            prefix += '/'+pathObject.join('/')
                        }
                        newFile.id = btoa(`${prefix}/${params.file_name}`);
                        listData.push(newFile);                        
                    }                    
                }
                dispatch(setListData(listData));
                dispatch(setJsonData(listData));
                dispatch(setLoading('idle'));
			} else {
				dispatch(showMessage({ variant: 'error', message: 'Something went wrong!' }));
			}
            return response;
		})
		.catch(error => {
            console.log(error)
			dispatch(setLoading('idle'));
			dispatch(showMessage({ variant: 'error', message: error.response.data.message }))
            return error;
		});

        return result;
    }
)

export const createNewFolder = createAsyncThunk(
    'filemanager/createFolder',
    async(params, {dispatch, getState}) => {
        dispatch(setLoading('pending'));
        const result = await axios.post(jwtServiceConfig.filemanagerUploadFile, params)
            .then((response) => {
                dispatch(setLoading('idle'));
                if (response.data.results.status) {
                    dispatch(showMessage({ variant: 'success', message: 'File uploaded!' }));                
                    if(response.data.results.data){
                        dispatch(setListData(response.data.results.data));
                        dispatch(setJsonData(response.data.results.data));
                    }
                } else {
                    dispatch(showMessage({ variant: 'error', message: 'Something went wrong!' }));
                }
            })
            .catch(error => {
                dispatch(setLoading('idle'));
                dispatch(showMessage({ variant: 'error', message: error.response.data.message }))
            });
        return result;
    }
)

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
    pathObject: [],
    folderOptions: {
        type: '',
        popup_mode: false,
        additional_params: {}
    }
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
        },
        setFolderOptions: (state, action) => {
            state.folderOptions = action.payload
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
    setJsonData,
    setFolderOptions
} = fileManagerSlice.actions

export default fileManagerSlice.reducer