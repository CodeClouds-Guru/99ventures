import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
    total_unread_ticket: 0,
}

const ticketSlice = createSlice({
    name: 'ticket',
    initialState,
    reducers: {
        updateUnreadTicketCount: (state, action) => {
            state.total_unread_ticket = action.payload
        }
    }
});

export const { 
    updateUnreadTicketCount
} = ticketSlice.actions

export default ticketSlice.reducer