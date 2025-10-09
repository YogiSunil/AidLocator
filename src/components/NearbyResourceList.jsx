import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

function NearbyResourceList() {
  const { resources, mode } = useSelector((state) => state.resources);
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [userPosition, setUserPosition] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error("Error getting location:", err)
    );
  }, []);

  // Filter and sort resources
  const filteredResources = resources
    .filter(resource => {
      if (!filterType) return true;
      return resource.type?.toLowerCase() === filterType.toLowerCase();
    })
    .sort((a, b) => {
      if (sortBy === 'distance' && userPosition) {
        const distA = Math.sqrt(
          Math.pow(a.latitude - userPosition[0], 2) + 
          Math.pow(a.longitude - userPosition[1], 2)
        );
        const distB = Math.sqrt(
          Math.pow(b.latitude - userPosition[0], 2) + 
          Math.pow(b.longitude - userPosition[1], 2)
        );
        return distA - distB;
      }
      return a.name?.localeCompare(b.name) || 0;
    });

  const getStatusColor = (isAvailable) => {
    return isAvailable 
      ? 'bg-green-100 border-green-300 text-green-800'
      : 'bg-red-100 border-red-300 text-red-800';
  };

  const getStatusIcon = (isAvailable) => {
    return isAvailable ? '🟢' : '🔴';
  };

  const calculateDistance = (resource) => {
    if (!userPosition) return 'Unknown distance';
    
    const distance = Math.sqrt(
      Math.pow(resource.latitude - userPosition[0], 2) + 
      Math.pow(resource.longitude - userPosition[1], 2)
    ) * 69; // Rough conversion to miles
    
    return distance < 1 
      ? `${(distance * 5280).toFixed(0)} feet` 
      : `${distance.toFixed(1)} miles`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {mode === 'need' ? '🏥 Nearby Resources' : '🤝 Donation Points'}
        </h2>
        <p className="text-gray-600">
          {filteredResources.length} {filteredResources.length === 1 ? 'location' : 'locations'} found
        </p>
      </div>

      {/* Filters and Controls */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <div className="flex flex-wrap gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 min-w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="food">🍽️ Food</option>
            <option value="shelter">🏠 Shelter</option>
            <option value="water">💧 Water</option>
            <option value="medical">🏥 Medical</option>
            <option value="clothing">👕 Clothing</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 min-w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="distance">📍 By Distance</option>
            <option value="name">📝 By Name</option>
          </select>
        </div>
      </div>

      {/* Resource List */}
      <div className="flex-1 overflow-y-auto">
        {filteredResources.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg font-medium">No resources found</p>
            <p className="text-gray-400">Try adjusting your filters or search area</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {filteredResources.map((resource, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Resource Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {resource.type === 'food' ? '🍽️' : 
                           resource.type === 'shelter' ? '🏠' : 
                           resource.type === 'medical' ? '🏥' : 
                           resource.type === 'water' ? '💧' : '🆘'}
                        </span>
                        <h3 className="font-bold text-lg text-gray-800">{resource.name}</h3>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>📍</span>
                          <span>{resource.address || "Address not provided"}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>📏</span>
                          <span>{calculateDistance(resource)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(resource.isAvailable)}`}>
                      {getStatusIcon(resource.isAvailable)} 
                      {resource.isAvailable ? 'Available' : 'Unavailable'}
                    </div>
                  </div>

                  {/* Description */}
                  {resource.description && (
                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                      {resource.description}
                    </p>
                  )}

                  {/* Requirements */}
                  {resource.requirements && (
                    <div className="mb-3">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Requirements</span>
                      <p className="text-sm text-gray-600">{resource.requirements}</p>
                    </div>
                  )}

                  {/* Contact Info */}
                  {resource.contactInfo && (
                    <div className="mb-3">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</span>
                      <p className="text-sm text-blue-600">{resource.contactInfo}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {resource.contactInfo && (
                      <a
                        href={`tel:${resource.contactInfo.replace(/\D/g, '')}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        📞 Call
                      </a>
                    )}
                    
                    <button
                      onClick={() => setSelectedResource(resource)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      🗺️ Directions
                    </button>
                    
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                      ℹ️ Details
                    </button>
                    
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                      📤 Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resource Detail Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">{selectedResource.name}</h3>
                <button
                  onClick={() => setSelectedResource(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">📍 Location</h4>
                  <p className="text-gray-600">{selectedResource.address}</p>
                </div>
                
                {selectedResource.description && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">ℹ️ Description</h4>
                    <p className="text-gray-600">{selectedResource.description}</p>
                  </div>
                )}
                
                {selectedResource.contactInfo && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">📞 Contact</h4>
                    <p className="text-gray-600">{selectedResource.contactInfo}</p>
                  </div>
                )}
                
                {selectedResource.requirements && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">📋 Requirements</h4>
                    <p className="text-gray-600">{selectedResource.requirements}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-6">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors">
                  📞 Call Now
                </button>
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors">
                  🗺️ Get Directions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NearbyResourceList;