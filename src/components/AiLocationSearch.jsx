import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateResources } from '../features/resources/resourceSlice';
import ResourceAPIService from '../services/resourceAPI';

const AiLocationSearch = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('real');
  const [error, setError] = useState(null);
  const [resourceCount, setResourceCount] = useState(0);

  useEffect(() => {
    const loadResources = async () => {
      setLoading(true);
      setError(null);

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          });
        });

        const { latitude, longitude } = position.coords;
        let resources = [];

        if (dataSource === 'real') {
          console.log(' Loading REAL data from OpenStreetMap...');
          
          try {
            const [osmResources, nominatimResources] = await Promise.all([
              ResourceAPIService.fetchOpenStreetMapResources(latitude, longitude, 'food_bank'),
              ResourceAPIService.fetchNominatimSearch(latitude, longitude, 'food bank community kitchen')
            ]);

            resources = [...osmResources, ...nominatimResources];
            
            if (resources.length === 0) {
              console.log(' Trying social facilities...');
              const socialFacilities = await ResourceAPIService.fetchOpenStreetMapResources(latitude, longitude, 'social_facility');
              resources = [...resources, ...socialFacilities];
            }

            const clinics = await ResourceAPIService.fetchOpenStreetMapResources(latitude, longitude, 'clinic');
            resources = [...resources, ...clinics];

            console.log(` Found ${resources.length} REAL resources from OpenStreetMap`);
            
            if (resources.length === 0) {
              console.log(' No real data found, using mock data');
              resources = generateMockResources(latitude, longitude);
            }
            
          } catch (apiError) {
            console.error(' API Error:', apiError);
            setError('Failed to load real data, using mock data as fallback');
            resources = generateMockResources(latitude, longitude);
          }
        } else {
          resources = generateMockResources(latitude, longitude);
        }

        dispatch(updateResources(resources));
        setResourceCount(resources.length);
        
      } catch (locationError) {
        console.error(' Location Error:', locationError);
        setError('Location access denied, using San Rafael, CA');
        const fallbackResources = generateMockResources(37.9735, -122.5311);
        dispatch(updateResources(fallbackResources));
        setResourceCount(fallbackResources.length);
      } finally {
        setLoading(false);
      }
    };

    const generateMockResources = (latitude, longitude) => {
      return [
        {
          id: 1,
          name: 'San Rafael Community Food Bank',
          type: 'food',
          address: '123 Main Street, San Rafael, CA 94901',
          latitude: latitude + (Math.random() - 0.5) * 0.01,
          longitude: longitude + (Math.random() - 0.5) * 0.01,
          isAvailable: true,
          isDonationPoint: false,
          description: 'Fresh produce, pantry items, and hot meals available daily',
          contactInfo: '(415) 555-0123',
          requirements: 'No ID required, all residents welcome',
          hours: 'Mon-Fri 9AM-5PM, Sat 10AM-3PM',
          source: 'mock'
        },
        {
          id: 2,
          name: 'Safe Harbor Shelter',
          type: 'shelter',
          address: '456 Oak Avenue, San Rafael, CA 94901',
          latitude: latitude + (Math.random() - 0.5) * 0.01,
          longitude: longitude + (Math.random() - 0.5) * 0.01,
          isAvailable: true,
          isDonationPoint: false,
          description: 'Emergency housing for individuals and families',
          contactInfo: '(415) 555-0199',
          requirements: 'Background check required, families welcome',
          hours: '24/7 - Check-in after 6PM',
          source: 'mock'
        }
      ];
    };

    loadResources();
  }, [dispatch, dataSource]);

  const toggleDataSource = () => {
    setDataSource(prev => prev === 'real' ? 'mock' : 'real');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">
            {dataSource === 'real' 
              ? ' Loading REAL data from OpenStreetMap...' 
              : ' Loading sample data...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Resource Data</h3>
          <p className="text-sm text-gray-600">
            {dataSource === 'real' ? 'Using real OpenStreetMap data' : 'Using sample data'}
          </p>
        </div>
        
        <button
          onClick={toggleDataSource}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            dataSource === 'real'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-blue-100 text-blue-700 border border-blue-300'
          }`}
        >
          {dataSource === 'real' ? ' Real Data' : ' Mock Data'}
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-800">
               {resourceCount} resources loaded
            </div>
            {error && (
              <div className="text-sm text-orange-600 mt-1">
                 {error}
              </div>
            )}
          </div>
          
          <div className="text-right">
            <div className={`text-sm font-medium ${
              dataSource === 'real' ? 'text-green-600' : 'text-blue-600'
            }`}>
              {dataSource === 'real' ? 'Live OpenStreetMap' : 'Sample Data'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiLocationSearch;
