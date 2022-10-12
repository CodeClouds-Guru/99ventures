import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { showMessage } from 'app/store/fuse/messageSlice';
import axios from 'axios';


export const getList = createAsyncThunk(
    'filemanager/getList',
    async(params, {dispatch, getState}) => {   
        const result = await axios.post('file-manager/list', params)
        .then(res => {
            if(res.status === 200 && res.data.results.data) {
                const result = res.data.results.data;
                return result;
            }
            return [];
        })
        .catch(error => {
            dispatch(showMessage({ variant: 'error', message: error.response.data.errors }));
            return [];
        })

        return result;
    }
);

const jsonData1 = [
    // {
    //     id: 1,
    //     type: 'file',
    //     mime_type: 'application/pdf',
    //     size: 18879,
    //     path: "/",
    //     name: "document.pdf"
    // },
    // {
    //     id: 2,
    //     type: 'file',
    //     mime_type: 'image/jpg',
    //     size: 18879,
    //     path: "/",
    //     name: "main_logo.png"
    // },
    // {
    //     id: 3,
    //     type: 'file',
    //     mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    //     size: 18879,
    //     path: "/",
    //     name: "sheet.xlsx"
    // },
    {
        id: 4,
        type: 'folder',
        mime_type: '',
        size: 18879,
        path: "/",
        name: "Photos"
    },
    // {
    //     id: 5,
    //     type: 'file',
    //     mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    //     size: 18879,
    //     path: "/",
    //     name: "word.docx"
    // },
    {
        id: 6,
        type: 'folder',
        mime_type: '',
        size: 18879,
        path: "/",
        name: "Demo"
    }
]

const jsonData = [
    {
        "id": "Q29kZUNsb3Vkcy8xL2ZpbGUtbWFuYWdlci9hYmM=",
        "type": "folder",
        "name": "Level 1",
        "details": [
            {
                "id": "Q29kZUNsb3Vkcy8xL2ZpbGUtbWFuYWdlci9hYmMvMTY2NTEzODIwNjI1MXNhbXBsZS5wZGY=",
                "type": "file",
                "name": "1665138206251sample.pdf",
                "details": [],
                "file_path": "https://99-ventures-bucket.s3.us-east-2.amazonaws.com/CodeClouds/1/file-manager/abc/1665138206251sample.pdf",
                "size": 3028,
                "last_modified": "2022-10-07T10:23:35.000Z",
                "mime_type": "image/jpeg"
            },
            {
                "id": "Q29kZUNsb3Vkcy8xL2ZpbGUtbWFuYWdlci9hYmMvMTY2NTEzODg4MTQ1NnNhbXBsZS5wZGY=",
                "type": "file",
                "name": "1665138881456sample.pdf",
                "details": [],
                "file_path": "https://99-ventures-bucket.s3.us-east-2.amazonaws.com/CodeClouds/1/file-manager/abc/1665138881456sample.pdf",
                "size": 3028,
                "last_modified": "2022-10-07T10:34:48.000Z",
                "mime_type": "image/jpeg"
            },
            {
                "id": "Q29kZUNsb3Vkcy8xL2ZpbGUtbWFuYWdlci9hYmMvMTY2NTE0MDQ0NzI5NXNhbXBsZS5wZGY=",
                "type": "file",
                "name": "1665140447295sample.pdf",
                "details": [],
                "file_path": "https://99-ventures-bucket.s3.us-east-2.amazonaws.com/CodeClouds/1/file-manager/abc/1665140447295sample.pdf",
                "size": 3028,
                "last_modified": "2022-10-07T11:00:54.000Z",
                "mime_type": "image/jpeg"
            },
            {
                "id": "Q29kZUNsb3Vkcy8xL2ZpbGUtbWFuYWdlci9hYmMvMTY2NTE0NDAwMDIyNnNhbXBsZS5wZGY=",
                "type": "file",
                "name": "1665144000226sample.pdf",
                "details": [],
                "file_path": "https://99-ventures-bucket.s3.us-east-2.amazonaws.com/CodeClouds/1/file-manager/abc/1665144000226sample.pdf",
                "size": 3028,
                "last_modified": "2022-10-07T12:00:07.000Z",
                "mime_type": "image/jpeg"
            },
            {
                "id": "Q29kZUNsb3Vkcy8xL2ZpbGUtbWFuYWdlci9hYmMvbmV3IGFiYw==",
                "type": "folder",
                "name": "Level 2",
                "details": [
                    {
                        "id": "Q29kZUNsb3Vkcy8xL2ZpbGUtbWFuYWdlci9hYmMvbmV3IGFiYy8xNjY1MzkxMDY4MjU0c2FtcGxlLnBkZg==",
                        "type": "file",
                        "name": "1665391068254sample.pdf",
                        "details": [],
                        "file_path": "https://99-ventures-bucket.s3.us-east-2.amazonaws.com/CodeClouds/1/file-manager/abc/new abc/1665391068254sample.pdf",
                        "size": 3028,
                        "last_modified": "2022-10-10T08:37:54.000Z",
                        "mime_type": "image/jpeg"
                    },
                    {
                        "id": "Q29kZUNsb3Vkcy8xL2ZpbGUtbWFuYWdlci9hYmMvbmV3IGFiYww===",
                        "type": "folder",
                        "name": "Level 3",
                        "details": [
                            {
                                "id": "Q29kZUNsb3Vkcy8xL2ZpbGUtbWFuYWdlci9hYmMvbmV3IGFiYy8xNjY1MzkxMDY4MjU0c2FtcGxlLnBkZg==",
                                "type": "file",
                                "name": "1665391068254sample.pdf",
                                "details": [],
                                "file_path": "https://99-ventures-bucket.s3.us-east-2.amazonaws.com/CodeClouds/1/file-manager/abc/new abc/1665391068254sample.pdf",
                                "size": 3028,
                                "last_modified": "2022-10-10T08:37:54.000Z",
                                "mime_type": "image/jpeg"
                            }
                        ],
                        "file_path": "",
                        "size": "",
                        "last_modified": "2022-10-10T06:56:11.000Z",
                        "mime_type": ""
                    }
                ],
                "file_path": "",
                "size": "",
                "last_modified": "2022-10-10T06:56:11.000Z",
                "mime_type": ""
            }
        ],
        "file_path": "",
        "size": "",
        "last_modified": "2022-09-29T11:06:18.000Z",
        "mime_type": ""
    },
    {
        "id": "Q29kZUNsb3Vkcy8xL2ZpbGUtbWFuYWdlci94eXo=",
        "type": "folder",
        "name": "xyz",
        "details": [
            {
                "id": "Q29kZUNsb3Vkcy8xL2ZpbGUtbWFuYWdlci94eXovMTY2NTEyOTg5ODM4NDE2NjExNDczMDQxNDkgKDEpLkpQRUc=",
                "type": "file",
                "name": "16651298983841661147304149 (1).JPEG",
                "details": [],
                "file_path": "https://99-ventures-bucket.s3.us-east-2.amazonaws.com/CodeClouds/1/file-manager/xyz/16651298983841661147304149 (1).JPEG",
                "size": 180484,
                "last_modified": "2022-10-07T08:05:07.000Z",
                "mime_type": "image/jpeg"
            },
            {
                "id": "Q29kZUNsb3Vkcy8xL2ZpbGUtbWFuYWdlci94eXovMTY2NTEzMzU3NDQzM3NhbXBsZS5wZGY=",
                "type": "file",
                "name": "1665133574433sample.pdf",
                "details": [],
                "file_path": "https://99-ventures-bucket.s3.us-east-2.amazonaws.com/CodeClouds/1/file-manager/xyz/1665133574433sample.pdf",
                "size": 3028,
                "last_modified": "2022-10-07T09:06:21.000Z",
                "mime_type": "image/jpeg"
            },
            {
                "id": "Q29kZUNsb3Vkcy8xL2ZpbGUtbWFuYWdlci94eXovMTY2NTEzMzYyNDcyNnNhbXBsZS5wZGY=",
                "type": "file",
                "name": "1665133624726sample.pdf",
                "details": [],
                "file_path": "https://99-ventures-bucket.s3.us-east-2.amazonaws.com/CodeClouds/1/file-manager/xyz/1665133624726sample.pdf",
                "size": 3028,
                "last_modified": "2022-10-07T09:07:11.000Z",
                "mime_type": "image/jpeg"
            }
        ],
        "file_path": "",
        "size": "",
        "last_modified": "2022-10-07T08:05:07.000Z",
        "mime_type": ""
    }
]

const initialState = {
    show_sidebar: false,
    selectedItem: null,
    selectAll: false,
    selectedItemsId: [],
    lightBox: {isOpen: false, src: null},
    viewType: 'grid',
    jsonData,
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
            state.listData = payload
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