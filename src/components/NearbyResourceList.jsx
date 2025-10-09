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
      <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          {mode === 'need' ? '🏥 Nearby Resources' : '🤝 Donation Points'}
        </h2>
        <p className="text-lg text-gray-700 font-medium">
          {filteredResources.length} {filteredResources.length === 1 ? 'location' : 'locations'} found
        </p>
      </div>

      {/* Filters and Controls */}
      <div className="p-6 border-b border-gray-200 bg-white space-y-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 min-w-40 px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
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
            className="flex-1 min-w-40 px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
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
          <div className="p-6 space-y-6">
            {filteredResources.map((resource, idx) => (
              <div 
                key={idx} 
                className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Resource Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">
                          {resource.type === 'food' ? '🍽️' : 
                           resource.type === 'shelter' ? '🏠' : 
                           resource.type === 'medical' ? '🏥' : 
                           resource.type === 'water' ? '💧' : '🆘'}
                        </span>
                        <h3 className="font-bold text-xl text-gray-900 leading-relaxed">{resource.name}</h3>
                      </div>
                      
                      <div className="space-y-3 text-base">
                        <div className="flex items-start gap-3 text-gray-700">
                          <span className="text-lg">📍</span>
                          <span className="leading-relaxed">{resource.address || "Address not provided"}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-gray-700">
                          <span className="text-lg">📏</span>
                          <span className="font-medium">{calculateDistance(resource)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`px-4 py-3 rounded-xl border text-base font-semibold shadow-sm ${getStatusColor(resource.isAvailable)}`}>
                      <span className="text-lg mr-2">{getStatusIcon(resource.isAvailable)}</span>
                      {resource.isAvailable ? 'Available' : 'Unavailable'}
                    </div>
                  </div>

                  {/* Description */}
                  {resource.description && (
                    <p className="text-gray-700 text-base mb-4 leading-relaxed">
                      {resource.description}
                    </p>
                  )}

                  {/* Requirements */}
                  {resource.requirements && (
                    <div className="mb-4">
                      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Requirements</span>
                      <p className="text-base text-gray-700 leading-relaxed">{resource.requirements}</p>
                    </div>
                  )}

                  {/* Contact Info */}
                  {resource.contactInfo && (
                    <div className="mb-4">
                      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Contact</span>
                      <p className="text-base text-blue-700 font-medium">{resource.contactInfo}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                  <div className="flex flex-wrap gap-3">
                    {resource.contactInfo && (
                      <a
                        href={`tel:${resource.contactInfo.replace(/\D/g, '')}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                      >
                        📞 Call Now
                      </a>
                    )}
                    
                    <button
                      onClick={() => setSelectedResource(resource)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                      🗺️ Get Directions
                    </button>
                    
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md">
                      ℹ️ More Details
                    </button>
                    
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md">
                      📤 Share Resource
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