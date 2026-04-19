import { useState, useEffect } from "react";
import { getDistanceMatrix, geocodeAddress } from "../../services/routeService";

// Component hiển thị khoảng cách + ô nhập điểm xuất phát
// places: array of { id, lat, lng, ... }
// userLocation: [lat, lng] hoặc null
// onDistancesChange: callback trả về { [place.id]: "x.x km" }
export default function DistanceInfo({ places, userLocation, onDistancesChange }) {
  const [origin, setOrigin] = useState(""); // địa chỉ nhập tay
  const [originCoords, setOriginCoords] = useState(null); // [lng, lat]
  const [loading, setLoading] = useState(false);
  const [usingUserLocation, setUsingUserLocation] = useState(true);

  // Khi có userLocation → tự động tính khoảng cách
  useEffect(() => {
    if (userLocation && usingUserLocation && places.length > 0) {
      calculateDistances([userLocation[1], userLocation[0]]); // [lng, lat]
    }
  }, [userLocation, places]);

  const calculateDistances = async (fromCoords) => {
    if (!fromCoords || places.length === 0) return;
    setLoading(true);
    try {
      const destinations = places.map((p) => [p.lng, p.lat]);
      const distances = await getDistanceMatrix(fromCoords, destinations);
      const map = {};
      places.forEach((p, i) => {
        map[p.id] = distances[i] || null;
      });
      onDistancesChange?.(map);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomOrigin = async () => {
    if (!origin.trim()) return;
    setLoading(true);
    try {
      const coords = await geocodeAddress(origin);
      if (!coords) {
        alert("Không tìm thấy địa chỉ này");
        return;
      }
      setOriginCoords(coords);
      setUsingUserLocation(false);
      await calculateDistances(coords);
    } finally {
      setLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!userLocation) return;
    setUsingUserLocation(true);
    setOrigin("");
    calculateDistances([userLocation[1], userLocation[0]]);
  };

  return (
    <div style={{
      display: "flex",
      gap: 8,
      alignItems: "center",
      flexWrap: "wrap",
      padding: "8px 0",
    }}>
      <span style={{ fontSize: 12, color: "var(--text2)", flexShrink: 0 }}>
        📍 Từ:
      </span>

      {/* Ô nhập địa chỉ xuất phát */}
      <input
        style={{
          flex: 1,
          minWidth: 160,
          fontSize: 12,
          padding: "5px 10px",
          borderRadius: 6,
          border: "1px solid var(--border)",
          background: "var(--surface2)",
          color: "var(--text-primary)",
        }}
        placeholder="Nhập điểm xuất phát khác..."
        value={origin}
        onChange={(e) => setOrigin(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCustomOrigin()}
      />

      <button
        className="btn btn-secondary btn-sm"
        onClick={handleCustomOrigin}
        disabled={loading || !origin.trim()}
      >
        {loading ? "..." : "Tính"}
      </button>

      {/* Nút quay về vị trí hiện tại */}
      {!usingUserLocation && userLocation && (
        <button
          className="btn btn-secondary btn-sm"
          onClick={handleUseMyLocation}
          style={{ fontSize: 11 }}
        >
          📍 Vị trí của tôi
        </button>
      )}

      {loading && (
        <span style={{ fontSize: 11, color: "var(--text2)" }}>
          Đang tính khoảng cách...
        </span>
      )}
    </div>
  );
}
