import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPlaceDetail } from "../services/placeService";
import { getPlaceReviews } from "../services/reviewService";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix icon Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function PlaceDetail() {
  const navigate = useNavigate();
  const { id } = useParams(); // lấy place_id từ URL

  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [placeData, reviewData] = await Promise.all([
          getPlaceDetail(id),
          getPlaceReviews(id),
        ]);
        setPlace(placeData);
        setReviews(reviewData);
      } catch (_err) {
        setError("Không tải được thông tin địa điểm");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="screen">
        <div
          className="screen-body"
          style={{ textAlign: "center", paddingTop: 60, color: "var(--text2)" }}
        >
          Đang tải...
        </div>
      </div>
    );

  if (error || !place)
    return (
      <div className="screen">
        <div
          className="screen-body"
          style={{ textAlign: "center", paddingTop: 60, color: "var(--text2)" }}
        >
          {error || "Không tìm thấy địa điểm"}
          <br />
          <button
            className="btn btn-secondary btn-sm"
            style={{ marginTop: 12 }}
            onClick={() => navigate(-1)}
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-title">Chi tiết địa điểm</div>
          <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>
            Thông tin đầy đủ · Ảnh · Đánh giá · Thêm vào kế hoạch
          </div>
        </div>
      </div>

      <div className="screen-body">
        <button
          className="btn btn-secondary btn-sm"
          style={{ alignSelf: "flex-start" }}
          onClick={() => navigate(-1)}
        >
          ← Quay lại
        </button>

        {/* Hero map */}
        <div
          style={{
            borderRadius: "var(--radius)",
            overflow: "hidden",
            height: 200,
          }}
        >
          <MapContainer
            center={[place.lat, place.lng]}
            zoom={16}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[place.lat, place.lng]}>
              <Popup>{place.name}</Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Info grid */}
        <div className="grid-2">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{place.name}</div>
              <div
                style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}
              >
                📍 {place.address ? `${place.address}, ` : ""}
                {place.city}
              </div>
              <div className="rating" style={{ fontSize: 14, marginTop: 8 }}>
                {"★".repeat(Math.floor(place.avg_rating))}{" "}
                <strong>{place.avg_rating}</strong>
                <span style={{ color: "var(--text2)" }}>
                  ({place.review_count} đánh giá)
                </span>
              </div>
            </div>

            {place.description && (
              <div className="wire-solid" style={{ padding: 14 }}>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text2)",
                    lineHeight: 1.7,
                  }}
                >
                  {place.description}
                </div>
              </div>
            )}

            {/* Metadata nếu có */}
            {place.metadata_ && Object.keys(place.metadata_).length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  fontSize: 13,
                  color: "var(--text2)",
                }}
              >
                {place.metadata_.opening_hours && (
                  <span>🕐 {place.metadata_.opening_hours}</span>
                )}
                {place.metadata_.phone && (
                  <span>📞 {place.metadata_.phone}</span>
                )}
                {place.metadata_.price_range && (
                  <span>💰 {place.metadata_.price_range}</span>
                )}
              </div>
            )}
          </div>

          {/* Cột phải */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                height: 160,
                borderRadius: "var(--radius)",
                background: "var(--surface2)",
                border: "1.5px dashed var(--wire)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 8,
                color: "var(--text2)",
                fontSize: 13,
              }}
            >
              <span style={{ fontSize: 40 }}>📸</span>
              <span>Chưa có ảnh</span>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() =>
                  navigate(
                    `/plan/create?placeId=${place.id}&placeName=${encodeURIComponent(place.name)}`,
                  )
                }
              >
                ＋ Thêm vào kế hoạch
              </button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div>
          <div className="section-heading">
            Đánh giá
            <span
              style={{
                color: "var(--accent)",
                fontSize: 12,
                fontWeight: 400,
                marginLeft: 8,
              }}
            >
              {reviews.length} đánh giá
            </span>
          </div>

          {reviews.length === 0 ? (
            <div style={{ color: "var(--text2)", fontSize: 13 }}>
              Chưa có đánh giá nào. Hãy là người đầu tiên!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {reviews.slice(0, 3).map((review) => (
                <div
                  key={review.id}
                  className="wire-solid"
                  style={{ padding: 12 }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "var(--surface2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      👤
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {review.user_name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text2)" }}>
                        {"★".repeat(review.rating)} ·{" "}
                        {new Date(review.created_at).toLocaleDateString(
                          "vi-VN",
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--text2)",
                      lineHeight: 1.6,
                    }}
                  >
                    {review.content}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {reviews.length > 3 && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate(`/review/view/${place.id}`)}
              >
                Xem tất cả {reviews.length} đánh giá →
              </button>
            )}

            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: 10 }}
              onClick={() => navigate(`/review/write/${place.id}`)}
            >
              ✍ Viết đánh giá
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
