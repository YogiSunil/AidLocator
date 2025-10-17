import React, { useState, useEffect } from 'react';
import MapView from './components/Mapview';
import AddResourceForm from './components/AddResourceForm';
import AddResourceModal from './components/AddResourceModal';
import NearbyResourceList from './components/NearbyResourceList';
import Chatbot from './components/Chatbot';
import EmergencyHeader from './components/EmergencyHeader';
import SearchInterface from './components/SearchInterface';
import { useDispatch, useSelector } from 'react-redux';
import { setMode, updateResources } from './features/resources/resourceSlice';
import ResourceAPIService from './services/resourceAPI';

function App() {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.resources.mode);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);

  // Load initial resources with enhanced location accuracy
  useEffect(() => {
    const loadInitialResources = async () => {
      try {
        // Enhanced geolocation with multiple fallback attempts
        const position = await new Promise((resolve, reject) => {
          let attempts = 0;
          const maxAttempts = 3;
          
          const tryGetLocation = () => {
            attempts++;
            navigator.geolocation.getCurrentPosition(
              resolve,
              (error) => {
                if (attempts < maxAttempts) {
                  // Try again with less accuracy requirements
                  setTimeout(tryGetLocation, 1000);
                } else {
                  reject(error);
                }
              },
              {
                enableHighAccuracy: attempts === 1, // First attempt with high accuracy
                timeout: attempts === 1 ? 15000 : 8000, // Longer timeout for first attempt
                maximumAge: attempts === 1 ? 30000 : 300000 // Allow older location on retries
              }
            );
          };
          
          tryGetLocation();
        });

        const { latitude, longitude } = position.coords;

        // Load resources with user's actual location
        const resources = await ResourceAPIService.searchAllResources(latitude, longitude, 'all');       
        dispatch(updateResources(resources));

      } catch (error) {        try {
          // Try IP-based geolocation as fallback
          const ipLocation = await fetch('https://ipapi.co/json/');
          const ipData = await ipLocation.json();
          
          if (ipData.latitude && ipData.longitude) {
            const resources = await ResourceAPIService.searchAllResources(ipData.latitude, ipData.longitude, 'all');
            dispatch(updateResources(resources));
            return;
          }
        } catch (ipError) {
          // Final fallback to default coordinates (San Francisco Bay Area)
        }
        
        // Final fallback to default coordinates (San Francisco Bay Area)
        const defaultLat = 37.9735;
        const defaultLng = -122.5311;
        const resources = await ResourceAPIService.searchAllResources(defaultLat, defaultLng, 'all');
        dispatch(updateResources(resources));
      }
    };

    loadInitialResources();
  }, [dispatch]);

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
                onClick={() => setShowAddResourceModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2"
              >
                <span>➕</span>
                <span className="hidden sm:inline">Add Resource</span>
              </button>
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

        {/* Main Content Area */}
        <div className="mt-8">
          {mode === 'need' ? (
            <div className="flex flex-col xl:flex-row gap-6 min-h-screen relative">
              {/* Sticky Floating Map */}
              <div className="xl:w-2/3 xl:sticky xl:top-4 xl:self-start floating-map">
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 h-full">
                  <MapView />
                </div>
              </div>
              
              {/* Scrollable Resource List */}
              <div className="xl:w-1/3 min-w-0 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden resource-scroll-area">
                  <NearbyResourceList />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Help Mode Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white text-center">
                <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
                  <span className="text-4xl">🤝</span>
                  Help Your Community
                </h2>
                <p className="text-lg opacity-90">
                  Add a resource to help others in need find the support they're looking for
                </p>
              </div>

              <div className="flex flex-col xl:flex-row gap-6 min-h-screen">
                <div className="flex-1 xl:w-2/3">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full">
                    <div className="p-4 bg-gray-50 border-b">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <span>🗺️</span>
                        Resource Locations
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        See where other resources are located and add yours to the map
                      </p>
                    </div>
                    <MapView />
                  </div>
                </div>
                <div className="xl:w-1/3 min-w-0">
                  <AddResourceForm />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button for Add Resource */}
      <button
        onClick={() => setShowAddResourceModal(true)}
        className="fixed bottom-20 right-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 z-40 group"
        title="Add a new resource to help your community"
      >
        <span className="text-2xl">➕</span>
        <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-black text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Add Resource
        </div>
      </button>

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

      {/* Add Resource Modal */}
      <AddResourceModal 
        isOpen={showAddResourceModal} 
        onClose={() => setShowAddResourceModal(false)} 
      />
    </div>
  );
}

export default App;
