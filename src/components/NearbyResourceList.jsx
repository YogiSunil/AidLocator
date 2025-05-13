import React from 'react';
import { useSelector } from 'react-redux';

function NearbyResourceList() {
  const defaultResources = [
    { name: 'Food Bank', type: 'Food', address: '123 Main St', latitude: 51.505, longitude: -0.09, isAvailable: true, isDonationPoint: false },
    { name: 'Shelter Home', type: 'Shelter', address: '456 Elm St', latitude: 51.51, longitude: -0.1, isAvailable: true, isDonationPoint: false },
    { name: 'Water Station', type: 'Water', address: '789 Oak St', latitude: 51.515, longitude: -0.11, isAvailable: true, isDonationPoint: false },
    { name: 'Clothing Donation', type: 'Clothing', address: '101 Pine St', latitude: 51.52, longitude: -0.12, isAvailable: false, isDonationPoint: true },
  ];

  const { resources, mode } = useSelector((state) => state.resources);
  const allResources = resources && resources.length > 0 ? resources : defaultResources;

  const [filterType, setFilterType] = React.useState(''); // Added filterType state

  // Added dynamic filtering based on chatbot queries
  const visibleResources = allResources.filter((r) => {
    const matchesMode = mode === 'need' ? r.isAvailable : r.isDonationPoint;
    const matchesType = filterType ? r.type.toLowerCase() === filterType.toLowerCase() : true;
    return matchesMode && matchesType;
  });

  return (
    <div className="bg-white p-4 rounded shadow max-h-[75vh] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">
        {mode === 'need' ? 'Nearby Aid Locations' : 'Donation Points'}
      </h2>

      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        className="mb-4 px-4 py-2 border rounded w-full"
      >
        <option value="">All Types</option>
        <option value="Food">Food</option>
        <option value="Shelter">Shelter</option>
        <option value="Water">Water</option>
        <option value="Clothing">Clothing</option>
      </select>

      {visibleResources.length === 0 ? (
        <p>No resources found nearby.</p>
      ) : (
        // Updated to display detailed information for each aid location
        visibleResources.map((res, idx) => (
          <div key={idx} className="mb-4 p-3 border rounded shadow-sm">
            <h3 className="font-bold text-lg">{res.name}</h3>
            <p><strong>Type:</strong> {res.type}</p>
            <p><strong>Address:</strong> {res.address || 'Address not available'}</p>
            <p><strong>Details:</strong> {res.details || 'No additional details available'}</p>
            {mode === 'need' && <p><strong>Status:</strong> ✅ Available</p>}
          </div>
        ))
      )}
    </div>
  );
}

export default NearbyResourceList;
