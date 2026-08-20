import { createSlice } from '@reduxjs/toolkit';

const helperSlice = createSlice({
  name: 'helper',
  initialState: {
    syncStatus: 'Not synced yet',
    isSyncing: false,
    activeBook: 'BNS'
  },
  reducers: {
    setSyncStatus: (state, action) => { state.syncStatus = action.payload; },
    setIsSyncing: (state, action) => { state.isSyncing = action.payload; },
    setActiveBook: (state, action) => { state.activeBook = action.payload; }
  }
});

export const { setSyncStatus, setIsSyncing, setActiveBook } = helperSlice.actions;
export default helperSlice.reducer;
