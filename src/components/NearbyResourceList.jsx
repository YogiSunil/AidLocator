import React from 'react';
import { useSelector } from 'react-redux';

function NearbyResourceList() {
  const { resources, mode } = useSelector((state) => state.resources);
  const allResources = resources; // Remove defaultResources logic

  const [filterType, setFilterType] = React.useState(''); // Added filterType state

  // Added dynamic filtering based on chatbot queries
  const [userPosition, setUserPosition] = React.useState(null);

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error("Error getting location:", err)
    );
  }, []);

  const visibleResources = allResources; // Temporarily disable filtering logic

  React.useEffect(() => {
    console.log("Resources from Redux store:", resources);
    console.log("User position:", userPosition);
    console.log("Visible resources after filtering:", visibleResources);
  }, [resources, userPosition, visibleResources]);

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