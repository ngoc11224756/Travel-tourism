import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HotspotCarousel from "../components/carousel/HotspotCarousel";
import MapMock from "../components/map/MapMock";
import { useState, useEffect } from "react";
import { getMyPlans, getRecentViewed } from "../services/planService";

const categories = [
  { label: "🏛 Di tích" },
  { label: "🍜 Ẩm thực" },
  { label: "🌿 Thiên nhiên" },
  { label: "🛍 Mua sắm" },
  { label: "🏨 Lưu trú" },
  { label: "🎭 Giải trí" },
];

export default function HomeLoggedIn() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentPlans, setRecentPlans] = useState([]);
  const [recentViewed, setRecentViewed] = useState([]);
  const [keyword, setKeyword] = useState("");

  // Lấy giờ để chào phù hợp
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Chào buổi sáng"
      : hour < 18
        ? "Chào buổi chiều"
        : "Chào buổi tối";

  useEffect(() => {
    getMyPlans()
      .then((data) => setRecentPlans(data.slice(0, 2)))
      .catch(() => {});
    getRecentViewed()
      .then((res) => setRecentViewed(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-title">
            {greeting}, {user?.full_name?.split(" ").pop()}! 👋
          </div>
          <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>
            Hôm nay bạn muốn khám phá đâu?
          </div>
        </div>
      </div>

      <div className="screen-body">
        {/* Search bar */}
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Tìm địa điểm, loại hình, từ khoá…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              navigate(`/search?keyword=${encodeURIComponent(keyword)}`)
            }
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={() =>
              navigate(`/search?keyword=${encodeURIComponent(keyword)}`)
            }
          >
            🔍 Tìm
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/map")}
          >
            🗺 Bản đồ
          </button>
        </div>

        {/* ===== 2 CỘT: Banner cá nhân hoá + Bản đồ ===== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "3fr 2fr",
            gap: 16,
            alignItems: "stretch",
          }}
        >
          {/* CỘT TRÁI – Banner cá nhân hoá */}
          <div
            className="hero-banner"
            style={{ height: "100%", minHeight: 180 }}
          >
            <div className="hero-banner-dots" />
            <div className="hero-banner-art">🗺️</div>
            <div className="hero-banner-badge">✦ Thành viên</div>
            <div className="hero-banner-content">
              <div className="hero-banner-eyebrow">Hành trình tiếp theo</div>
              <div className="hero-banner-title">
                Khám phá <span>địa điểm</span>
                <br />
                mới hôm nay
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate("/ai")}
                >
                  🤖 Nhận gợi ý AI
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate("/plan/create")}
                >
                  📋 Tạo kế hoạch
                </button>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI – Bản đồ */}
          <div
            style={{
              position: "relative",
              borderRadius: "var(--radius)",
              overflow: "hidden",
            }}
          >
            <MapMock height="100%" showCta onOpen={() => navigate("/map")} />
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 12,
                background: "rgba(15,17,23,0.75)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: 11,
                color: "var(--text2)",
                backdropFilter: "blur(4px)",
                zIndex: 11,
              }}
            >
              📍 Hà Nội · 24 địa điểm
            </div>
          </div>
        </div>

        {/* ===== SECTION CÁ NHÂN HOÁ ===== */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          {/* Kế hoạch gần đây */}
          <div className="wire-solid" style={{ padding: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div className="section-heading" style={{ marginBottom: 0 }}>
                📋 Kế hoạch của tôi
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--accent)",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/plan")}
              >
                Xem tất cả →
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentPlans.map((plan) => (
                <div
                  key={plan.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 10px",
                    borderRadius: 8,
                    background: "var(--surface2)",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/plan")}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {plan.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text2)" }}>
                      📅 {plan.start_date || "Chưa có ngày"} ·{" "}
                      {plan.days?.length || 0} ngày
                    </div>
                  </div>
                  <span
                    className={`status ${plan.status === "draft" ? "pending" : "active"}`}
                  >
                    {plan.status === "draft" ? "Nháp" : "Hoạt động"}
                  </span>
                </div>
              ))}
            </div>
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: 10, width: "100%", justifyContent: "center" }}
              onClick={() => navigate("/plan/create")}
            >
              ＋ Tạo kế hoạch mới
            </button>
          </div>

          {/* Đã xem gần đây */}
          <div className="wire-solid" style={{ padding: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div className="section-heading" style={{ marginBottom: 0 }}>
                🕐 Đã xem gần đây
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentViewed.length === 0 ? (
                // Chưa có lịch sử xem → hiện trạng thái trống
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text2)",
                    textAlign: "center",
                    padding: "12px 0",
                  }}
                >
                  Chưa có địa điểm nào được xem
                </div>
              ) : (
                recentViewed.map((place, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: "var(--surface2)",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/place/${place.id}`)}
                  >
                    <span style={{ fontSize: 20 }}>{place.emoji}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {place.name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text2)" }}>
                        {place.category || place.type}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: 10, width: "100%", justifyContent: "center" }}
              onClick={() => navigate("/search")}
            >
              🔍 Tìm kiếm địa điểm mới
            </button>
          </div>
        </div>

        {/* Carousel điểm hot */}
        <HotspotCarousel />

        {/* Categories */}
        <div>
          <div className="section-heading">Danh mục</div>
          <div className="tag-row">
            {categories.map((cat, i) => (
              <button
                key={i}
                className={`tag${i === 0 ? " active" : ""}`}
                onClick={() => navigate("/search")}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
