import React, { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useSelector } from "react-redux";

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// Custom user location icon
const userLocationIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <circle cx="16" cy="16" r="15" fill="#3B82F6" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="16" cy="16" r="5" fill="#FFFFFF"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Simple Route Component using OSRM API directly (no problematic leaflet-routing-machine)
const SimpleRouting = ({ start, end, onRoutingComplete }) => {
  const map = useMap();
  const routeLayerRef = useRef(null);

  useEffect(() => {
    if (!map || !start || !end) return;

    // Clean up existing route layer
    const cleanup = () => {
      if (routeLayerRef.current) {
        try {
          map.removeLayer(routeLayerRef.current);
        } catch (error) {
          // Layer cleanup error - safe to ignore
        }
        routeLayerRef.current = null;
      }
    };

    cleanup();

    // Fetch route from OSRM API directly
    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
        );
        
        if (!response.ok) throw new Error('Routing service unavailable');
        
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          
          // Create route line on map
          const routeCoordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          
          const routeLine = L.polyline(routeCoordinates, {
            color: '#3B82F6',
            weight: 5,
            opacity: 0.8,
            smoothFactor: 1
          });
          
          routeLine.addTo(map);
          routeLayerRef.current = routeLine;
          
          // Fit map to show the route
          map.fitBounds(routeLine.getBounds(), { padding: [20, 20] });
          
          // Call completion handler with route info
          if (onRoutingComplete) {
            onRoutingComplete({
              distance: (route.distance / 1000).toFixed(1), // Convert to km
              time: Math.round(route.duration / 60), // Convert to minutes
              coordinates: routeCoordinates
            });
          }
        } else {
          throw new Error('No route found');
        }
      } catch (error) {
        console.error('Routing error:', error);
        
        // Fallback: draw straight line
        const straightLine = L.polyline([start, end], {
          color: '#EF4444',
          weight: 3,
          opacity: 0.6,
          dashArray: '10, 10'
        });
        
        straightLine.addTo(map);
        routeLayerRef.current = straightLine;
        
        // Calculate straight-line distance
        const distance = (map.distance(start, end) / 1000).toFixed(1);
        
        if (onRoutingComplete) {
          onRoutingComplete({
            distance: distance,
            time: 'Unknown',
            error: 'Showing straight-line distance'
          });
        }
      }
    };

    fetchRoute();
    return cleanup;
  }, [map, start, end, onRoutingComplete]);

  return null;
};

function MapView() {
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResources, setFilteredResources] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [routingInfo, setRoutingInfo] = useState(null);
  const [routeDestination, setRouteDestination] = useState(null);
  const { resources, mode } = useSelector((state) => state.resources);

  // Function to show directions to a resource
  const showDirectionsTo = useCallback((resource) => {
    if (!userLocation) {
      alert('Location access needed for directions. Please enable location services.');
      return;
    }
    
    setRouteDestination([resource.latitude, resource.longitude]);
    setRoutingInfo(null); // Reset routing info
  }, [userLocation]);

  // Clear directions
  const clearDirections = useCallback(() => {
    setRouteDestination(null);
    setRoutingInfo(null);
  }, []);

  // Expose showDirections function globally so NearbyResourceList can call it
  useEffect(() => {
    window.showMapDirections = showDirectionsTo;
    window.clearMapDirections = clearDirections;
    
    return () => {
      window.showMapDirections = null;
      window.clearMapDirections = null;
    };
  }, [userLocation, showDirectionsTo, clearDirections]);

  // Get user location
  useEffect(() => {
    setIsLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = [position.coords.latitude, position.coords.longitude];
          setUserLocation(userPos);
          setLocationError(null);
          setIsLoading(false);
        },
        (error) => {
          setLocationError("Unable to get your location. Using default location.");
          setUserLocation([37.9735, -122.5311]);
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setUserLocation([37.9735, -122.5311]);
      setIsLoading(false);
    }
  }, []);

  // Calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Filter resources
  useEffect(() => {
    if (!userLocation || !resources) {
      setFilteredResources([]);
      return;
    }

    const filtered = resources.filter((resource) => {
      const typeMatch = selectedFilter === "all" || resource.type === selectedFilter;
      const modeMatch = mode === "need" ? resource.isAvailable : resource.isDonationPoint;
      
      return typeMatch && modeMatch;
    });

    filtered.sort((a, b) => {
      const distanceA = calculateDistance(userLocation[0], userLocation[1], a.latitude, a.longitude);
      const distanceB = calculateDistance(userLocation[0], userLocation[1], b.latitude, b.longitude);
      return distanceA - distanceB;
    });

    setFilteredResources(filtered);
  }, [userLocation, resources, selectedFilter, mode]);

  // Handle location search
  const handleLocationSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const newLocation = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setUserLocation(newLocation);
        setSearchQuery("");
      } else {
        alert("Location not found. Please try a different search term.");
      }
    } catch (error) {
      alert("Error searching for location. Please try again.");
    }
  };

  const filterOptions = [
    { value: "all", label: " All Resources", color: "bg-gray-100" },
    { value: "food", label: " Food", color: "bg-orange-100" },
    { value: "shelter", label: " Shelter", color: "bg-green-100" },
    { value: "medical", label: " Medical", color: "bg-red-100" },
    { value: "clothing", label: " Clothing", color: "bg-purple-100" },
    { value: "water", label: " Water", color: "bg-blue-100" },
    { value: "emergency", label: " Emergency", color: "bg-red-100" }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map and finding your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50">
      {/* Header Controls */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto">
          {locationError && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg text-sm">
               {locationError}
            </div>
          )}
          
          {/* Enhanced Search Bar with Location Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 flex">
              <input
                type="text"
                placeholder="🔍 Search for a location or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLocationSearch()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500 text-base"
              />
              <button
                onClick={handleLocationSearch}
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                🔍 Search
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                title="Get current location"
              >
                📍 My Location
              </button>
              
              <button
                onClick={clearDirections}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                title="Clear directions"
              >
                🗑️ Clear Route
              </button>
            </div>
          </div>

          {/* Route Information Display */}
          {routingInfo && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">🛣️</span>
                  <div>
                    <div className="font-semibold text-blue-800">Route Information</div>
                    <div className="text-sm text-blue-600">
                      Distance: <span className="font-medium">{routingInfo.distance} km</span>
                      {routingInfo.time !== 'Unknown' && (
                        <span> • Estimated time: <span className="font-medium">{routingInfo.time} min</span></span>
                      )}
                      {routingInfo.error && (
                        <span className="text-orange-600"> • {routingInfo.error}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={clearDirections}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  ✖️
                </button>
              </div>
            </div>
          )}

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedFilter(option.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === option.value
                    ? "bg-blue-600 text-white"
                    : `${option.color} text-gray-700 hover:bg-opacity-80`
                }`}
              >
                {option.label}
                <span className="ml-1 text-xs opacity-75">
                  ({option.value === "all" ? filteredResources.length : filteredResources.filter(r => r.type === option.value).length})
                </span>
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span> Showing all available resources</span>
            <span> {filteredResources.length} resources found</span>
            {userLocation && (
              <span> Your location: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      {userLocation && (
        <MapContainer
          center={userLocation}
          zoom={14}
          style={{ height: "80vh", width: "100%" }}
          className="z-10"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location Marker */}
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup>
              <div className="text-center">
                <strong> Your Location</strong>
                <br />
                <span className="text-sm text-gray-600">
                  Lat: {userLocation[0].toFixed(4)}<br />
                  Lon: {userLocation[1].toFixed(4)}
                </span>
              </div>
            </Popup>
          </Marker>

          {/* Resource Markers */}
          {filteredResources.map((resource, index) => {
            const distance = calculateDistance(
              userLocation[0], userLocation[1],
              resource.latitude, resource.longitude
            );
            
            return (
              <Marker
                key={resource.id || index}
                position={[resource.latitude, resource.longitude]}
              >
                <Popup maxWidth={300}>
                  <div className="p-2">
                    <h3 className="font-bold text-lg mb-2">{resource.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Type:</span> {resource.type}
                        {resource.isAvailable && <span className="ml-2 text-green-600"> Available</span>}
                        {resource.isDonationPoint && <span className="ml-2 text-blue-600"> Donations</span>}
                      </div>
                      
                      {resource.address && (
                        <div>
                          <span className="font-medium">Address:</span> {resource.address}
                        </div>
                      )}
                      
                      {resource.description && (
                        <div>
                          <span className="font-medium">Description:</span> {resource.description}
                        </div>
                      )}
                      
                      {resource.hours && (
                        <div>
                          <span className="font-medium">Hours:</span> {resource.hours}
                        </div>
                      )}
                      
                      {resource.contactInfo && (
                        <div>
                          <span className="font-medium">Contact:</span> {resource.contactInfo}
                        </div>
                      )}
                      
                      <div className="pt-2 border-t">
                        <span className="font-medium">Distance:</span> {distance.toFixed(2)} km away
                      </div>
                      
                      <button
                        onClick={() => {
                          const url = `https://www.google.com/maps/dir/${userLocation[0]},${userLocation[1]}/${resource.latitude},${resource.longitude}`;
                          window.open(url, "_blank");
                        }}
                        className="w-full mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                         Get Directions
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Routing Component */}
          {routeDestination && userLocation && (
            <SimpleRouting
              start={userLocation}
              end={routeDestination}
              onRoutingComplete={setRoutingInfo}
            />
          )}
        </MapContainer>
      )}

      {/* Routing Information Panel */}
      {routingInfo && (
        <div className={`border-l-4 p-4 mb-4 ${routingInfo.error ? 'bg-red-50 border-red-400' : 'bg-blue-50 border-blue-400'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`text-lg font-semibold mb-2 ${routingInfo.error ? 'text-red-800' : 'text-blue-800'}`}>
                🗺️ Route Information
              </h4>
              
              {routingInfo.error ? (
                <div className="text-sm text-red-700">
                  ⚠️ {routingInfo.error}
                </div>
              ) : (
                <div className="flex gap-6 text-sm text-blue-700">
                  <div className="flex items-center gap-1">
                    <span>📏</span>
                    <span><strong>{routingInfo.distance} km</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🕒</span>
                    <span><strong>{routingInfo.time} minutes</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🚗</span>
                    <span>Driving directions</span>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={clearDirections}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white ${
                routingInfo.error 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Clear Route
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white border-t p-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="font-medium text-gray-800 mb-2">Map Legend</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
              <span>Your Location</span>
            </div>
            {filterOptions.slice(1).map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <div className={`w-4 h-4 ${option.color} rounded-full`}></div>
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapView;
