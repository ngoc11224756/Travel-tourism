import { useState } from "react";
import { optimizeRoute, resolvePlaceCoords } from "../../services/RouteOptimizer";

/**
 * Nút "Tối ưu lộ trình" + modal hỏi nhu cầu user
 * Props:
 *   steps    - danh sách địa điểm hiện tại
 *   setSteps - cập nhật thứ tự sau khi tối ưu
 */
export default function RouteOptimizerModal({ steps, setSteps }) {
  const [open, setOpen] = useState(false);
  const [pinStart, setPinStart] = useState("");
  const [pinEnd, setPinEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { distanceKm }

  if (steps.length < 2) return null; // Không hiện nếu < 2 địa điểm

  const handleOptimize = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      // Geocode các địa điểm chưa có coords
      const placesWithCoords = await resolvePlaceCoords(steps);

      if (placesWithCoords.length < 2) {
        setError("Không thể xác định tọa độ của các địa điểm. Vui lòng thử lại.");
        return;
      }

      // Tìm index ràng buộc theo tên địa điểm user chọn
      const startIdx = pinStart
        ? placesWithCoords.findIndex((p) => p.id === pinStart)
        : 0;
      const endIdx = pinEnd
        ? placesWithCoords.findIndex((p) => p.id === pinEnd)
        : null;

      const { orderedPlaces, distanceKm } = await optimizeRoute(placesWithCoords, {
        pinStart: startIdx >= 0 ? startIdx : 0,
        pinEnd: endIdx >= 0 ? endIdx : null,
      });

      setSteps(orderedPlaces);
      setResult({ distanceKm });
    } catch (err) {
      setError("Tối ưu lộ trình thất bại. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setError("");
    setResult(null);
    setPinStart("");
    setPinEnd("");
  };

  return (
    <>
      {/* Nút mở modal */}
      <button
        className="btn btn-sm"
        style={{
          background: "rgba(99,153,34,0.12)",
          color: "var(--accent-green, #3B6D11)",
          border: "1px solid rgba(99,153,34,0.3)",
          marginTop: 8,
          marginLeft: 8,
        }}
        onClick={() => setOpen(true)}
      >
        🗺️ Tối ưu lộ trình
      </button>

      {/* Overlay + Modal */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: 12,
              padding: 24,
              width: "100%",
              maxWidth: 420,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>🗺️ Tối ưu lộ trình</div>
              <button
                className="btn btn-sm btn-secondary"
                onClick={handleClose}
                style={{ padding: "2px 8px" }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5 }}>
              Hệ thống sẽ tính toán thứ tự địa điểm ngắn nhất dựa trên khoảng cách thực tế.
              Bạn có thể chỉ định điểm ưu tiên bên dưới (tuỳ chọn).
            </div>

            {/* Chọn điểm đến trước */}
            <div className="field">
              <label style={{ fontSize: 13 }}>Muốn đến đâu trước? (tuỳ chọn)</label>
              <select
                value={pinStart}
                onChange={(e) => setPinStart(e.target.value)}
                style={{
                  fontSize: 13,
                  padding: "7px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "var(--surface2)",
                  color: "var(--text)",
                  width: "100%",
                }}
              >
                <option value="">-- Để hệ thống tự chọn --</option>
                {steps.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn điểm dừng cuối */}
            <div className="field">
              <label style={{ fontSize: 13 }}>Muốn dừng ở đâu cuối cùng? (tuỳ chọn)</label>
              <select
                value={pinEnd}
                onChange={(e) => setPinEnd(e.target.value)}
                style={{
                  fontSize: 13,
                  padding: "7px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "var(--surface2)",
                  color: "var(--text)",
                  width: "100%",
                }}
              >
                <option value="">-- Không cố định --</option>
                {steps
                  .filter((s) => s.id !== pinStart)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Kết quả */}
            {result && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "rgba(99,153,34,0.1)",
                  border: "1px solid rgba(99,153,34,0.25)",
                  fontSize: 13,
                  color: "var(--text)",
                }}
              >
                ✅ Đã tối ưu xong! Tổng quãng đường:{" "}
                <strong>{result.distanceKm} km</strong>. Danh sách địa điểm đã
                được sắp xếp lại — bạn có thể kéo thả để chỉnh thêm.
              </div>
            )}

            {/* Lỗi */}
            {error && (
              <div className="auth-error">⚠️ {error}</div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={handleClose}>
                {result ? "Đóng" : "Huỷ"}
              </button>
              {!result && (
                <button
                  className="btn btn-primary"
                  onClick={handleOptimize}
                  disabled={loading}
                >
                  {loading ? "Đang tính toán..." : "Tối ưu ngay"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
