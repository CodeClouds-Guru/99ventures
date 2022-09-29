import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
    show_sidebar: false,
    selectedItem: null
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
        }
    }
});

export const { toggleSidebar, setSelectedItem } = fileManagerSlice.actions

export default fileManagerSlice.reducer