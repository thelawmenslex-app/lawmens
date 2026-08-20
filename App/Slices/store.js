import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './profile';
import helperReducer from './helper';

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    helper: helperReducer,
  },
});
