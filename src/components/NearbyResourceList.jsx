import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

function NearbyResourceList() {
  const { resources, mode } = useSelector((state) => state.resources);
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [userPosition, setUserPosition] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error("Error getting location:", err)
    );
  }, []);

  // Get Directions using the map component
  const handleGetDirections = (resource) => {
    if (!userPosition) {
      alert('Location access needed for directions. Please enable location services.');
      return;
    }

    // Use the map's routing function if available
    if (window.showMapDirections) {
      try {
        // Clear any existing routes first
        if (window.clearMapDirections) {
          window.clearMapDirections();
        }
        
        // Show new directions
        window.showMapDirections(resource);
        
        // Scroll to map section smoothly
        setTimeout(() => {
          const mapElement = document.querySelector('.leaflet-container');
          if (mapElement) {
            mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        
      } catch (error) {
        console.error('Error showing directions:', error);
        // Fallback to external directions
        const [userLat, userLng] = userPosition;
        const { latitude: destLat, longitude: destLng } = resource;
        const directionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLat}%2C${userLng}%3B${destLat}%2C${destLng}`;
        window.open(directionsUrl, '_blank');
      }
    } else {
      // Fallback to opening external directions
      const [userLat, userLng] = userPosition;
      const { latitude: destLat, longitude: destLng } = resource;
      const directionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLat}%2C${userLng}%3B${destLat}%2C${destLng}`;
      window.open(directionsUrl, '_blank');
    }
  };

  // Show detailed information
  const handleShowDetails = (resource) => {
    setShowDetailModal(resource);
  };

  // Share resource
  const handleShareResource = (resource) => {
    const shareText = `📍 ${resource.name}\n🏠 ${resource.address}\n\n${resource.description || 'Community resource'}\n\n${resource.contactInfo ? `📞 ${resource.contactInfo}` : ''}\n${resource.hours ? `🕒 ${resource.hours}` : ''}\n\nShared via AidLocator`;
    
    if (navigator.share) {
      // Use native share API if available
      navigator.share({
        title: resource.name,
        text: shareText,
        url: `https://www.openstreetmap.org/?mlat=${resource.latitude}&mlon=${resource.longitude}&zoom=16`
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Resource details copied to clipboard!');
      }).catch(() => {
        // Fallback to alert with text
        alert(`Share this resource:\n\n${shareText}`);
      });
    }
  };

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
    <div className="h-full flex flex-col max-h-screen xl:max-h-[calc(100vh-120px)]">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0 z-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {mode === 'need' ? '🏥 Nearby Resources' : '🤝 Donation Points'}
        </h2>
        <p className="text-base text-gray-700 font-medium">
          {filteredResources.length} {filteredResources.length === 1 ? 'location' : 'locations'} found
        </p>
      </div>

      {/* Filters and Controls - Sticky */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white sticky top-24 z-10">
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

      {/* Resource List - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                      onClick={() => handleGetDirections(resource)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                      🗺️ Get Directions
                    </button>
                    
                    <button 
                      onClick={() => handleShowDetails(resource)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                      ℹ️ More Details
                    </button>
                    
                    <button 
                      onClick={() => handleShareResource(resource)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                      📤 Share Resource
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comprehensive Resource Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {showDetailModal.type === 'food' ? '🍽️' : 
                     showDetailModal.type === 'shelter' ? '🏠' : 
                     showDetailModal.type === 'medical' ? '🏥' : 
                     showDetailModal.type === 'water' ? '💧' : '🆘'}
                  </span>
                  <h3 className="text-2xl font-bold">{showDetailModal.name}</h3>
                </div>
                <button
                  onClick={() => setShowDetailModal(null)}
                  className="text-white hover:text-gray-200 text-3xl font-light"
                >
                  ×
                </button>
              </div>
              <div className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${
                showDetailModal.isAvailable 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                <span className="mr-2">{getStatusIcon(showDetailModal.isAvailable)}</span>
                {showDetailModal.isAvailable ? 'Currently Available' : 'Currently Unavailable'}
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-8 space-y-6">
              {/* Location & Distance */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                  📍 Location & Distance
                </h4>
                <div className="space-y-2">
                  <p className="text-gray-700 text-base leading-relaxed">{showDetailModal.address || "Address not provided"}</p>
                  <p className="text-blue-600 font-semibold">{calculateDistance(showDetailModal)}</p>
                </div>
              </div>

              {/* Description */}
              {showDetailModal.description && (
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                    ℹ️ About This Resource
                  </h4>
                  <p className="text-gray-700 text-base leading-relaxed">{showDetailModal.description}</p>
                </div>
              )}

              {/* Contact Information */}
              {showDetailModal.contactInfo && (
                <div className="bg-green-50 rounded-xl p-6">
                  <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                    📞 Contact Information
                  </h4>
                  <p className="text-gray-700 text-base">{showDetailModal.contactInfo}</p>
                </div>
              )}

              {/* Hours */}
              {showDetailModal.hours && (
                <div className="bg-yellow-50 rounded-xl p-6">
                  <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                    🕒 Hours of Operation
                  </h4>
                  <p className="text-gray-700 text-base">{showDetailModal.hours}</p>
                </div>
              )}

              {/* Requirements */}
              {showDetailModal.requirements && (
                <div className="bg-orange-50 rounded-xl p-6">
                  <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                    📋 Requirements & Eligibility
                  </h4>
                  <p className="text-gray-700 text-base leading-relaxed">{showDetailModal.requirements}</p>
                </div>
              )}

              {/* Website */}
              {showDetailModal.website && (
                <div className="bg-purple-50 rounded-xl p-6">
                  <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                    🌐 Website
                  </h4>
                  <a 
                    href={showDetailModal.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800 underline text-base"
                  >
                    {showDetailModal.website}
                  </a>
                </div>
              )}

              {/* Data Source */}
              <div className="bg-gray-100 rounded-xl p-4">
                <p className="text-gray-600 text-sm">
                  📊 Data source: <span className="font-semibold capitalize">{showDetailModal.source || 'OpenStreetMap'}</span>
                </p>
              </div>
            </div>
            
            {/* Modal Action Buttons */}
            <div className="p-6 bg-gray-50 rounded-b-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {showDetailModal.contactInfo && (
                  <a
                    href={`tel:${showDetailModal.contactInfo.replace(/\D/g, '')}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-colors text-center flex items-center justify-center gap-2"
                  >
                    📞 Call Now
                  </a>
                )}
                
                <button
                  onClick={() => handleGetDirections(showDetailModal)}
                  className="bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  🗺️ Get Directions
                </button>
                
                <button
                  onClick={() => handleShareResource(showDetailModal)}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  📤 Share Resource
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