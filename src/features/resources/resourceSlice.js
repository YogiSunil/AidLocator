// features/resources/resourceSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  resources: [], // Start with empty array - load real data from API
  error: null,
  mode: "need", // Default to 'need' mode
};

const resourceSlice = createSlice({
  name: "resources",
  initialState,
  reducers: {
    addResource: (state, action) => {
      state.resources.push(action.payload);
      state.error = null;
    },
    setResourceError: (state, action) => {
      state.error = action.payload;
    },
    clearResourceError: (state) => {
      state.error = null;
    },
    setMode: (state, action) => {
      state.mode = action.payload;
    },
    editResource: (state, action) => {
      const { resourceId, updatedResource } = action.payload;
      const index = state.resources.findIndex((r) => r.id === resourceId);
      if (index !== -1) {
        state.resources[index] = { ...state.resources[index], ...updatedResource };
      }
    },
    deleteResource: (state, action) => {
      const resourceId = action.payload;
      state.resources = state.resources.filter((r) => r.id !== resourceId);
    },
    updateResources: (state, action) => {
      state.resources = action.payload;
    },
  },
});

export const {
  addResource,
  setResourceError,
  clearResourceError,
  setMode,
  editResource,
  deleteResource,
  updateResources,
} = resourceSlice.actions;

export default resourceSlice.reducer;
