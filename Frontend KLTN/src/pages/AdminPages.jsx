import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  getReportedReviews,
  updateReviewStatus,
  getAdminUsers,
  toggleUserBan,
  deleteUser,
  getAdminStats,
} from "../services/adminService";
import {
  searchPlaces,
  createPlace,
  updatePlace,
  deletePlace,
} from "../services/placeService";

// ====UC12 – Đăng nhập Admin =====
export function AdminLogin() {
  const navigate = useNavigate();
  return (
    <div className="screen" style={{ justifyContent: "center", alignItems: "center" }}>
      <div className="uc-badge" style={{ marginBottom: 20 }}>UC12 – Đăng nhập Admin</div>
      <div className="login-card">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🛡️</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22 }}>Admin Portal</div>
          <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 4 }}>
            Du lịch thông minh – Hệ thống quản trị
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="field">
            <label>Email quản trị</label>
            <input type="email" placeholder="admin@tourism.vn" />
          </div>
          <div className="field">
            <label>Mật khẩu</label>
            <input type="password" placeholder="••••••••" />
          </div>
          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => navigate("/admin/places")}
          >
            Đăng nhập →
          </button>
        </div>
      </div>
    </div>
  );
}

// ===================== UC13 – Quản lý địa điểm =====================

const EMPTY_FORM = {
  name: "", description: "", lat: "", lng: "",
  address: "", district: "", city: "Hà Nội",
  category_ids: [], metadata_: {},
};

function PlaceModal({ place, onClose, onSaved }) {
  const isEdit = !!place;
  const [form, setForm] = useState(
    isEdit
      ? {
          name: place.name ?? "",
          description: place.description ?? "",
          lat: place.lat ?? "",
          lng: place.lng ?? "",
          address: place.address ?? "",
          district: place.district ?? "",
          city: place.city ?? "Hà Nội",
          category_ids: place.categories?.map((c) => c.id) ?? [],
          metadata_: place.metadata_ ?? {},
        }
      : { ...EMPTY_FORM }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError("Tên địa điểm không được trống.");
    if (!form.lat || !form.lng) return setError("Vui lòng nhập toạ độ.");
    setError("");
    setLoading(true);
    try {
      const payload = { ...form, lat: parseFloat(form.lat), lng: parseFloat(form.lng) };
      if (isEdit) {
        await updatePlace(place.id, payload);
      } else {
        await createPlace(payload);
      }
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.detail ?? "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>
            {isEdit ? "✏️ Cập nhật địa điểm" : "＋ Thêm địa điểm mới"}
          </span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div style={styles.modalBody}>
          {error && <div style={styles.errorBox}>{error}</div>}

          <div style={styles.grid2}>
            <ModalField label="Tên địa điểm *">
              <input style={styles.input} value={form.name} onChange={set("name")} placeholder="VD: Hồ Hoàn Kiếm" />
            </ModalField>
            <ModalField label="Thành phố *">
              <input style={styles.input} value={form.city} onChange={set("city")} placeholder="Hà Nội" />
            </ModalField>
          </div>

          <ModalField label="Địa chỉ">
            <input style={styles.input} value={form.address} onChange={set("address")} placeholder="Số nhà, tên đường" />
          </ModalField>

          <div style={styles.grid2}>
            <ModalField label="Quận / Huyện">
              <input style={styles.input} value={form.district} onChange={set("district")} placeholder="VD: Hoàn Kiếm" />
            </ModalField>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <ModalField label="Vĩ độ (lat) *">
                <input style={styles.input} type="number" value={form.lat} onChange={set("lat")} placeholder="21.028" />
              </ModalField>
              <ModalField label="Kinh độ (lng) *">
                <input style={styles.input} type="number" value={form.lng} onChange={set("lng")} placeholder="105.854" />
              </ModalField>
            </div>
          </div>

          <ModalField label="Mô tả">
            <textarea
              style={{ ...styles.input, height: 80, resize: "vertical" }}
              value={form.description}
              onChange={set("description")}
              placeholder="Mô tả ngắn về địa điểm..."
            />
          </ModalField>
        </div>

        {/* Footer */}
        <div style={styles.modalFooter}>
          <button style={styles.btnSecondary} onClick={onClose} disabled={loading}>Huỷ</button>
          <button style={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalField({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)" }}>{label}</label>
      {children}
    </div>
  );
}

export function PlaceManager() {
  const [places, setPlaces] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalTarget, setModalTarget] = useState(null); // null=đóng | "new" | place object
  const LIMIT = 20;

  const fetchPlaces = useCallback(async (kw, pg) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: LIMIT };
      if (kw?.trim()) params.keyword = kw.trim();
      const data = await searchPlaces(params);
      setPlaces(data);
      setHasMore(data.length === LIMIT);
    } catch (err) {
      console.error("Lỗi tải địa điểm:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaces(keyword, page);
  }, [page]); // eslint-disable-line

  const handleSearch = () => {
    setPage(1);
    fetchPlaces(keyword, 1);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Xoá địa điểm "${name}"?`)) return;
    try {
      await deletePlace(id);
      setPlaces((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err?.response?.data?.detail ?? "Xoá thất bại.");
    }
  };

  const handleSaved = () => {
    setModalTarget(null);
    fetchPlaces(keyword, page);
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-title">Quản lý địa điểm</div>
          <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>
            Thêm · Sửa · Xoá thông tin địa điểm du lịch
          </div>
        </div>
        <div className="uc-badge">UC13 – CRUD Địa điểm</div>
      </div>

      <div className="screen-body">
        {/* Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div className="search-bar" style={{ flex: 1, maxWidth: 380 }}>
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Tìm tên địa điểm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {keyword && (
              <button
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text2)", padding: "0 6px" }}
                onClick={() => { setKeyword(""); setPage(1); fetchPlaces("", 1); }}
              >
                ✕
              </button>
            )}
          </div>
          {/* ✅ Nút Thêm địa điểm — có onClick mở modal */}
          <button className="btn btn-primary btn-sm" onClick={() => setModalTarget("new")}>
            ＋ Thêm địa điểm
          </button>
        </div>

        {/* Table */}
        <div className="wire-solid" style={{ overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text2)" }}>Đang tải...</div>
          ) : places.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text2)" }}>
              Không tìm thấy địa điểm nào.
            </div>
          ) : (
            <table className="wire-table">
              <thead>
                <tr>
                  <th>Tên địa điểm</th>
                  <th>Danh mục</th>
                  <th>Địa chỉ</th>
                  <th>Rating</th>
                  <th>Trạng thái</th>
                  <th style={{ width: 90 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {places.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td style={{ color: "var(--text2)", fontSize: 12 }}>
                      {p.categories?.map((c) => c.name).join(", ") || "—"}
                    </td>
                    <td style={{ color: "var(--text2)", fontSize: 12 }}>
                      {p.address ? `${p.address}, ` : ""}{p.city}
                    </td>
                    <td>
                      <span className="rating">★ {p.avg_rating?.toFixed(1) ?? "—"}</span>
                      <span style={{ fontSize: 11, color: "var(--text2)", marginLeft: 4 }}>
                        ({p.review_count})
                      </span>
                    </td>
                    <td>
                      <span className={`status ${p.status === "active" ? "active" : "inactive"}`}>
                        {p.status === "active" ? "Hiển thị" : "Ẩn"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        {/* ✅ Nút Sửa — có onClick mở modal với data của place */}
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Sửa"
                          onClick={() => setModalTarget(p)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          title="Xoá"
                          onClick={() => handleDelete(p.id, p.name)}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            ← Trước
          </button>
          <span style={{ lineHeight: "30px", fontSize: 13, color: "var(--text2)" }}>Trang {page}</span>
          <button className="btn btn-secondary btn-sm" disabled={!hasMore} onClick={() => setPage((p) => p + 1)}>
            Sau →
          </button>
        </div>
      </div>

      {/* Modal Thêm / Sửa */}
      {modalTarget !== null && (
        <PlaceModal
          place={modalTarget === "new" ? null : modalTarget}
          onClose={() => setModalTarget(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

// ===================== UC14 – Quản lý User =====================
export function UserManager() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    getAdminUsers().then(setUsers).catch(console.error);
  }, []);

  const handleToggleBan = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    await toggleUserBan(id, newStatus);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u)));
  };

  const handleDelete = async (id) => {
    if (!confirm("Xoá tài khoản này?")) return;
    await deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-title">Quản lý người dùng</div>
          <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>
            Xem · Khoá · Mở khoá · Xoá tài khoản
          </div>
        </div>
        <div className="uc-badge">UC14 – Quản lý User</div>
      </div>
      <div className="screen-body">
        <div className="search-bar" style={{ maxWidth: 360 }}>
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Tìm theo tên, email..." />
        </div>

        <div className="wire-solid" style={{ overflow: "hidden" }}>
          <table className="wire-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Đăng ký</th>
                <th>Đánh giá</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i}>
                  <td><strong>{u.full_name}</strong></td>
                  <td style={{ color: "var(--text2)" }}>{u.email}</td>
                  <td style={{ color: "var(--text2)" }}>{u.created_at?.slice(0, 10)}</td>
                  <td>{u.reviews_count || 0}</td>
                  <td>
                    <span className={`status ${u.status}`}>
                      {u.status === "active" ? "Hoạt động" : "Đã khoá"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      {u.status === "active" ? (
                        <button className="btn btn-danger btn-sm" onClick={() => handleToggleBan(u.id, u.status)}>
                          🔒 Khoá
                        </button>
                      ) : (
                        <button className="btn btn-success btn-sm" onClick={() => handleToggleBan(u.id, u.status)}>
                          🔓 Mở
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ===================== UC15 – Quản lý đánh giá =====================
export function ReviewManager() {
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("reported");

  useEffect(() => {
    getReportedReviews().then(setReviews).catch(console.error);
  }, []);

  const handleStatus = async (id, status) => {
    await updateReviewStatus(id, status);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-title">Quản lý đánh giá</div>
          <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>
            Ẩn · Xoá đánh giá bị report
          </div>
        </div>
        <div className="uc-badge">UC15 – Quản lý đánh giá</div>
      </div>
      <div className="screen-body">
        <div className="tag-row">
          {["reported","hidden","all"].map((tab) => (
            <button
              key={tab}
              className={`tag${activeTab === tab ? " active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "reported" ? "Bị report" : tab === "hidden" ? "Đã ẩn" : "Tất cả"}
            </button>
          ))}
        </div>

        {reviews.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text2)", padding: "40px 0" }}>
            Không có đánh giá nào.
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="wire-solid" style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    👤 {r.user_name} · {"★".repeat(Math.min(r.rating ?? 0, 5))}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text2)" }}>📍 {r.place_id}</div>
                </div>
                <span className="status reported">Bị report</span>
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.6, padding: 10, borderRadius: 8, color: "var(--text2)", background: "var(--surface2)" }}>
                {r.content}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handleStatus(r.id, "hidden")}>👁 Ẩn</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleStatus(r.id, "deleted")}>🗑 Xoá</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ===================== UC16 – Thống kê =====================

export function AdminStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAdminStats().then(setStats).catch(console.error);
  }, []);

  // Giữ nguyên bars và barDays làm mock chart
  const bars = [40, 65, 50, 80, 95, 70, 55];
  const barDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-title">Thống kê hệ thống</div>
          <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>
            Tổng quan · Hành vi người dùng · Địa điểm nổi bật
          </div>
        </div>
        <div className="uc-badge">UC16 – Thống kê</div>
      </div>
      <div className="screen-body">
        <div className="grid-4">
          {[
            { value: stats?.total_users      ?? '—', label: 'Người dùng',  color: 'var(--accent)',  trend: '' },
            { value: stats?.total_places     ?? '—', label: 'Địa điểm',    color: 'var(--accent2)', trend: '' },
            { value: stats?.total_reviews    ?? '—', label: 'Đánh giá',    color: 'var(--green)',   trend: '' },
            { value: stats?.reported_reviews ?? '—', label: 'Bị report',   color: 'var(--red)',     trend: '⚠ Cần xử lý' },
          ].map((k, i) => (
            <div key={i} className="stat-card">
              <div className="stat-value" style={{ color: k.color }}>{k.value}</div>
              <div className="stat-label">{k.label}</div>
              {k.trend && <div className="stat-trend" style={{ color: 'var(--accent2)' }}>{k.trend}</div>}
            </div>
          ))}
        </div>

        {/* Chart — giữ mock */}
        <div className="grid-2">
          <div className="wire-solid" style={{ padding: 16 }}>
            <div className="section-heading">Lượt truy cập 7 ngày</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
              {bars.map((h, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", height: `${h}%`, background: "linear-gradient(to top, var(--accent), rgba(79,142,247,0.3))", borderRadius: "4px 4px 0 0", minHeight: 10 }} />
                  <div style={{ fontSize: 9, color: "var(--text2)" }}>{barDays[i]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top places — giữ mock */}
          <div className="wire-solid" style={{ padding: 16 }}>
            <div className="section-heading">Địa điểm xem nhiều nhất</div>
            {[
              { name: "Hồ Hoàn Kiếm", pct: "92%", count: 1240 },
              { name: "Văn Miếu",     pct: "74%", count: 980 },
              { name: "Phở Thìn",     pct: "55%", count: 720 },
            ].map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: i === 0 ? "var(--accent2)" : "var(--text2)", fontWeight: 700 }}>{i + 1}</span>
                <div style={{ flex: 1 }}>{p.name}</div>
                <div style={{ width: "50%", height: 6, background: "var(--surface2)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: p.pct, height: "100%", background: "var(--accent)", borderRadius: 3 }} />
                </div>
                <span style={{ color: "var(--text2)", fontSize: 12, minWidth: 40, textAlign: "right" }}>{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Styles cho PlaceModal ────────────────────────────────────────────────────
const styles = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
  },
  modal: {
    background: "var(--surface, #fff)", borderRadius: 12,
    width: "min(600px, 95vw)", maxHeight: "90vh",
    display: "flex", flexDirection: "column",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 20px", borderBottom: "1px solid var(--border, #eee)",
  },
  modalBody: {
    padding: "20px", overflowY: "auto",
    display: "flex", flexDirection: "column", gap: 14,
  },
  modalFooter: {
    display: "flex", justifyContent: "flex-end", gap: 10,
    padding: "14px 20px", borderTop: "1px solid var(--border, #eee)",
  },
  input: {
    width: "100%", padding: "8px 10px", borderRadius: 7,
    border: "1px solid var(--border, #ddd)", fontSize: 13,
    background: "var(--surface2, #f8f8f8)", color: "var(--text1, #ddd)",
    boxSizing: "border-box",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  errorBox: {
    padding: "10px 14px", background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.25)", borderRadius: 7,
    color: "#dc2626", fontSize: 13,
  },
  btnPrimary: {
    padding: "8px 20px", borderRadius: 7, border: "none",
    background: "var(--accent, #4f8ef7)", color: "#fff",
    fontWeight: 600, fontSize: 13, cursor: "pointer",
  },
  btnSecondary: {
    padding: "8px 16px", borderRadius: 7,
    border: "1px solid var(--border, #ddd)", background: "transparent",
    color: "var(--text1, #111)", fontSize: 13, cursor: "pointer",
  },
  closeBtn: {
    background: "none", border: "none", fontSize: 16,
    cursor: "pointer", color: "var(--text2, #eee)", lineHeight: 1,
  },
};
