import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addResource } from '../features/resources/resourceSlice';
import axios from 'axios';

function AddResourceForm() {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: '',
    type: '',
    address: '',
    city: '',
    state: '',
    isAvailable: false,
    isDonationPoint: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: `${form.address}, ${form.city}, ${form.state}`,
          format: 'json',
        },
      });

      if (res.data.length === 0) {
        alert('Address not found.');
        return;
      }

      const { lat, lon, display_name } = res.data[0];

      dispatch(addResource({
        ...form,
        lat: parseFloat(lat),
        lng: parseFloat(lon),
        address: display_name,
      }));

      setForm({
        name: '',
        type: '',
        address: '',
        city: '',
        state: '',
        isAvailable: false,
        isDonationPoint: true,
      });
    } catch (error) {
      console.error('Geocoding failed', error);
      alert('Unable to geocode address.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="mt-4 flex flex-col bg-gray-100 rounded-lg p-4 shadow-sm">
        <h2 className="text-black font-bold text-lg">Add Donation Point</h2>

        <div className="mt-4">
          <label className="text-black" htmlFor="name">Name</label>
          <input
            placeholder="Your name"
            className="w-full bg-white rounded-md border-gray-300 text-black px-2 py-1"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mt-4">
          <label className="text-black" htmlFor="type">Type</label>
          <select
            className="w-full bg-white rounded-md border-gray-300 text-black px-2 py-1"
            name="type"
            value={form.type}
            onChange={handleChange}
            required
          >
            <option value="">Select Type</option>
            <option value="Food">Food</option>
            <option value="Shelter">Shelter</option>
            <option value="Medical">Medical</option>
            <option value="Water">Water</option>
            <option value="Clothing">Clothing</option>
          </select>
        </div>

        <div className="mt-4">
          <label className="text-black" htmlFor="city">City</label>
          <input
            placeholder="Your city"
            className="w-full bg-white rounded-md border-gray-300 text-black px-2 py-1"
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mt-4">
          <label className="text-black" htmlFor="state">State</label>
          <input
            placeholder="Your state"
            className="w-full bg-white rounded-md border-gray-300 text-black px-2 py-1"
            type="text"
            name="state"
            value={form.state}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mt-4">
          <label className="text-black" htmlFor="address">Address</label>
          <textarea
            placeholder="Your address"
            className="w-full bg-white rounded-md border-gray-300 text-black px-2 py-1"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            className="bg-white text-black rounded-md px-4 py-1 hover:bg-gray-200 hover:text-gray-900"
            type="submit"
          >
            Submit
          </button>
        </div>
      </div>
    </form>
  );
}

export default AddResourceForm;
