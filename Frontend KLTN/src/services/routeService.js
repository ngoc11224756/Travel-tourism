const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjE5NjAwOThhMGQ2NTQ2ZGJhNzBhZTBlOGY1ZTc5MjM4IiwiaCI6Im11cm11cjY0In0=";
import polyline from "@mapbox/polyline";
// Tính khoảng cách đường đi thực tế từ điểm A đến điểm B
// from: [lng, lat], to: [lng, lat]
export const getDistance = async (from, to) => {
  try {
    const response = await fetch(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${ORS_API_KEY}`,
        },
        body: JSON.stringify({
          coordinates: [from, to],
        }),
      }
    );
    const data = await response.json();
    const meters = data.routes?.[0]?.summary?.distance;
    if (!meters) return null;
    return meters < 1000
      ? `${Math.round(meters)} m`
      : `${(meters / 1000).toFixed(1)} km`;
  } catch {
    return null;
  }
};

// Tính khoảng cách cho nhiều địa điểm cùng lúc (dùng Matrix API)
// origin: [lng, lat], destinations: [[lng, lat], ...]
export const getDistanceMatrix = async (origin, destinations) => {
  try {
    const locations = [origin, ...destinations];
    const response = await fetch(
      "https://api.openrouteservice.org/v2/matrix/driving-car",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ORS_API_KEY}`,
        },
        body: JSON.stringify({
          locations,
          sources: [0],
          destinations: destinations.map((_, i) => i + 1),
          metrics: ["distance"],
        }),
      }
    );
    const data = await response.json();
    const distances = data.distances?.[0];
    if (!distances) return [];
    return distances.map((meters) =>
      meters === null
        ? null
        : meters < 1000
        ? `${Math.round(meters)} m`
        : `${(meters / 1000).toFixed(1)} km`
    );
  } catch {
    return [];
  }
};

// Geocoding — chuyển địa chỉ thành tọa độ [lng, lat]
export const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(address)}&boundary.country=VN&size=1`
    );
    const data = await response.json();
    const coords = data.features?.[0]?.geometry?.coordinates;
    return coords || null; // [lng, lat]
  } catch {
    return null;
  }
};


export const getRoute = async (from, to) => {
  try {
    const response = await fetch(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ORS_API_KEY}`,
        },
        body: JSON.stringify({
          coordinates: [from, to],
        }),
      }
    );

    // ❗ check status trước
    if (!response.ok) {
      const text = await response.text();
      console.error("API ERROR:", response.status, text);
      return [];
    }

    const data = await response.json();
    console.log("ROUTE DATA:", data); // 👈 debug

    const geometry = data.routes?.[0]?.geometry;

    if (!geometry) {
      console.error("NO GEOMETRY:", data);
      return [];
    }

    return polyline
      .decode(geometry)
      .map(([lng, lat]) => [lng, lat]);

  } catch (err) {
    console.error("FETCH ERROR:", err);
    return [];
  }
};