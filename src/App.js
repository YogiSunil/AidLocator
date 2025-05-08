import React from 'react';
import MapView from './components/Mapview';
import AddResourceForm from './components/AddResourceForm';
import { useDispatch, useSelector } from 'react-redux';
import { setMode } from './features/resources/resourceSlice';

function App() {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.resources.mode);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-4">AidLocator</h1>

      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => dispatch(setMode('need'))}
          className={`px-4 py-2 rounded ${
            mode === 'need' ? 'bg-blue-600 text-white' : 'bg-white border'
          }`}
        >
          Need Help
        </button>
        <button
          onClick={() => dispatch(setMode('help'))}
          className={`px-4 py-2 rounded ${
            mode === 'help' ? 'bg-green-600 text-white' : 'bg-white border'
          }`}
        >
          Help Someone
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <MapView />
        </div>

        {mode === 'help' && (
          <div className="bg-white p-4 rounded shadow">
            <AddResourceForm />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
