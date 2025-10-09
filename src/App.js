import React, { useState } from 'react';
import MapView from './components/Mapview';
import AddResourceForm from './components/AddResourceForm';
import NearbyResourceList from './components/NearbyResourceList';
import Chatbot from './components/Chatbot';
import EmergencyHeader from './components/EmergencyHeader';
import QuickAccessCategories from './components/QuickAccessCategories';
import LocationDisplay from './components/LocationDisplay';
import SearchInterface from './components/SearchInterface';
import { useDispatch, useSelector } from 'react-redux';
import { setMode } from './features/resources/resourceSlice';
import AiLocationSearch from './components/AiLocationSearch';

function App() {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.resources.mode);
  const [showChatbot, setShowChatbot] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Emergency Header */}
      <EmergencyHeader />
      
      {/* Main Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-blue-600">🆘 AidLocator</div>
              <div className="hidden md:block text-sm text-gray-600">
                Connecting communities with resources
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowChatbot(!showChatbot)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition-colors"
              >
                💬 AI Assistant
              </button>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold transition-colors">
                🚨 Emergency
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Location Display */}
        <LocationDisplay />

        {/* Mode Toggle */}
        <div className="mb-6">
          <div className="flex bg-white rounded-xl border-2 border-blue-200 p-2 shadow-lg max-w-md mx-auto">
            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="need"
                className="sr-only peer"
                checked={mode === 'need'}
                onChange={() => dispatch(setMode('need'))}
              />
              <div className="text-center py-3 px-6 rounded-lg peer-checked:bg-blue-600 peer-checked:text-white peer-checked:shadow-lg text-blue-600 font-semibold transition-all duration-200 hover:bg-blue-50">
                🙏 Need Help
              </div>
            </label>
            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="help"
                className="sr-only peer"
                checked={mode === 'help'}
                onChange={() => dispatch(setMode('help'))}
              />
              <div className="text-center py-3 px-6 rounded-lg peer-checked:bg-green-600 peer-checked:text-white peer-checked:shadow-lg text-green-600 font-semibold transition-all duration-200 hover:bg-green-50">
                🤝 Help Someone
              </div>
            </label>
          </div>
        </div>

        {/* Search Interface */}
        <SearchInterface />

        {/* Quick Access Categories */}
        {mode === 'need' && <QuickAccessCategories />}

        {/* Main Content Area */}
        <div className="mt-8">
          {mode === 'need' ? (
            <div className="flex flex-col xl:flex-row gap-6 min-h-screen">
              <div className="flex-1 xl:w-2/3">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full">
                  <MapView />
                </div>
              </div>
              <div className="xl:w-1/3 min-w-0">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full">
                  <NearbyResourceList />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col xl:flex-row gap-6 min-h-screen">
              <div className="flex-1 xl:w-2/3">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full">
                  <MapView />
                </div>
              </div>
              <div className="xl:w-1/3 min-w-0">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full">
                  <AddResourceForm />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chatbot */}
      {showChatbot && (
        <div className="fixed bottom-4 right-4 z-50 w-80 md:w-96">
          <div className="bg-white rounded-lg shadow-2xl border">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-800">AI Assistant</h3>
              <button
                onClick={() => setShowChatbot(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <Chatbot />
          </div>
        </div>
      )}

      <AiLocationSearch />
    </div>
  );
}

export default App;
