import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { searchPlaces } from "../services/placeService";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import DistanceInfo from "../components/map/DistanceInfo";
import { Polyline } from "react-leaflet";
import { getRoute } from "../services/routeService";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Fix icon Leaflet + Vite
function FlyToResults({ results }) {
  const map = useMap();
  useEffect(() => {
    if (results.length === 0) return;
    if (results.length === 1) {
      map.flyTo([results[0].lat, results[0].lng], 15, { duration: 1.2 });
    } else {
      const bounds = results.map((p) => [p.lat, p.lng]);
      map.flyToBounds(bounds, { padding: [40, 40], duration: 1.2 });
    }
  }, [results, map]);
  return null;
}

export default function Search() {
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(
    () => searchParams.get("keyword") || "",
  );
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [distances, setDistances] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async (kw) => {
    const q = kw ?? keyword;
    setLoading(true);
    try {
      const data = await searchPlaces({
        keyword: q || undefined,
        category_slug: category || undefined,
        city: area || undefined,
      });
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowRoute = async (place) => {
    console.log("MARKER CLICK");
    console.log("HANDLE ROUTE");
    console.log("CALL API");
    if (!userLocation) return;

    const from = [userLocation[1], userLocation[0]];
    const to = [place.lng, place.lat];

    const route = await getRoute(from, to);
    setRouteCoords(route);
  };

  // Chỉ search tự động nếu có keywword/filter
  useEffect(() => {
    const kw = searchParams.get("keyword");
    console.log("keyword từ URL:", kw);
    if (kw) {
      setKeyword(kw);
      setLoading(true);
      searchPlaces({ keyword: kw })
        .then(setResults)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, []);
  // lấy vị trí user
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        console.log("userLocation:", pos.coords.latitude, pos.coords.longitude);
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {},
    );
  }, []);

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-title">Tìm kiếm địa điểm</div>
          <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>
            Nhập từ khoá · Lọc loại hình · Chọn khu vực/bán kính
          </div>
        </div>
      </div>

      <div className="screen-body">
        {/* Search bar */}
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Nhập tên, loại hình, từ khoá…"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="btn btn-primary btn-sm" onClick={handleSearch}>
            {loading ? "..." : "Tìm"}
          </button>
        </div>
        {/* Filters */}
        <div className="wire-box" style={{ padding: 14 }}>
          <span className="wire-label">Bộ lọc</span>
          <div className="grid-3" style={{ marginTop: 8 }}>
            <div className="field">
              <label>Loại hình</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="am-thuc">Ẩm thực</option>
                <option value="di-tich">Di tích</option>
                <option value="thien-nhien">Thiên nhiên</option>
                <option value="mua-sam">Mua sắm</option>
                <option value="giai-tri">Giải trí</option>
                <option value="luu-tru">Lưu trú</option>
              </select>
            </div>
            <div className="field">
              <label>Thành phố</label>
              <select value={area} onChange={(e) => setArea(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="Ha Noi">Hà Nội</option>
                <option value="Ho Chi Minh">Hồ Chí Minh</option>
                <option value="Da Nang">Đà Nẵng</option>
              </select>
            </div>
            <div className="field">
              <label>Bán kính</label>
              <select>
                <option>5 km</option>
                <option>10 km</option>
                <option>20 km</option>
              </select>
            </div>
          </div>
        </div>

        {results.length > 0 && (
          <DistanceInfo
            places={results}
            userLocation={userLocation}
            onDistancesChange={setDistances}
          />
        )}

        {/* Results */}
        {/* Results */}
        <div>
          <div className="section-heading">
            Kết quả tìm kiếm{" "}
            <span
              style={{ color: "var(--accent)", fontSize: 12, fontWeight: 400 }}
            >
              {results.length} địa điểm
            </span>
          </div>

          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: 20,
                color: "var(--text2)",
              }}
            >
              Đang tải...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: 20,
                color: "var(--text2)",
              }}
            >
              Không tìm thấy địa điểm nào
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {results.map((place) => (
              <div key={place.id} className="wire-solid">
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: 14,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      background: "var(--surface2)",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                      flexShrink: 0,
                    }}
                  >
                    📍
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {place.name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text2)" }}>
                      {place.city} {place.district ? `· ${place.district}` : ""}
                    </div>
                    <div className="rating">
                      {"★".repeat(Math.floor(place.avg_rating))}{" "}
                      {place.avg_rating}
                      <span style={{ color: "var(--text2)", marginLeft: 4 }}>
                        ({place.review_count} đánh giá)
                      </span>
                    </div>
                    {/*khoảng cách*/}
                    {distances[place.id] && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--accent)",
                          marginTop: 2,
                        }}
                      >
                        🚗 {distances[place.id]}
                      </div>
                    )}
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/place/${place.id}`)}
                  >
                    Xem →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Mini map */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 1000,
            }}
          >
            <button
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: 11,
                background: "rgba(15,17,23,0.75)",
                backdropFilter: "blur(4px)",
              }}
              onClick={() => navigate("/map")}
            >
              🗺 Xem bản đồ lớn hơn →
            </button>
          </div>
          <div
            style={{
              borderRadius: 12,
              overflow: "hidden",
              height: 320,
              border: "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            <MapContainer
              center={[21.0285, 105.8542]}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Fly đến kết quả mỗi khi search */}
              <FlyToResults results={results} />

              {/* Vẽ polyline-đường đi*/}
              {routeCoords.length > 0 && (
                <Polyline positions={routeCoords} color="blue" />
              )}

              {/* Hiển thị pin cho từng kết quả */}
              {results.map((place) => (
                <Marker
                  key={place.id}
                  position={[place.lat, place.lng]}
                  eventHandlers={{
                    click: () => handleShowRoute(place),
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: 140 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          marginBottom: 4,
                        }}
                      >
                        {place.name}
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#666", marginBottom: 6 }}
                      >
                        📍 {place.city}
                      </div>
                      <button
                        style={{
                          background: "#4f8ef7",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          padding: "4px 10px",
                          cursor: "pointer",
                          fontSize: 11,
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
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}