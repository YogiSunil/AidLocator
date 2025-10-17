// features/resources/resourceSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Demo data for development
const demoResources = [
  {
    id: 1,
    name: "San Rafael Community Food Bank",
    type: "food",
    address: "123 Main St, San Rafael, CA 94901",
    latitude: 37.9735,
    longitude: -122.5311,
    isAvailable: true,
    description: "Provides fresh and non-perishable food items. Hot meals served daily 11am-2pm.",
    contactInfo: "Tel: (415) 555-0123, Email: help@srfoodbank.org",
    requirements: "Photo ID required. Service available to all residents.",
    hours: "Mon-Fri: 9am-5pm, Sat: 10am-3pm",
    rating: 4.5,
    reviews: [],
    dateAdded: new Date().toISOString()
  },
  {
    id: 2,
    name: "Emergency Shelter Bay Area",
    type: "shelter",
    address: "456 Oak Ave, San Rafael, CA 94901",
    latitude: 37.9745,
    longitude: -122.5321,
    isAvailable: true,
    description: "Provides temporary shelter for individuals and families in need.",
    contactInfo: "Tel: (415) 555-0456, Email: shelter@emergency.org",
    requirements: "No requirements. Open 24/7.",
    hours: "24/7 Emergency Services",
    rating: 4.2,
    reviews: [],
    dateAdded: new Date().toISOString()
  },
  {
    id: 3,
    name: "Marin Health Clinic",
    type: "healthcare",
    address: "789 Pine St, San Rafael, CA 94901",
    latitude: 37.9755,
    longitude: -122.5331,
    isAvailable: true,
    description: "Free and low-cost medical services including primary care and dental.",
    contactInfo: "Tel: (415) 555-0789, Email: info@marinhealth.org",
    requirements: "Income verification required for sliding scale fees.",
    hours: "Mon-Fri: 8am-6pm, Sat: 9am-2pm",
    rating: 4.7,
    reviews: [],
    dateAdded: new Date().toISOString()
  }
];

const initialState = {
  resources: demoResources, // Start with demo data
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
