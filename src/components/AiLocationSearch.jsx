import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { updateResources } from '../features/resources/resourceSlice';

const AiLocationSearch = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          console.log('User location:', { latitude, longitude }); // Log user location

          const response = await axios.post('http://localhost:5000/api/search-locations', {
            latitude,
            longitude,
            query: `Find aid locations near latitude ${latitude} and longitude ${longitude}. Please provide a detailed list of aid locations with the following specifications:
            - Include emergency services, food banks, homeless shelters, and water distribution points
            - Each location must have: specific organization name, detailed service type, complete street address
            - Ensure 24/7 availability status is specified
            - Include contact information if available
            - Specify any requirements or restrictions for receiving aid
            - Note any special services (e.g. medical care, hygiene facilities)
            Return results in JSON format with properties: 
            name (string), 
            type (one of: food/shelter/water/clothing), 
            address (string), 
            latitude (number), 
            longitude (number), 
            isAvailable (boolean), 
            isDonationPoint (boolean),
            description (string with additional details),
            contactInfo (string),
            requirements (string)`
          });

          console.log('AI API response:', response.data); // Log API response

          const suggestedLocations = response.data;
          dispatch(updateResources(suggestedLocations));
          console.log('Dispatched resources to Redux:', suggestedLocations); // Log dispatched data
        } catch (error) {
          console.error('Error getting AI suggestions:', error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setLoading(false);
      }
    );
  }, [dispatch]);

  return loading ? (
    <div className="text-center p-4">
      <p>Finding aid locations near you...</p>
    </div>
  ) : null;
};

export default AiLocationSearch;