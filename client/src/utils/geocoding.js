// Utility to geocode physical address strings to real GPS coordinates

const KNOWN_LOCATIONS = {
  // Kovilpatti & Surrounding Localities
  'kr nagar': { lat: 9.1724, lng: 77.8687, name: 'KR Nagar, Kovilpatti, Tamil Nadu' },
  'k.r. nagar': { lat: 9.1724, lng: 77.8687, name: 'KR Nagar, Kovilpatti, Tamil Nadu' },
  'rajiv nagar': { lat: 9.1745, lng: 77.8710, name: 'Rajiv Nagar, Kovilpatti, Tamil Nadu' },
  'rajivu nagar': { lat: 9.1745, lng: 77.8710, name: 'Rajiv Nagar, Kovilpatti, Tamil Nadu' },
  'kathiresan kovil': { lat: 9.1820, lng: 77.8540, name: 'Kathiresan Kovil, Kovilpatti' },
  'lakshmi mills': { lat: 9.1680, lng: 77.8750, name: 'Lakshmi Mills, Kovilpatti' },
  'old bus stand, kovilpatti': { lat: 9.1730, lng: 77.8690, name: 'Old Bus Stand, Kovilpatti' },
  'new bus stand, kovilpatti': { lat: 9.1700, lng: 77.8660, name: 'New Bus Stand, Kovilpatti' },
  'iluppaiyurani': { lat: 9.1650, lng: 77.8820, name: 'Iluppaiyurani, Kovilpatti' },
  'pandavarmangalam': { lat: 9.1550, lng: 77.8600, name: 'Pandavarmangalam, Kovilpatti' },
  'manthithoppu': { lat: 9.1900, lng: 77.8650, name: 'Manthithoppu, Kovilpatti' },
  'kalugumalai': { lat: 9.1467, lng: 77.7058, name: 'Kalugumalai, Tamil Nadu' },
  'kayathar': { lat: 8.9510, lng: 77.7710, name: 'Kayathar, Tamil Nadu' },
  'kovilpatti': { lat: 9.1724, lng: 77.8687, name: 'Kovilpatti, Tamil Nadu' },

  // Madurai Localities
  'anna nagar, madurai': { lat: 9.9217, lng: 78.1481, name: 'Anna Nagar, Madurai, Tamil Nadu' },
  'kk nagar, madurai': { lat: 9.9280, lng: 78.1420, name: 'KK Nagar, Madurai, Tamil Nadu' },
  'simmakkal': { lat: 9.9270, lng: 78.1210, name: 'Simmakkal, Madurai, Tamil Nadu' },
  'mattuthavani': { lat: 9.9450, lng: 78.1630, name: 'Mattuthavani, Madurai, Tamil Nadu' },
  'madurai': { lat: 9.9252, lng: 78.1198, name: 'Madurai, Tamil Nadu' },

  // Chennai Localities
  't nagar': { lat: 13.0378, lng: 80.2318, name: 'T. Nagar, Chennai, Tamil Nadu' },
  't. nagar': { lat: 13.0378, lng: 80.2318, name: 'T. Nagar, Chennai, Tamil Nadu' },
  'velachery': { lat: 12.9815, lng: 80.2180, name: 'Velachery, Chennai, Tamil Nadu' },
  'omr': { lat: 12.9150, lng: 80.2290, name: 'OMR IT Corridor, Chennai, Tamil Nadu' },
  'guindy': { lat: 13.0067, lng: 80.2025, name: 'Guindy, Chennai, Tamil Nadu' },
  'anna nagar, chennai': { lat: 13.0850, lng: 80.2100, name: 'Anna Nagar, Chennai, Tamil Nadu' },
  'chennai': { lat: 13.0827, lng: 80.2707, name: 'Chennai, Tamil Nadu' },

  // Coimbatore Localities
  'rs puram': { lat: 11.0090, lng: 76.9490, name: 'RS Puram, Coimbatore, Tamil Nadu' },
  'gandhipuram': { lat: 11.0183, lng: 76.9678, name: 'Gandhipuram, Coimbatore, Tamil Nadu' },
  'peelamedu': { lat: 11.0280, lng: 77.0120, name: 'Peelamedu, Coimbatore, Tamil Nadu' },
  'coimbatore': { lat: 11.0168, lng: 76.9558, name: 'Coimbatore, Tamil Nadu' },

  // Other Tamil Nadu Districts & Towns
  'sattur': { lat: 9.3592, lng: 77.9258, name: 'Sattur, Tamil Nadu' },
  'sivakasi': { lat: 9.4532, lng: 77.7972, name: 'Sivakasi, Tamil Nadu' },
  'rajapalayam': { lat: 9.4533, lng: 77.5540, name: 'Rajapalayam, Tamil Nadu' },
  'virudhunagar': { lat: 9.5872, lng: 77.9514, name: 'Virudhunagar, Tamil Nadu' },
  'tirunelveli': { lat: 8.7139, lng: 77.7567, name: 'Tirunelveli, Tamil Nadu' },
  'palayamkottai': { lat: 8.7170, lng: 77.7430, name: 'Palayamkottai, Tamil Nadu' },
  'thoothukudi': { lat: 8.7642, lng: 78.1348, name: 'Thoothukudi, Tamil Nadu' },
  'tuticorin': { lat: 8.7642, lng: 78.1348, name: 'Thoothukudi, Tamil Nadu' },
  'sankarankovil': { lat: 9.1712, lng: 77.5338, name: 'Sankarankovil, Tamil Nadu' },
  'tenkasi': { lat: 8.9594, lng: 77.3150, name: 'Tenkasi, Tamil Nadu' },
  'nagercoil': { lat: 8.1833, lng: 77.4119, name: 'Nagercoil, Tamil Nadu' },
  'kanyakumari': { lat: 8.0883, lng: 77.5385, name: 'Kanyakumari, Tamil Nadu' },
  'trichy': { lat: 10.7905, lng: 78.7047, name: 'Tiruchirappalli, Tamil Nadu' },
  'tiruchirappalli': { lat: 10.7905, lng: 78.7047, name: 'Tiruchirappalli, Tamil Nadu' },
  'salem': { lat: 11.6643, lng: 78.1460, name: 'Salem, Tamil Nadu' },
  'erode': { lat: 11.3410, lng: 77.7172, name: 'Erode, Tamil Nadu' },
  'tiruppur': { lat: 11.1085, lng: 77.3411, name: 'Tiruppur, Tamil Nadu' },
  'dindigul': { lat: 10.3673, lng: 77.9803, name: 'Dindigul, Tamil Nadu' },
  'thanjavur': { lat: 10.7870, lng: 79.1378, name: 'Thanjavur, Tamil Nadu' },

  // Indian Metros
  'bengaluru': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru, Karnataka' },
  'bangalore': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru, Karnataka' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad, Telangana' },
  'kochi': { lat: 9.9312, lng: 76.2673, name: 'Kochi, Kerala' },
  'mumbai': { lat: 19.0760, lng: 72.8777, name: 'Mumbai, Maharashtra' },
  'delhi': { lat: 28.6139, lng: 77.2090, name: 'New Delhi, Delhi' }
};

export async function geocodeAddress(address) {
  if (!address || typeof address !== 'string' || !address.trim()) {
    return null;
  }

  const cleanAddr = address.trim();
  const lowerAddr = cleanAddr.toLowerCase();

  // 1. Instant check against Known Locations Dictionary
  for (const [key, loc] of Object.entries(KNOWN_LOCATIONS)) {
    if (lowerAddr.includes(key)) {
      return {
        lat: loc.lat,
        lng: loc.lng,
        name: loc.name,
        source: 'local'
      };
    }
  }

  // 2. Check Google Maps Geocoder if loaded in window
  if (typeof window !== 'undefined' && window.google?.maps?.Geocoder) {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const googleRes = await new Promise((resolve) => {
        geocoder.geocode({ address: cleanAddr }, (results, status) => {
          if (status === 'OK' && results && results[0]?.geometry?.location) {
            resolve({
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
              name: results[0].formatted_address || cleanAddr,
              source: 'google'
            });
          } else {
            resolve(null);
          }
        });
      });
      if (googleRes) return googleRes;
    } catch (err) {
      console.warn('Google Maps Geocoder error, checking fallback:', err);
    }
  }

  // 3. OpenStreetMap Nominatim Live Geocoding with candidate fallback queries
  try {
    const parts = cleanAddr.split(',').map(s => s.trim()).filter(Boolean);
    const candidateQueries = [
      cleanAddr,
      cleanAddr.includes('India') ? cleanAddr : `${cleanAddr}, Tamil Nadu, India`,
      parts.length > 1 ? `${parts[parts.length - 1]}, Tamil Nadu, India` : null,
      parts.length > 1 ? `${parts[0]}, Tamil Nadu, India` : null
    ].filter(Boolean);

    for (const query of candidateQueries) {
      try {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timeoutId = controller ? setTimeout(() => controller.abort(), 3500) : null;
        
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
          headers: { 'Accept': 'application/json' },
          signal: controller ? controller.signal : undefined
        });
        
        if (timeoutId) clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0 && data[0].lat && data[0].lon) {
            return {
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
              name: data[0].display_name,
              source: 'osm'
            };
          }
        }
      } catch (innerErr) {
        // try next candidate query
      }
    }
  } catch (err) {
    console.warn('Nominatim geocode failed:', err);
  }

  // 4. Default fallback to Kovilpatti, Tamil Nadu
  return {
    lat: 9.1724,
    lng: 77.8687,
    name: cleanAddr,
    source: 'default'
  };
}

