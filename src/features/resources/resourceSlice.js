// src/features/resources/resourceSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  mode: 'need',
  selectedCoords: null, // new field for clicked location
};

const resourceSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    addResource: (state, action) => {
      state.items.push(action.payload);
    },
    setMode: (state, action) => {
      state.mode = action.payload;
      state.selectedCoords = null; // reset on mode change
    },
    setSelectedCoords: (state, action) => {
      state.selectedCoords = action.payload;
    },
  },
});

export const { addResource, setMode, setSelectedCoords } = resourceSlice.actions;
export default resourceSlice.reducer;
