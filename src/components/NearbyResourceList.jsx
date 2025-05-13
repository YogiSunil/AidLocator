import React from 'react';
import { useSelector } from 'react-redux';

function NearbyResourceList() {
  const { items, mode } = useSelector((state) => state.resources);

  // Filter based on current mode
  const visibleResources = items.filter((r) =>
    mode === 'need' ? r.isAvailable : r.isDonationPoint
  );

  return (
    <div className="bg-white p-4 rounded shadow max-h-[75vh] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">
        {mode === 'need' ? 'Nearby Aid Locations' : 'Donation Points'}
      </h2>

      {visibleResources.length === 0 ? (
        <p>No resources found nearby.</p>
      ) : (
        visibleResources.map((res, idx) => (
          <div key={idx} className="mb-4 p-3 border rounded shadow-sm">
            <h3 className="font-bold text-lg">{res.name}</h3>
            <p><strong>Type:</strong> {res.type}</p>
            <p><strong>Address:</strong> {res.address || 'Address not available'}</p>
            {mode === 'need' && <p><strong>Status:</strong> ✅ Available</p>}
          </div>
        ))
      )}
    </div>
  );
}

export default NearbyResourceList;
