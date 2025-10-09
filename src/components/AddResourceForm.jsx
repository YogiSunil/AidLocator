import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addResource, clearResourceError } from '../features/resources/resourceSlice';

const AddResourceForm = () => {
  const dispatch = useDispatch();
  const resourceError = useSelector((state) => state.resources.error);
  const [form, setForm] = useState({
    type: 'food',
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    requirements: '',
    latitude: null,
    longitude: null,
    isAvailable: true,
    isDonationPoint: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const contactInfo = [form.phone, form.email].filter(Boolean).join('  ');
    dispatch(addResource({ ...form, contactInfo }));
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2"> Add New Resource</h2>
        <p className="text-gray-600">Help your community by adding a resource</p>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Organization Name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            required
          />
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          >
            <option value="food"> Food</option>
            <option value="shelter"> Shelter</option>
            <option value="medical"> Medical</option>
            <option value="water"> Water</option>
          </select>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description of services"
            rows="3"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            required
          />
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Street Address"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="City"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="text"
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="State"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
          >
             Add Resource
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddResourceForm;
