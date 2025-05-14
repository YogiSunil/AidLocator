import React from 'react';
import MapView from './components/Mapview';
import AddResourceForm from './components/AddResourceForm';
import NearbyResourceList from './components/NearbyResourceList';
import { useDispatch, useSelector } from 'react-redux';
import { setMode } from './features/resources/resourceSlice';
import AiLocationSearch from './components/AiLocationSearch';

function App() {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.resources.mode);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-pink-100 via-blue-100 to-blue-200">
      <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] bg-conic-gradient from-pink-300 via-yellow-200 to-blue-300 transform -translate-x-1/2 -translate-y-1/2 animate-spin-slow blur-xl opacity-80"></div>
      <div className="absolute top-1/2 left-1/2 w-[180%] h-[180%] bg-conic-gradient from-pink-300 via-yellow-200 to-blue-300 transform -translate-x-1/2 -translate-y-1/2 animate-spin-reverse-slow blur-xl opacity-60"></div>
      <div className="relative z-10 min-h-screen p-4">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-4">AidLocator</h1>

        <div className="flex space-x-2 border-[3px] border-purple-400 rounded-xl select-none mb-4">
          <label className="radio flex flex-grow items-center justify-center rounded-lg p-1 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="need"
              className="peer hidden"
              checked={mode === 'need'}
              onChange={() => dispatch(setMode('need'))}
            />
            <span className="tracking-widest peer-checked:bg-gradient-to-r peer-checked:from-[blueviolet] peer-checked:to-[violet] peer-checked:text-white text-gray-700 p-2 rounded-lg transition duration-150 ease-in-out">
              Need Help
            </span>
          </label>

          <label className="radio flex flex-grow items-center justify-center rounded-lg p-1 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="help"
              className="peer hidden"
              checked={mode === 'help'}
              onChange={() => dispatch(setMode('help'))}
            />
            <span className="tracking-widest peer-checked:bg-gradient-to-r peer-checked:from-[blueviolet] peer-checked:to-[violet] peer-checked:text-white text-gray-700 p-2 rounded-lg transition duration-150 ease-in-out">
              Help Someone
            </span>
          </label>
        </div>

        {mode === 'need' ? (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <MapView />
            </div>
            <div className="md:col-span-1">
              <NearbyResourceList />
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <MapView />
            </div>
            <div className="bg-white p-4 rounded shadow">
              <AddResourceForm />
            </div>
          </div>
        )}
      </div>
      <AiLocationSearch />
    </div>
  );
}

export default App;
