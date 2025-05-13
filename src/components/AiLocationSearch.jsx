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
          const response = await axios.post('/api/search-locations', {
            latitude,
            longitude,
            query: `Find aid locations near latitude ${latitude} and longitude ${longitude}. Return results in JSON format with properties: name, type (food/shelter/water/clothing), address, latitude, longitude, isAvailable (true), isDonationPoint (false)`
          });

          const suggestedLocations = response.data;
          dispatch(updateResources(suggestedLocations));
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