import React, { useState, useEffect } from 'react';

const LocationDisplay = () => {
  const [location, setLocation] = useState({ city: 'Loading...', state: '' });
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualLocation, setManualLocation] = useState('');

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Reverse geocoding to get city name
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
            );
            const data = await response.json();
            setLocation({
              city: data.city || data.locality || 'Unknown City',
              state: data.principalSubdivision || ''
            });
          } catch (error) {
            setLocation({ city: 'Location Services', state: 'Available' });
          }
        },
        () => {
          setLocation({ city: 'Enable Location', state: 'For Better Results' });
        }
      );
    }
  }, []);

  const handleLocationChange = () => {
    if (isManualEntry) {
      setLocation({ city: manualLocation, state: '' });
      setIsManualEntry(false);
    } else {
      setIsManualEntry(true);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">📍</div>
          <div>
            <h3 className="font-bold text-gray-800">Your Location</h3>
            {isManualEntry ? (
              <input
                type="text"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                placeholder="Enter your city or zip code"
                className="border rounded px-3 py-1 text-lg font-medium text-blue-600"
                autoFocus
              />
            ) : (
              <p className="text-lg font-medium text-blue-600">
                {location.city}{location.state && `, ${location.state}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
            title="Use Current Location"
          >
            🎯 Use Current
          </button>
          <button
            onClick={handleLocationChange}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isManualEntry ? '✓ Set' : '✏️ Change'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationDisplay;