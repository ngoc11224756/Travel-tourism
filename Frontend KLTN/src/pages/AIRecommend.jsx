// ===================== UC5 – Gợi ý AI =====================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const suggestions = [
  { id: 1, name: 'Văn Miếu Quốc Tử Giám', emoji: '🏛️', type: 'Di tích · Đống Đa', rating: 4.8, match: 98 },
  { id: 2, name: 'Bún Chả Hương Liên',    emoji: '🍜', type: 'Ẩm thực · Đống Đa',  rating: 4.9, match: 95 },
  { id: 3, name: 'Bảo tàng Mỹ thuật',     emoji: '🎨', type: 'Văn hoá · Ba Đình',   rating: 4.6, match: 90 },
];

export function AIRecommend() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(['🏛 Lịch sử', '🍜 Ẩm thực']);
  const tags = ['🏛 Lịch sử', '🍜 Ẩm thực', '🌿 Thiên nhiên', '🎭 Văn hoá', '🛍 Mua sắm'];

  const toggle = (t) =>
    setSelected(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-title">Gợi ý từ AI</div>
          <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>
            AI phân tích ngữ cảnh và đề xuất địa điểm phù hợp
          </div>
        </div>
        <div className="uc-badge">UC5 – Nhận gợi ý AI</div>
      </div>

      <div className="screen-body">
        <div className="wire-box ai-glow" style={{ padding: 18 }}>
          <span className="wire-label">Nhập sở thích để AI phân tích</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            <div className="tag-row">
              {tags.map(t => (
                <button key={t} className={`tag${selected.includes(t) ? ' active' : ''}`}
                  onClick={() => toggle(t)}>{t}</button>
              ))}
            </div>
            <div className="field">
              <label>Mô tả chuyến đi (tuỳ chọn)</label>
              <input placeholder="VD: 2 ngày ở Hà Nội, muốn khám phá ẩm thực và lịch sử..." />
            </div>
            <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              🤖 Nhận gợi ý AI
            </button>
          </div>
        </div>

        <div>
          <div className="section-heading">🤖 AI đề xuất cho bạn</div>
          <div style={{
            background: 'rgba(79,142,247,0.05)',
            border: '1px solid rgba(79,142,247,0.2)',
            borderRadius: 'var(--radius)', padding: 14,
            marginBottom: 12, fontSize: 13, color: 'var(--text2)', lineHeight: 1.7,
          }}>
            Dựa trên sở thích <strong style={{ color: 'var(--accent)' }}>Lịch sử + Ẩm thực</strong>,
            AI gợi ý lộ trình kết hợp tham quan di tích buổi sáng và trải nghiệm ẩm thực phố cổ buổi chiều...
          </div>

          <div className="grid-3">
            {suggestions.map(s => (
              <div key={s.id} className="card" onClick={() => navigate('/place')}>
                <div className="card-img" style={{ height: 90 }}>{s.emoji}</div>
                <div className="card-body">
                  <div className="card-title">{s.name}</div>
                  <div className="card-sub">{s.type}</div>
                  <div className="rating">
                    {s.rating >= 4.8 ? '★★★★★' : '★★★★☆'} {s.rating}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 6 }}>
                    🤖 Phù hợp {s.match}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/plan/create')}>
              ＋ Tạo kế hoạch từ gợi ý này
            </button>
            <button className="btn btn-secondary btn-sm">🔄 Gợi ý lại</button>
          </div>
        </div>
      </div>
    </div>
  );
}
