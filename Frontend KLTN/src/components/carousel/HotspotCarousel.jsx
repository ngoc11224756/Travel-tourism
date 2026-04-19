import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const hotspots = [
  { id: 1, name: 'Hoàng Thành Thăng Long', type: '🏛 Di tích lịch sử', emoji: '🏛️', bg: 'linear-gradient(135deg,#1a2a1a,#2a3d2a)', rating: 4.9, reviews: 521 },
  { id: 2, name: 'Hồ Hoàn Kiếm',          type: '🌿 Thiên nhiên',     emoji: '🌊', bg: 'linear-gradient(135deg,#0d1f2d,#1a3040)', rating: 4.8, reviews: 1200 },
  { id: 3, name: 'Phố Ẩm thực Tạ Hiện',   type: '🍜 Ẩm thực',        emoji: '🍜', bg: 'linear-gradient(135deg,#2d1a0d,#3d2a10)', rating: 4.8, reviews: 876 },
  { id: 4, name: 'Văn Miếu Quốc Tử Giám', type: '🏛 Di tích',         emoji: '⛩️', bg: 'linear-gradient(135deg,#1a1a2d,#2a2a3d)', rating: 4.6, reviews: 340 },
  { id: 5, name: 'Bảo tàng Mỹ thuật VN',  type: '🎭 Văn hoá',         emoji: '🎨', bg: 'linear-gradient(135deg,#0d1a1a,#102828)', rating: 4.5, reviews: 198 },
  { id: 6, name: 'Chợ Đồng Xuân',         type: '🛍 Mua sắm',         emoji: '🛍️', bg: 'linear-gradient(135deg,#1e1420,#2a1830)', rating: 4.4, reviews: 423 },
];

export default function HotspotCarousel() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const maxIndex = 2;
  const timerRef = useRef(null);

  // Auto-slide
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    }, 3500);
    return () => clearInterval(timerRef.current);
  }, []);

  const slide = (dir) => {
    setIndex(prev => Math.max(0, Math.min(maxIndex, prev + dir)));
  };

  const slideWidth = `calc(25% - 12px)`;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="section-heading" style={{ marginBottom: 0 }}>🔥 Điểm hot khu vực</div>
        <span style={{ fontSize: 12, color: 'var(--accent)', cursor: 'pointer' }}>Xem tất cả →</span>
      </div>

      <div className="carousel-wrapper">
        <button className="carousel-btn prev" onClick={() => slide(-1)}>‹</button>
        <button className="carousel-btn next" onClick={() => slide(1)}>›</button>

        <div
          className="carousel-track"
          style={{ transform: `translateX(calc(-${index} * (25% + 4px)))` }}
        >
          {hotspots.map((item) => (
            <div key={item.id} className="carousel-slide" style={{ width: slideWidth }}>
              <div className="carousel-slide-img" style={{ background: item.bg }}>
                {item.emoji}
                <div className="carousel-overlay">
                  <button
                    className="carousel-cta"
                    onClick={() => navigate('/place')}
                  >
                    🧭 Khám phá ngay!
                  </button>
                </div>
              </div>
              <div className="carousel-slide-body">
                <div className="carousel-slide-name">{item.name}</div>
                <div className="carousel-slide-type">{item.type}</div>
                <div className="rating">
                  {'★'.repeat(Math.floor(item.rating))}
                  {'☆'.repeat(5 - Math.floor(item.rating))}
                  {' '}{item.rating}
                  <span style={{ color: 'var(--text2)', marginLeft: 4 }}>
                    ({item.reviews > 999 ? `${(item.reviews/1000).toFixed(1)}k` : item.reviews})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="carousel-nav">
          {[0, 1, 2].map(i => (
            <button
              key={i}
              className={`carousel-dot${index === i ? ' active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
