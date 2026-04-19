import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";
import { getMyPlans, deletePlan } from "../services/planService";

const TABS = [
  { key: "info", icon: "👤", label: "Thông tin" },
  { key: "plans", icon: "📋", label: "Kế hoạch" },
  { key: "reviews", icon: "⭐", label: "Đánh giá" },
  { key: "settings", icon: "⚙️", label: "Cài đặt" },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [editing, setEditing] = useState(false);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    getMyPlans().then(setPlans).catch(console.error);
  }, []);

  const handleDeletePlan = async (planId) => {
    if (!confirm("Xóa kế hoạch này?")) return;
    await deletePlan(planId);
    setPlans((prev) => prev.filter((p) => p.id !== planId));
  };

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .slice(-2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  const [form, setForm] = useState({
    name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-title">Hồ sơ cá nhân</div>
          <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>
            Thông tin tài khoản · Kế hoạch · Đánh giá · Cài đặt
          </div>
        </div>
        <div className="uc-badge">Profile</div>
      </div>

      <div className="screen-body" style={{ gap: 0, padding: 0 }}>
        {/* ===== COVER + AVATAR ===== */}
        <div className="profile-cover">
          <div className="profile-cover-bg" />
          <div className="profile-cover-dots" />

          <div className="profile-hero">
            {/* Avatar */}
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <button className="profile-avatar-edit" title="Đổi ảnh">
                📷
              </button>
            </div>

            {/* Info */}
            <div className="profile-hero-info">
              <div className="profile-hero-name">{user?.full_name}</div>
              <div className="profile-hero-email">{user?.email}</div>
              <div className="profile-hero-meta">
                <span>📅 Tham gia {user?.joinDate}</span>
                <span>·</span>
                <span>📋 {user?.plansCount || plans.length} kế hoạch</span>
                <span>·</span>
                <span>
                  ⭐ {user?.reviewsCount || 0} đánh giá
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="profile-hero-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setActiveTab("settings");
                  setEditing(true);
                }}
              >
                ✏️ Chỉnh sửa
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                🚪 Đăng xuất
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="profile-stats-bar">
            {[
              {
                value: plans.length,
                label: "Kế hoạch",
                color: "var(--accent)",
              },
              /*bổ sung value review*/
              { value: 24, label: "Địa điểm đã xem", color: "var(--green)" },
              { value: "4.8", label: "Rating TB", color: "var(--accent2)" },
            ].map((s, i) => (
              <div key={i} className="profile-stat">
                <div className="profile-stat-value" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div className="profile-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== TABS ===== */}
        <div className="profile-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`profile-tab${activeTab === tab.key ? " active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ===== TAB CONTENT ===== */}
        <div className="profile-content">
          {/* ── TAB: THÔNG TIN ── */}
          {activeTab === "info" && (
            <div className="profile-tab-pane">
              <div className="grid-2">
                {[
                  { icon: "👤", label: "Họ và tên", value: user?.full_name },
                  { icon: "✉️", label: "Email", value: user?.email },
                  {
                    icon: "📱",
                    label: "Số điện thoại",
                    value: user?.phone || "—",
                  },
                  { icon: "📅", label: "Tham gia", value: user?.joinDate },
                ].map((item, i) => (
                  <div key={i} className="profile-info-item">
                    <div className="profile-info-icon">{item.icon}</div>
                    <div>
                      <div className="profile-info-label">{item.label}</div>
                      <div className="profile-info-value">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bio */}
              <div className="wire-solid" style={{ padding: 16, marginTop: 4 }}>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text2)",
                    marginBottom: 8,
                    fontWeight: 600,
                  }}
                >
                  📝 Giới thiệu bản thân
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: user?.bio ? "var(--text)" : "var(--text2)",
                    lineHeight: 1.6,
                  }}
                >
                  {user?.bio || 'Chưa có giới thiệu. Bấm "Chỉnh sửa" để thêm.'}
                </div>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                style={{ alignSelf: "flex-start" }}
                onClick={() => {
                  setActiveTab("settings");
                  setEditing(true);
                }}
              >
                ✏️ Chỉnh sửa thông tin
              </button>
            </div>
          )}

          {/* ── TAB: KẾ HOẠCH ── */}
          {activeTab === "plans" && (
            <div className="profile-tab-pane">
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: 4,
                }}
              >
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate("/plan/create")}
                >
                  ＋ Tạo kế hoạch mới
                </button>
              </div>
              {plans.length === 0 ? (
                <div
                  style={{
                    color: "var(--text2)",
                    textAlign: "center",
                    padding: 20,
                  }}
                >
                  Chưa có kế hoạch nào
                </div>
              ) : (
                plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="wire-solid"
                    style={{ padding: 16 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>
                          {plan.title}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text2)",
                            marginTop: 4,
                          }}
                        >
                          📅 {plan.start_date || "Chưa có ngày"} · 📍{" "}
                          {plan.days?.length || 0} ngày
                        </div>
                      </div>
                      <span
                        className={`status ${plan.status === "draft" ? "pending" : "active"}`}
                      >
                        {plan.status === "draft" ? "Nháp" : "Hoạt động"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button className="btn btn-secondary btn-sm">
                        ✏️ Chỉnh sửa
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeletePlan(plan.id)}
                      >
                        🗑 Xoá
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── TAB: ĐÁNH GIÁ ── */}
          {activeTab === "reviews" && (
            <div className="profile-tab-pane">
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: 4,
                }}
              >
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate("/review/write")}
                >
                  ✍️ Viết đánh giá mới
                </button>
              </div>
              {mockReviews.map((review) => (
                <div
                  key={review.id}
                  className="wire-solid"
                  style={{ padding: 16 }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: "var(--surface2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        flexShrink: 0,
                      }}
                    >
                      {review.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {review.place}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--accent2)",
                          margin: "3px 0",
                        }}
                      >
                        {"★".repeat(review.stars)}
                        {"☆".repeat(5 - review.stars)}
                        <span style={{ color: "var(--text2)", marginLeft: 6 }}>
                          {review.date}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--text2)",
                          lineHeight: 1.6,
                        }}
                      >
                        {review.text}
                      </div>
                    </div>
                    <button className="btn btn-danger btn-sm">🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── TAB: CÀI ĐẶT ── */}
          {activeTab === "settings" && (
            <div className="profile-tab-pane">
              {/* Chỉnh sửa thông tin */}
              <div className="wire-solid" style={{ padding: 20 }}>
                <div
                  style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}
                >
                  ✏️ Chỉnh sửa thông tin
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div className="grid-2">
                    <div className="field">
                      <label>Họ và tên</label>
                      <input
                        value={form.name}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder="Nguyễn Văn An"
                      />
                    </div>
                    <div className="field">
                      <label>Số điện thoại</label>
                      <input
                        value={form.phone}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, phone: e.target.value }))
                        }
                        placeholder="0912 345 678"
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="example@email.com"
                    />
                  </div>
                  <div className="field">
                    <label>Giới thiệu bản thân</label>
                    <textarea
                      rows={3}
                      value={form.bio}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, bio: e.target.value }))
                      }
                      placeholder="Kể vài dòng về bạn..."
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      className="btn btn-secondary"
                      onClick={() => setEditing(false)}
                    >
                      Huỷ
                    </button>
                    <button className="btn btn-primary">💾 Lưu thay đổi</button>
                  </div>
                </div>
              </div>

              {/* Đổi mật khẩu */}
              <div className="wire-solid" style={{ padding: 20 }}>
                <div
                  style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}
                >
                  🔒 Đổi mật khẩu
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div className="field">
                    <label>Mật khẩu hiện tại</label>
                    <input type="password" placeholder="••••••••" />
                  </div>
                  <div className="grid-2">
                    <div className="field">
                      <label>Mật khẩu mới</label>
                      <input type="password" placeholder="••••••••" />
                    </div>
                    <div className="field">
                      <label>Xác nhận mật khẩu mới</label>
                      <input type="password" placeholder="••••••••" />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button className="btn btn-primary">
                      🔒 Cập nhật mật khẩu
                    </button>
                  </div>
                </div>
              </div>

              {/* Nguy hiểm */}
              <div
                className="wire-solid"
                style={{ padding: 20, borderColor: "rgba(247,111,111,0.25)" }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: "var(--red)",
                    marginBottom: 8,
                  }}
                >
                  ⚠️ Vùng nguy hiểm
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text2)",
                    marginBottom: 14,
                  }}
                >
                  Xoá tài khoản sẽ xoá toàn bộ dữ liệu và không thể khôi phục.
                </div>
                <button className="btn btn-danger btn-sm">
                  🗑 Xoá tài khoản
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
