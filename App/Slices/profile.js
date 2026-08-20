import { createSlice } from '@reduxjs/toolkit';

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    user: {
      name: 'Adv. Lawmens User',
      email: 'user@thelawmens.com',
      role: 'Advocate',
      isSubscribed: true
    },
    token: null,
    bookmarks: [],
    history: [
      { id: '1', act: 'Bharatiya Nyaya Sanhita , 2023', section: 'Section 4: Punishments' }
    ]
  },
  reducers: {
    setUser: (state, action) => { state.user = action.payload; },
    setToken: (state, action) => { state.token = action.payload; },
    addBookmark: (state, action) => { state.bookmarks.push(action.payload); },
    removeBookmark: (state, action) => {
      state.bookmarks = state.bookmarks.filter(b => b.id !== action.payload);
    },
    addHistory: (state, action) => {
      state.history.unshift(action.payload);
    }
  }
});

export const { setUser, setToken, addBookmark, removeBookmark, addHistory } = profileSlice.actions;
export default profileSlice.reducer;
