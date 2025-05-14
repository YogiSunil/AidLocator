import React from 'react';
import { useSelector } from 'react-redux';

function NearbyResourceList() {
  const defaultResources = [
    { name: 'Food Bank', type: 'Food', address: '123 Main St', latitude: 51.505, longitude: -0.09, isAvailable: true, isDonationPoint: false, description: "Provides food assistance to families in need.", contactInfo: "555-1234", requirements: "Must bring ID." },
    { name: 'Shelter Home', type: 'Shelter', address: '456 Elm St', latitude: 51.51, longitude: -0.1, isAvailable: true, isDonationPoint: false, description: "Emergency shelter for individuals and families.", contactInfo: "555-5678", requirements: "Must register upon arrival." },
    { name: 'Water Station', type: 'Water', address: '789 Oak St', latitude: 51.515, longitude: -0.11, isAvailable: true, isDonationPoint: false, description: "Provides clean drinking water.", contactInfo: "N/A", requirements: "Bring your own container." },
    { name: 'Clothing Donation', type: 'Clothing', address: '101 Pine St', latitude: 51.52, longitude: -0.12, isAvailable: false, isDonationPoint: true, description: "Accepts donations of gently used clothing.", contactInfo: "555-9012", requirements: "Clothing must be clean and in good condition." },
  ];

  const { resources, mode } = useSelector((state) => state.resources);
  const allResources = resources && resources.length > 0 ? resources : defaultResources;

  const [filterType, setFilterType] = React.useState(''); // Added filterType state

  // Added dynamic filtering based on chatbot queries
  const [userPosition, setUserPosition] = React.useState(null);

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error("Error getting location:", err)
    );
  }, []);

  const visibleResources = allResources.filter((r) => {
    const matchesMode = mode === 'need' ? r.isAvailable : r.isDonationPoint;
    const matchesType = filterType ? r.type.toLowerCase() === filterType.toLowerCase() : true;

    if (!userPosition) return matchesMode && matchesType;

    // Calculate distance in kilometers using Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = (r.latitude - userPosition[0]) * Math.PI / 180;
    const dLon = (r.longitude - userPosition[1]) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userPosition[0] * Math.PI / 180) * Math.cos(r.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return matchesMode && matchesType && distance < 10; // Show resources within 10km
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
        visibleResources.map((r, idx) => (
          <div className="mb-4 p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
        <h3 className="font-bold text-xl mb-2">{r.name}</h3>
        <div className="space-y-2">
          <p><strong>Type:</strong> <span className="capitalize">{r.type}</span></p>
          <p><strong>Address:</strong> {r.address || "Address not available"}</p>
          <p><strong>Description:</strong> {r.description || "No description available"}</p>
          <p><strong>Contact:</strong> {r.contactInfo || "No contact information available"}</p>
          <p><strong>Requirements:</strong> {r.requirements || "No specific requirements"}</p>
          {mode === 'need' && (
            <p className="mt-3">
              <strong>Status:</strong> 
              <span className={`ml-2 px-3 py-1 rounded-full ${r.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {r.isAvailable ? '✅ Open Now' : '❌ Unavailable'}
              </span>
            </p>
          )}
        </div>
      </div>
        ))
      )}
    </div>
  );
}

export default NearbyResourceList;