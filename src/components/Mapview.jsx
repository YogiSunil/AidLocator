import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useSelector } from 'react-redux';
import axios from 'axios';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

function MapView() {
  const [position, setPosition] = useState([51.505, -0.09]);
  const [address, setAddress] = useState('');
  const { items, mode } = useSelector((state) => state.resources);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      () => alert("Geolocation denied. Showing default location.")
    );
  }, []);

  const handleAddressSearch = async () => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            q: address,
            format: 'json',
          },
        }
      );
      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setPosition([parseFloat(lat), parseFloat(lon)]);
      } else {
        alert('Location not found.');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      alert('Failed to fetch location.');
    }
  };

  const filteredResources = items.filter((r) =>
    mode === 'need' ? r.isAvailable : r.isDonationPoint
  );

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter an address or location"
          className="border p-2 rounded w-full"
        />
        <button
          onClick={handleAddressSearch}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Search Location
        </button>
      </div>
      <MapContainer center={position} zoom={13} style={{ height: '75vh', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredResources.map((r, index) => (
          <Marker key={index} position={[r.lat, r.lng]}>
            <Popup>
              <strong>{r.name}</strong><br />
              Type: {r.type}<br />
              {mode === 'need' && r.isAvailable && <span>✅ Available</span>}
              {mode === 'help' && r.isDonationPoint && <div>📦 Donation Point</div>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;
