import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setMode } from '../features/resources/resourceSlice';

const QuickAccessCategories = () => {
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { 
      id: 'food', 
      name: 'Food', 
      icon: '🍽️', 
      description: 'Food banks, pantries, meals',
      color: 'bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200'
    },
    { 
      id: 'shelter', 
      name: 'Shelter', 
      icon: '🏠', 
      description: 'Emergency housing, shelters',
      color: 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200'
    },
    { 
      id: 'medical', 
      name: 'Medical', 
      icon: '🏥', 
      description: 'Healthcare, clinics, mental health',
      color: 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200'
    },
    { 
      id: 'financial', 
      name: 'Financial', 
      icon: '💰', 
      description: 'Benefits, assistance programs',
      color: 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
    },
    { 
      id: 'education', 
      name: 'Education', 
      icon: '📚', 
      description: 'Schools, training, literacy',
      color: 'bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200'
    },
    { 
      id: 'legal', 
      name: 'Legal', 
      icon: '⚖️', 
      description: 'Legal aid, immigration help',
      color: 'bg-indigo-100 border-indigo-300 text-indigo-800 hover:bg-indigo-200'
    },
    { 
      id: 'employment', 
      name: 'Employment', 
      icon: '🔧', 
      description: 'Job training, career services',
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200'
    },
    { 
      id: 'other', 
      name: 'Other Services', 
      icon: '🌟', 
      description: 'Transportation, utilities, more',
      color: 'bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200'
    }
  ];

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    // Here you could dispatch an action to filter resources by category
    console.log('Selected category:', categoryId);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          What do you need help with?
        </h2>
        <p className="text-gray-600">
          Select a category to find nearby resources
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className={`
              ${category.color}
              ${selectedCategory === category.id ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}
              border-2 rounded-xl p-4 text-center transition-all duration-200 transform hover:scale-105 hover:shadow-lg
            `}
          >
            <div className="text-3xl mb-2">{category.icon}</div>
            <h3 className="font-bold text-lg mb-1">{category.name}</h3>
            <p className="text-sm opacity-80">{category.description}</p>
          </button>
        ))}
      </div>

      {selectedCategory && (
        <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-800">
                🔍 Searching for {categories.find(c => c.id === selectedCategory)?.name} resources near you...
              </p>
            </div>
            <button
              onClick={() => setSelectedCategory('')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickAccessCategories;