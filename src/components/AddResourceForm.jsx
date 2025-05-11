import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addResource } from '../features/resources/resourceSlice';

function AddResourceForm() {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: '',
    type: '',
    lat: '',
    lng: '',
    isAvailable: false,
    isDonationPoint: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(addResource(form));
    setForm({
      name: '',
      type: '',
      lat: '',
      lng: '',
      isAvailable: false,
      isDonationPoint: false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="text-xl font-semibold mb-2">Add Resource</h2>

      <input
        type="text"
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />

      <select
        name="type"
        value={form.type}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      >
        <option value="">Select Type</option>
        <option value="Food">Food</option>
        <option value="Shelter">Shelter</option>
        <option value="Medical">Medical</option>
        <option value="Water">Water</option>
        <option value="Clothing">Clothing</option>
      </select>

      <input
        type="number"
        step="any"
        name="lat"
        placeholder="Latitude"
        value={form.lat}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />

      <input
        type="number"
        step="any"
        name="lng"
        placeholder="Longitude"
        value={form.lng}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isAvailable"
          checked={form.isAvailable}
          onChange={handleChange}
        />
        <label>Available Resource</label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isDonationPoint"
          checked={form.isDonationPoint}
          onChange={handleChange}
        />
        <label>Donation Point</label>
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Add Resource
      </button>
    </form>
  );
}

export default AddResourceForm;
