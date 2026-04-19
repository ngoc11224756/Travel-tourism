import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { searchPlaces } from "../services/placeService";
import { getRoute } from "../services/routeService";

// Fix icon mặc định của Leaflet bị vỡ khi dùng với Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Icon màu theo danh mục
const getCategoryIcon = (categories) => {
  const slug = categories?.[0]?.slug || "";
  const colors = {
    "am-thuc": "#f7a84f",
    "di-tich": "#4f8ef7",
    "thien-nhien": "#4fd1a5",
    "mua-sam": "#f76f6f",
    "giai-tri": "#a78bfa",
    "luu-tru": "#60a5fa",
  };
  const color = colors[slug] || "#de3030";
  return L.divIcon({
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};border:2px solid white;
      transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
    className: "",
  });
};

const categoryFilters = [
  { label: "Tất cả", slug: "" },
  { label: "🏛 Di tích", slug: "di-tich" },
  { label: "🍜 Ẩm thực", slug: "am-thuc" },
  { label: "🌿 Thiên nhiên", slug: "thien-nhien" },
  { label: "🛍 Mua sắm", slug: "mua-sam" },
  { label: "🏨 Lưu trú", slug: "luu-tru" },
];

// Khi map di chuyển, tự động load địa điểm ẩm thực gần trung tâm
function AutoRecommend({ onBoundsChange }) {
  useMapEvents({
    moveend: (e) => {
      const center = e.target.getCenter();
      onBoundsChange(center.lat, center.lng);
    },
  });
  return null;
}

// Gộp cả fly user location + fly kết quả vào 1 component
// → tránh 2 component fly cùng lúc gây rung
function MapController({ userLocation, flyTarget }) {
  const map = useMap();
  const initialFlownRef = useRef(false);
  const prevFlyTargetRef = useRef(null);

  useEffect(() => {
    // Ưu tiên fly đến kết quả search nếu có
    if (flyTarget) {
      const key = flyTarget.join(",");
      if (key !== prevFlyTargetRef.current) {
        prevFlyTargetRef.current = key;
        map.flyTo(flyTarget, 15, { duration: 1.2 });
      }
      return;
    }
    // Fly đến vị trí user 1 lần duy nhất khi mới vào trang
    if (userLocation && !initialFlownRef.current) {
      initialFlownRef.current = true;
      map.flyTo(userLocation, 14, { duration: 1.2 });
    }
  }, [userLocation, flyTarget, map]);

  return null;
}

function UserLocationMarker({ position }) {
  if (!position) return null;
  return (
    <Marker
      position={position}
      icon={L.divIcon({
        html: `<div style="
          width:16px;height:16px;border-radius:50%;
          background:#4f8ef7;border:3px solid white;
          box-shadow:0 0 0 4px rgba(79,142,247,0.3);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: "",
      })}
    >
      <Popup>📍 Vị trí của bạn</Popup>
    </Marker>
  );
}

export default function MapView() {
  const [places, setPlaces] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distances, setDistances] = useState({});

  // Lưu trạng thái đã hỏi vị trí chưa — chỉ hỏi lần đầu
  const [locationAsked, setLocationAsked] = useState(
    () => localStorage.getItem("location_asked") === "true",
  );

  const defaultCenter = [21.0285, 105.8542]; //Hà Nội
  const navigate = useNavigate();

  const flyTarget =
    places.length > 0 && filtered.length > 0
      ? [filtered[0].lat, filtered[0].lng]
      : null;

  // Nếu đã từng cho phép vị trí → tự động lấy lại, không hỏi nữa
  useEffect(() => {
    if (locationAsked) {
      navigator.geolocation?.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => setUserLocation(defaultCenter),
      );
    }
  }, [locationAsked]);

  const handleAllowLocation = () => {
    localStorage.setItem("location_asked", "true");
    setLocationAsked(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => setUserLocation(defaultCenter),
    );
  };

  const handleSkipLocation = () => {
    localStorage.setItem("location_asked", "true");
    setLocationAsked(true);
    setUserLocation(defaultCenter);
  };

  // Tìm kiếm địa điểm
  const handleSearch = async () => {
    if (!keyword) return;
    setLoading(true);
    try {
      const data = await searchPlaces({ keyword });
      setPlaces(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowRoute = async (place) => {
    if (!userLocation) return;

    const from = [userLocation[1], userLocation[0]];
    const to = [place.lng, place.lat];

    const route = await getRoute(from, to);
    console.log("ROUTE:", route);
    setRouteCoords(route);
    setSelectedPlace(place);
  };
  //Lọc theo danh mục
  useEffect(() => {
    let result = places;
    if (activeFilter) {
      result = result.filter((p) =>
        p.categories?.some((c) => c.slug === activeFilter),
      );
    }
    setFiltered(result);
  }, [activeFilter, places]);

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-title">Bản đồ khu vực</div>
          <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>
            Xem · Điều hướng · Zoom · Lọc địa điểm trên bản đồ
          </div>
        </div>
      </div>

      <div className="screen-body" style={{ gap: 14 }}>
        {/* Banner hỏi vị trí — chỉ hiện lần đầu */}
        {!locationAsked && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(79,142,247,0.1)",
              border: "1px solid rgba(79,142,247,0.3)",
              borderRadius: 8,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span>📍</span>
            <span style={{ flex: 1 }}>
              Cho phép truy cập vị trí để xem địa điểm gần bạn
            </span>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAllowLocation}
            >
              Cho phép
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleSkipLocation}
            >
              Bỏ qua
            </button>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Tìm địa điểm trên bản đồ…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="btn btn-primary btn-sm" onClick={handleSearch}>
              Tìm
            </button>
          </div>
          <div className="tag-row" style={{ flexShrink: 0 }}>
            {categoryFilters.map((f) => (
              <button
                key={f.slug}
                className={`tag${activeFilter === f.slug ? " active" : ""}`}
                onClick={() => setActiveFilter(f.slug)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            borderRadius: 12,
            overflow: "visible",
            height: 440,
            border: "1px solid var(--border)",
          }}
        >
          {!userLocation ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--surface2)",
                color: "var(--text2)",
              }}
            >
              {locationAsked
                ? "Đang tải bản đồ..."
                : "Vui lòng chọn quyền truy cập vị trí ở trên"}
            </div>
          ) : (
            <MapContainer
              center={userLocation || defaultCenter}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
              dragging={true} 
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* 1 component duy nhất xử lý fly — không còn conflict */}
              <MapController
                userLocation={userLocation}
                flyTarget={flyTarget}
              />
              <UserLocationMarker position={userLocation} />
              <AutoRecommend
                onBoundsChange={(lat, lng) => {
                  const nearby = places.filter(
                    (p) =>
                      p.categories?.some((c) => c.slug === "am-thuc") &&
                      Math.abs(p.lat - lat) < 0.02 &&
                      Math.abs(p.lng - lng) < 0.02,
                  );
                  setRecommended(nearby);
                }}
              />
              {filtered.map((place) => (
                <Marker
                  key={place.id}
                  position={[place.lat, place.lng]}
                  icon={getCategoryIcon(place.categories)}
                  eventHandlers={{ click: () => handleShowRoute(place) }}
                >
                  <Popup>
                    <div style={{ minWidth: 160 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          marginBottom: 4,
                        }}
                      >
                        {place.name}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#666", marginBottom: 6 }}
                      >
                        📍 {place.address || place.city}
                      </div>
                      <div style={{ fontSize: 12, marginBottom: 8 }}>
                        ★ {place.avg_rating} · {place.review_count} đánh giá
                      </div>
                      <button
                        style={{
                          background: "#4f8ef7",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          padding: "5px 12px",
                          cursor: "pointer",
                          fontSize: 12,
                          width: "100%",
                        }}
                        onClick={() => navigate(`/place/${place.id}`)}
                      >
                        Xem chi tiết →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {/* 🔥 VẼ ĐƯỜNG */}
              {routeCoords.length > 0 && (
                <Polyline positions={routeCoords} color="blue" />
              )}
            </MapContainer>
          )}
        </div>

        {loading && (
          <div
            style={{ textAlign: "center", color: "var(--text2)", fontSize: 13 }}
          >
            Đang tìm kiếm...
          </div>
        )}

        {/* Recommend ẩm thực */}
        {recommended.length > 0 && (
          <div>
            <div className="section-heading">🍜 Ẩm thực gợi ý khu vực này</div>
            <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
              {recommended.map((place) => (
                <div
                  key={place.id}
                  className="wire-solid"
                  style={{
                    minWidth: 180,
                    padding: 12,
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/place/${place.id}`)}
                >
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {place.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text2)" }}>
                    ★ {place.avg_rating}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Danh sách địa điểm */}
        <div>
          <div className="section-heading">
            Địa điểm trong khu vực
            <span
              style={{
                color: "var(--accent)",
                fontSize: 12,
                fontWeight: 400,
                marginLeft: 8,
              }}
            >
              {filtered.length} địa điểm
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {filtered.length === 0 ? (
              <div style={{ color: "var(--text2)", fontSize: 13 }}>
                Nhập từ khoá và bấm Tìm để xem địa điểm
              </div>
            ) : (
              filtered.map((place) => (
                <div
                  key={place.id}
                  className="wire-solid"
                  style={{
                    minWidth: 200,
                    padding: 12,
                    flexShrink: 0,
                    cursor: "pointer",
                    border:
                      selectedPlace?.id === place.id
                        ? "1.5px solid var(--accent)"
                        : "",
                  }}
                  onClick={() => navigate(`/place/${place.id}`)}
                >
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <span style={{ fontSize: 22 }}>📍</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {place.name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text2)" }}>
                        {place.city} · ★ {place.avg_rating}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
