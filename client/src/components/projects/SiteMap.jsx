import React from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px'
};

export default function SiteMap({ latitude, longitude, radiusMeters, name }) {
  // Default to a central coordinate if none provided
  const lat = latitude || 28.6139; 
  const lng = longitude || 77.2090; 
  const radius = radiusMeters || 250;

  const center = { lat, lng };

  // Load the Google Maps script using the API key from .env
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  if (!isLoaded) {
    return (
      <div style={{ height: '400px', width: '100%', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
        <span style={{ color: '#64748b', fontWeight: 600 }}>Loading Official Google Maps...</span>
      </div>
    );
  }

  // Check if API key is missing
  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div style={{ height: '400px', width: '100%', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', textAlign: 'center', padding: '2rem' }}>
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Google Maps API Key Missing</h4>
          <p style={{ fontSize: '0.85rem' }}>Please add VITE_GOOGLE_MAPS_API_KEY to your client/.env file.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
        }}
      >
        {latitude && longitude && (
          <>
            <Marker position={center} title={name} />
            <Circle 
              center={center} 
              radius={radius} 
              options={{
                fillColor: '#3b82f6',
                fillOpacity: 0.2,
                strokeColor: '#1e3a8a',
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
            />
          </>
        )}
      </GoogleMap>
    </div>
  );
}
