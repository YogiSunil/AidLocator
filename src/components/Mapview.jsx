import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { findShortestPath } from '../utils/routeAlgorithm';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

function MapView() {
  const [position, setPosition] = useState([51.505, -0.09]);
  const [address, setAddress] = useState('');
  const [filterType] = useState(''); // New state for filtering by type
  const [searchedPosition, setSearchedPosition] = useState(null); // New state for searched location
  const [routePath, setRoutePath] = useState([]); // New state for route path
  const [filteredResources, setFilteredResources] = useState([]); // New state for filtered resources
  const { resources, mode } = useSelector((state) => state.resources);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userPosition = [pos.coords.latitude, pos.coords.longitude];
        setPosition(userPosition); // Center the map on the user's location
      },
      () => alert("Geolocation denied. Showing default location.")
    );
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userPosition = [pos.coords.latitude, pos.coords.longitude];
        setPosition(userPosition);

        // Automatically filter resources near the user's location
        const nearbyResources = resources.filter((r) => {
          const distance = Math.sqrt(
            Math.pow(r.latitude - userPosition[0], 2) + Math.pow(r.longitude - userPosition[1], 2)
          );
          return distance < 0.5; // Increased threshold for "nearby" to 0.5
        });

        setFilteredResources(nearbyResources);
      },
      () => alert("Geolocation denied. Showing default location.")
    );
  }, [resources]);

  useEffect(() => {
    if (position && searchedPosition) {
      const start = position;
      const end = searchedPosition;

      // Convert coordinates to a graph-like structure for Dijkstra's algorithm
      const graph = {
        [start]: { [end]: Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2)) },
        [end]: { [start]: Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2)) },
      };

      const { path } = findShortestPath(start, end, graph);

      // Logic to display the path on the map
      setRoutePath(path);
    }
  }, [position, searchedPosition]);

  const handleAddressSearch = async () => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: { q: address, format: 'json' },
      });

      if (res.data.length > 0) {
        const { lat, lon } = res.data[0];
        const searchedPosition = [parseFloat(lat), parseFloat(lon)];
        setSearchedPosition(searchedPosition); // Center the map on the searched location
      } else {
        alert('Location not found.');
      }
    } catch (error) {
      alert('Failed to fetch location.');
    }
  };

  useEffect(() => {
    const filtered = resources.filter((r) => {
      const matchesMode = mode === 'need' ? r.isAvailable : r.isDonationPoint;
      const matchesType = filterType ? r.type.toLowerCase() === filterType.toLowerCase() : true;
      return matchesMode && matchesType;
    });
    setFilteredResources(filtered);
  }, [resources, mode, filterType]);

  useEffect(() => {
    if (!position) return;

    const filtered = resources.filter((r) => {
      const matchesMode = mode === 'need' ? r.isAvailable : r.isDonationPoint;
      const matchesType = filterType ? r.type.toLowerCase() === filterType.toLowerCase() : true;

      // Calculate distance in kilometers
      const R = 6371;
      const dLat = (r.latitude - position[0]) * Math.PI / 180;
      const dLon = (r.longitude - position[1]) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(position[0] * Math.PI / 180) * Math.cos(r.latitude * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      return matchesMode && matchesType && (searchedPosition ? true : distance < 10);
    });
    setFilteredResources(filtered);
  }, [resources, mode, filterType, position, searchedPosition]);

  return (
    <div>
      <div className="flex items-center justify-center p-5">
        <div className="rounded-lg bg-gray-200 p-5">
          <div className="flex">
            <div className="flex w-10 items-center justify-center rounded-tl-lg rounded-bl-lg border-r border-gray-200 bg-white p-5">
              <svg viewBox="0 0 20 20" aria-hidden="true" className="pointer-events-none absolute w-5 fill-gray-500 transition">
                <path d="M16.72 17.78a.75.75 0 1 0 1.06-1.06l-1.06 1.06ZM9 14.5A5.5 5.5 0 0 1 3.5 9H2a7 7 0 0 0 7 7v-1.5ZM3.5 9A5.5 5.5 0 0 1 9 3.5V2a7 7 0 0 0-7 7h1.5ZM9 3.5A5.5 5.5 0 0 1 14.5 9H16a7 7 0 0 0-7-7v1.5Zm3.89 10.45 3.83 3.83 1.06-1.06-3.83-3.83-1.06 1.06ZM14.5 9a5.48 5.48 0 0 1-1.61 3.89l1.06 1.06A6.98 6.98 0 0 0 16 9h-1.5Zm-1.61 3.89A5.48 5.48 0 0 1 9 14.5V16a6.98 6.98 0 0 0 4.95-2.05l-1.06-1.06Z"></path>
              </svg>
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Search location"
              className="w-full max-w-[160px] bg-white pl-2 text-base font-semibold outline-0"
            />
            <input
              type="button"
              value="Search"
              onClick={handleAddressSearch}
              className="bg-blue-500 p-2 rounded-tr-lg rounded-br-lg text-white font-semibold hover:bg-blue-800 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="flex-grow relative">
          <MapContainer center={searchedPosition || position || [0, 0]} zoom={13} style={{ height: '75vh', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {position && (
              <Marker position={position}>
                <Popup>Your Current Location</Popup>
              </Marker>
            )}
            {searchedPosition && (
              <Marker position={searchedPosition}>
                <Popup>Searched Location</Popup>
              </Marker>
            )}
            {searchedPosition && position && (
              <TileLayer
                url={`https://router.project-osrm.org/route/v1/driving/${position[1]},${position[0]};${searchedPosition[1]},${searchedPosition[0]}?overview=full&geometries=geojson`}
                attribution="&copy; OpenStreetMap contributors"
              />
            )}
            {routePath.length > 0 && (
              <Polyline
                positions={routePath.map(([lat, lng]) => [lat, lng])}
                color="blue"
              />
            )}
            {filteredResources.map((r, index) => (
              <Marker key={index} position={[r.latitude, r.longitude]}>
                <Popup>
                  <strong>{r.name}</strong><br />
                  Type: {r.type}<br />
                  Address: {r.address || 'N/A'}<br />
                  {mode === 'need' && r.isAvailable && <span>✅ Available</span>}
                  {mode === 'help' && r.isDonationPoint && <div>📦 Donation Point</div>}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default MapView;
