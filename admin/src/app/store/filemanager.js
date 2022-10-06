import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const jsonData = [
    {
        id: 1,
        type: 'file',
        mime_type: 'application/pdf',
        size: 18879,
        path: "/",
        name: "document.pdf"
    },
    {
        id: 2,
        type: 'file',
        mime_type: 'image/jpg',
        size: 18879,
        path: "/",
        name: "main_logo.png"
    },
    {
        id: 3,
        type: 'file',
        mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 18879,
        path: "/",
        name: "sheet.xlsx"
    },
    {
        id: 4,
        type: 'folder',
        mime_type: '',
        size: 18879,
        path: "/",
        name: "Photos"
    },
    {
        id: 5,
        type: 'file',
        mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 18879,
        path: "/",
        name: "word.docx"
    },
    {
        id: 6,
        type: 'folder',
        mime_type: '',
        size: 18879,
        path: "/",
        name: "Demo"
    }
]

const initialState = {
    show_sidebar: false,
    selectedItem: null,
    selectAll: false,
    selectedItemsId: [],
    jsonData
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
        }
    }
});

export const { toggleSidebar, setSelectedItem, setSelectAll, setSelectedItemsId } = fileManagerSlice.actions

export default fileManagerSlice.reducer