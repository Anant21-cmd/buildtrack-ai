import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle, InfoWindow } from '@react-google-maps/api';
import { MapPin, Layers, ExternalLink, Compass, Search, Loader2, CheckCircle2 } from 'lucide-react';
import { geocodeAddress } from '../../utils/geocoding';

const containerStyle = {
  width: '100%',
  height: '420px',
  borderRadius: '12px'
};

export default function SiteMap({ latitude, longitude, radiusMeters, name, location, onLocationChange }) {
  const [mapType, setMapType] = useState('hybrid'); // 'hybrid' for real satellite view, 'roadmap' for streets
  const [mapInstance, setMapInstance] = useState(null);
  const [showInfo, setShowInfo] = useState(true);

  // Initial coordinates resolution
  const initialLat = Number(latitude);
  const initialLng = Number(longitude);
  const isDemoChicago = initialLat > 41 && initialLat < 43 && initialLng < -80;

  const getInitialCoords = () => {
    if (initialLat && initialLng && !isDemoChicago) {
      return { lat: initialLat, lng: initialLng };
    }
    if ((location && location.toLowerCase().includes('kovilpatti')) || (name && name.toLowerCase().includes('bala'))) {
      return { lat: 9.1724, lng: 77.8687 };
    }
    if (name && name.toLowerCase().includes('mohan')) {
      return { lat: 9.1745, lng: 77.8710 };
    }
    return { lat: 9.1724, lng: 77.8687 };
  };

  const [coords, setCoords] = useState(getInitialCoords);
  const [searchAddress, setSearchAddress] = useState(location || '');
  const [isLocating, setIsLocating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const radius = Number(radiusMeters) || 250;

  // Automatically geocode address if coordinates are missing or default
  useEffect(() => {
    if (initialLat && initialLng && !isDemoChicago) {
      setCoords({ lat: initialLat, lng: initialLng });
    } else if (location && location.trim()) {
      geocodeAddress(location).then((res) => {
        if (res && res.lat && res.lng) {
          setCoords({ lat: res.lat, lng: res.lng });
          setStatusMessage(`Located: ${res.name || location}`);
        }
      });
    }
    if (location) {
      setSearchAddress(location);
    }
  }, [latitude, longitude, location]);

  // Load Google Maps API script
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey
  });

  // Pan map when coordinates change
  useEffect(() => {
    if (mapInstance && coords.lat && coords.lng) {
      mapInstance.panTo(coords);
    }
  }, [mapInstance, coords.lat, coords.lng]);

  const handleLocateAddress = async (e) => {
    if (e) e.preventDefault();
    if (!searchAddress || !searchAddress.trim()) return;

    setIsLocating(true);
    setStatusMessage('Locating address on satellite map...');

    try {
      const res = await geocodeAddress(searchAddress.trim());
      if (res && res.lat && res.lng) {
        const newCoords = { lat: res.lat, lng: res.lng };
        setCoords(newCoords);
        setStatusMessage(`Pinned: ${res.name || searchAddress}`);
        if (mapInstance) {
          mapInstance.panTo(newCoords);
          mapInstance.setZoom(17);
        }
        if (onLocationChange) {
          onLocationChange({
            latitude: res.lat,
            longitude: res.lng,
            location: searchAddress.trim()
          });
        }
      } else {
        setStatusMessage('Could not pinpoint address. Showing approximate region.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setStatusMessage('Error locating address.');
    } finally {
      setIsLocating(false);
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;

  // Fallback: If Google Maps JS API fails or is not loaded yet, use official Google Satellite embed
  const renderFallbackMap = () => (
    <div style={{ position: 'relative', width: '100%', height: '420px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <iframe
        key={`${coords.lat}-${coords.lng}-${mapType}`}
        title="Real Satellite Map"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&t=${mapType === 'roadmap' ? 'm' : 'k'}&z=17&ie=UTF8&iwloc=&output=embed`}
      />
      {/* Geofence Overlay Badge */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        color: '#ffffff',
        padding: '0.45rem 0.85rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backdropFilter: 'blur(6px)',
        zIndex: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}>
        <Compass size={14} style={{ color: '#38bdf8' }} />
        <span>Live Site Geofence: &plusmn;{radius}m Radius ({coords.lat.toFixed(5)}° N, {coords.lng.toFixed(5)}° E)</span>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Address Search Bar: Type physical address to locate in real time */}
      <form onSubmit={handleLocateAddress} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <MapPin size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#0284c7' }} />
          <input
            type="text"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            placeholder="Type physical address (e.g., KR Nagar, Kovilpatti or Anna Nagar, Madurai)..."
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem 0.55rem 2.2rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.825rem',
              outline: 'none',
              backgroundColor: '#f8fafc',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#0284c7'}
            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
          />
        </div>
        <button
          type="submit"
          disabled={isLocating}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.55rem 0.9rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: isLocating ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background-color 0.15s'
          }}
        >
          {isLocating ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          {isLocating ? 'Locating...' : 'Locate on Map'}
        </button>
      </form>

      {/* Geocoding Status Chip */}
      {statusMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#059669', fontWeight: 600, padding: '0.2rem 0.4rem', backgroundColor: '#ecfdf5', borderRadius: '4px' }}>
          <CheckCircle2 size={13} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Map Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
          <button
            type="button"
            onClick={() => setMapType('hybrid')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: mapType === 'hybrid' ? '#0284c7' : 'transparent',
              color: mapType === 'hybrid' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={14} /> Real Satellite View
          </button>
          <button
            type="button"
            onClick={() => setMapType('roadmap')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: mapType === 'roadmap' ? '#0284c7' : 'transparent',
              color: mapType === 'roadmap' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            <MapPin size={14} /> Street Map
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            GPS: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </span>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#0284c7',
              textDecoration: 'none',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd'
            }}
          >
            <ExternalLink size={13} /> Open in Google Maps
          </a>
        </div>
      </div>

      {/* Map Rendering Container */}
      {(!isLoaded || loadError || !apiKey) ? (
        renderFallbackMap()
      ) : (
        <div style={{ height: '420px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', position: 'relative' }}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={coords}
            zoom={17}
            mapTypeId={mapType}
            onLoad={(map) => setMapInstance(map)}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: true,
              mapTypeControl: false,
              fullscreenControl: true
            }}
          >
            <Marker
              position={coords}
              title={name || 'Project Site'}
              onClick={() => setShowInfo(!showInfo)}
            />

            {showInfo && (
              <InfoWindow
                position={coords}
                onCloseClick={() => setShowInfo(false)}
              >
                <div style={{ padding: '0.25rem', maxWidth: '220px' }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                    {name || 'Construction Site'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                    {searchAddress || location || 'Site Location'}
                  </p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
                    Geofence Radius: &plusmn;{radius}m
                  </p>
                </div>
              </InfoWindow>
            )}

            <Circle
              center={coords}
              radius={radius}
              options={{
                fillColor: '#38bdf8',
                fillOpacity: 0.25,
                strokeColor: '#0284c7',
                strokeOpacity: 0.9,
                strokeWeight: 2
              }}
            />
          </GoogleMap>

          {/* Live GPS Geofence Pill Badge */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            color: '#ffffff',
            padding: '0.45rem 0.85rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backdropFilter: 'blur(6px)',
            pointerEvents: 'none',
            zIndex: 5,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            <Compass size={14} style={{ color: '#38bdf8' }} />
            <span>Site Geofence: &plusmn;{radius}m Active ({coords.lat.toFixed(5)}° N, {coords.lng.toFixed(5)}° E)</span>
          </div>
        </div>
      )}
    </div>
  );
}
