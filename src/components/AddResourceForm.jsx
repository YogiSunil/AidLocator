import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addResource } from '../features/resources/resourceSlice';

const AddResourceForm = () => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    type: 'food',
    name: '',
    address: '',
    description: '',
    contactInfo: '',
    requirements: '',
    hours: '',
    isDonationPoint: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newResource = {
      id: Date.now(),
      ...form,
      latitude: 37.9735,
      longitude: -122.5311,
      isAvailable: true
    };
    dispatch(addResource(newResource));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-bold">Add Resource</h2>
        <input
          type="text"
          placeholder="Resource Name"
          value={form.name}
          onChange={(e) => setForm({...form, name: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({...form, address: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Add Resource
        </button>
      </form>
    </div>
  );
};

export default AddResourceForm;
