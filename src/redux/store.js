import { configureStore } from '@reduxjs/toolkit';
import resourceReducer from '../features/resources/resourceSlice';

export const store = configureStore({
  reducer: {
    resources: resourceReducer,
  },
});
