
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { addResource } from '../features/resources/resourceSlice';

const AiLocationSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.post('https://api.aimlapi.com/v1/chat/completions', {
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [
          {
            role: "system",
            content: "You are an aid location assistant. Help users find nearby resources."
          },
          {
            role: "user",
            content: `Find aid locations near ${searchQuery}`
          }
        ],
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_AI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const suggestions = response.data.choices[0].message.content;
      // Parse AI suggestions and add them as resources
      const locations = JSON.parse(suggestions);
      locations.forEach(location => dispatch(addResource(location)));
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Find Aid Locations</h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter your location"
          className="flex-grow p-2 border rounded"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </div>
  );
};

export default AiLocationSearch;
