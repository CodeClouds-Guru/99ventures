import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
    show_sidebar: false
}

const fileManagerSlice = createSlice({
    name: 'fileManager',
    initialState,
    reducers: {
        toggleSidebar: (state, action) => {
            state.show_sidebar = action.payload
        }
    }
});

export const { toggleSidebar } = fileManagerSlice.actions

export default fileManagerSlice.reducer