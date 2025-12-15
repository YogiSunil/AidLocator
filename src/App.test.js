import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
// Mock react-leaflet to avoid ESM parsing issues in Jest
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: () => <div data-testid="tile" />, 
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  useMap: () => ({})
}));

// Mock leaflet CSS import used in Mapview
jest.mock('leaflet/dist/leaflet.css', () => ({}));

// Mock leaflet itself to a minimal stub
jest.mock('leaflet', () => {
  const IconCtor = function Icon() {};
  IconCtor.Default = { prototype: {}, mergeOptions: jest.fn() };
  return {
    Icon: IconCtor,
    polyline: jest.fn(() => ({ addTo: jest.fn(), getBounds: jest.fn() })),
  };
});

import App from './App';

test('renders AidLocator title', () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  const titleElement = screen.getByText(/AidLocator/i);
  expect(titleElement).toBeInTheDocument();
});
