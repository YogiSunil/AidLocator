import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addResource } from '../features/resources/resourceSlice';

const AddResourceForm = ({ onClose }) => {
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const resourceTypes = [
    { value: 'food', label: '🍽️ Food & Meals', icon: '🍽️' },
    { value: 'shelter', label: '🏠 Shelter & Housing', icon: '🏠' },
    { value: 'healthcare', label: '🏥 Healthcare', icon: '🏥' },
    { value: 'mental_health', label: '🧠 Mental Health', icon: '🧠' },
    { value: 'education', label: '📚 Education', icon: '📚' },
    { value: 'employment', label: '💼 Employment', icon: '💼' },
    { value: 'clothing', label: '👕 Clothing', icon: '👕' },
    { value: 'transportation', label: '🚌 Transportation', icon: '🚌' },
    { value: 'legal', label: '⚖️ Legal Aid', icon: '⚖️' },
    { value: 'financial', label: '💰 Financial Aid', icon: '💰' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) newErrors.name = 'Resource name is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.contactInfo.trim()) newErrors.contactInfo = 'Contact information is required';
    if (!form.hours.trim()) newErrors.hours = 'Operating hours are required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const newResource = {
        id: Date.now(),
        ...form,
        latitude: 37.9735 + (Math.random() - 0.5) * 0.01,
        longitude: -122.5311 + (Math.random() - 0.5) * 0.01,
        isAvailable: true,
        dateAdded: new Date().toISOString(),
        rating: 0,
        reviews: []
      };
      
      dispatch(addResource(newResource));
      
      // Reset form
      setForm({
        type: 'food',
        name: '',
        address: '',
        description: '',
        contactInfo: '',
        requirements: '',
        hours: '',
        isDonationPoint: false
      });
      
      // Show success message
      alert('Resource added successfully!');
      if (onClose) onClose();
      
    } catch (error) {
      console.error('Error adding resource:', error);
      alert('Error adding resource. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-4xl">➕</span>
            Add New Resource
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-gray-600 text-lg">Help your community by adding a valuable resource</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Resource Type Selection */}
        <div className="space-y-3">
          <label className="block text-lg font-semibold text-gray-700">
            Resource Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {resourceTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleInputChange('type', type.value)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 hover:shadow-md ${
                  form.type === type.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <span className="text-2xl">{type.icon}</span>
                <span className="text-sm font-medium text-center">{type.label.split(' ').slice(1).join(' ')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-gray-700">
              Resource Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Community Food Bank"
              value={form.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full p-4 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 ${
                errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">⚠️ {errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-lg font-semibold text-gray-700">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="123 Main Street, City, State"
              value={form.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={`w-full p-4 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 ${
                errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">⚠️ {errors.address}</p>}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-lg font-semibold text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Describe the services offered, eligibility requirements, and any important details..."
            value={form.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className={`w-full p-4 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 resize-none ${
              errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            required
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">⚠️ {errors.description}</p>}
        </div>

        {/* Contact and Hours */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-gray-700">
              Contact Information <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Phone: (555) 123-4567 or Email: info@resource.org"
              value={form.contactInfo}
              onChange={(e) => handleInputChange('contactInfo', e.target.value)}
              className={`w-full p-4 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 ${
                errors.contactInfo ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            {errors.contactInfo && <p className="text-red-500 text-sm mt-1">⚠️ {errors.contactInfo}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-lg font-semibold text-gray-700">
              Operating Hours <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Mon-Fri 9AM-5PM, Sat 10AM-2PM"
              value={form.hours}
              onChange={(e) => handleInputChange('hours', e.target.value)}
              className={`w-full p-4 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 ${
                errors.hours ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            {errors.hours && <p className="text-red-500 text-sm mt-1">⚠️ {errors.hours}</p>}
          </div>
        </div>

        {/* Requirements */}
        <div className="space-y-2">
          <label className="block text-lg font-semibold text-gray-700">
            Requirements or Eligibility
          </label>
          <input
            type="text"
            placeholder="e.g., ID required, income verification, age restrictions (optional)"
            value={form.requirements}
            onChange={(e) => handleInputChange('requirements', e.target.value)}
            className="w-full p-4 border-2 border-gray-300 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>

        {/* Donation Point Toggle */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
          <input
            type="checkbox"
            id="isDonationPoint"
            checked={form.isDonationPoint}
            onChange={(e) => handleInputChange('isDonationPoint', e.target.checked)}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isDonationPoint" className="text-lg font-medium text-gray-700 cursor-pointer">
            <span className="mr-2">📦</span>
            This location accepts donations
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-4 px-8 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
            } text-white`}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                Adding Resource...
              </>
            ) : (
              <>
                <span>✨</span>
                Add Resource
              </>
            )}
          </button>
          
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddResourceForm;


