/**
 * Haversine Formula for GPS Site Attendance Geo-fencing
 * Computes exact geodesic distance in meters between two lat/lon coordinates on Earth.
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's mean radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceMeters = Math.round(R * c);

  return distanceMeters;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Validates whether GPS coordinates fall within allowed project site radius
 */
export function checkGeofence(workerLat, workerLon, siteLat, siteLon, allowedRadiusMeters) {
  const distance = calculateDistance(workerLat, workerLon, siteLat, siteLon);
  const isInside = distance <= allowedRadiusMeters;

  return {
    isInside,
    distance,
    allowedRadiusMeters,
    difference: distance - allowedRadiusMeters
  };
}

