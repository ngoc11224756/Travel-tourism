const templates = [
  { id: 1, emoji: "🏛️", title: "Hà Nội Cổ điển", days: 2, count: 6 },
  { id: 2, emoji: "🍜", title: "Ẩm thực Phố cổ", days: 1, count: 5 },
  { id: 3, emoji: "🌿", title: "Thiên nhiên & Hồ", days: 1, count: 4 },
];

export default function PlanTemplates({ onSelect }) {
  return (
    <div
      className="wire-box"
      style={{
        padding: 16,
        borderColor: "var(--accent2)",
        background: "rgba(247,168,79,0.04)",
      }}
    >
      <span className="wire-label" style={{ color: "var(--accent2)" }}>
        Lộ trình mẫu
      </span>
      <div style={{ marginTop: 8, marginBottom: 12, fontSize: 13, color: "var(--text2)" }}>
        Chọn một lộ trình có sẵn để bắt đầu nhanh, sau đó tùy chỉnh theo ý muốn
      </div>
      <div className="grid-3">
        {templates.map((t) => (
          <div key={t.id} className="wire-solid" style={{ padding: 12, cursor: "pointer" }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>{t.emoji}</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{t.title}</div>
            <div style={{ fontSize: 11, color: "var(--text2)" }}>
              {t.days} ngày · {t.count} địa điểm
            </div>
            <button
              className="btn btn-sm"
              style={{
                marginTop: 8,
                background: "rgba(247,168,79,0.15)",
                color: "var(--accent2)",
                border: "1px solid rgba(247,168,79,0.3)",
              }}
              onClick={() => onSelect && onSelect(t)}
            >
              Dùng lộ trình này
            </button>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "var(--text2)" }}>
        ─── hoặc ───
      </div>
    </div>
  );
}
