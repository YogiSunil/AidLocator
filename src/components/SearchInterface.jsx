import React, { useState } from 'react';

const SearchInterface = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Here you would dispatch a search action
    }
  };

  const startVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsVoiceActive(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsVoiceActive(false);
      };

      recognition.onerror = () => {
        setIsVoiceActive(false);
      };

      recognition.onend = () => {
        setIsVoiceActive(false);
      };

      recognition.start();
    } else {
      alert('Voice search not supported in your browser');
    }
  };

  const suggestedSearches = [
    "Food bank open now",
    "Emergency shelter with beds",
    "Free medical clinic",
    "Job training programs",
    "Legal aid for immigration"
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          🔍 AI-Powered Search
        </h2>
        <p className="text-gray-600">
          Describe your situation in natural language
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g., 'I need food assistance near downtown' or 'Emergency shelter for families'"
            className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none transition-all"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-2">
            <button
              type="button"
              onClick={startVoiceSearch}
              className={`
                p-2 rounded-lg transition-colors
                ${isVoiceActive 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }
              `}
              title="Voice Search"
            >
              {isVoiceActive ? '🎤' : '🎙️'}
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {/* Quick Search Suggestions */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">💡 Try these searches:</p>
        <div className="flex flex-wrap gap-2">
          {suggestedSearches.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setSearchQuery(suggestion)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm transition-colors border border-gray-300"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Search Filters */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-medium text-gray-700">Quick Filters:</span>
          
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Distances</option>
            <option value="0.5">Within 0.5 miles</option>
            <option value="1">Within 1 mile</option>
            <option value="5">Within 5 miles</option>
          </select>
          
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Any Time</option>
            <option value="open">Open Now</option>
            <option value="24h">24/7 Available</option>
          </select>
          
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm text-gray-700">No requirements</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm text-gray-700">Family-friendly</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SearchInterface;