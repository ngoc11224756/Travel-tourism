import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HotspotCarousel from '../components/carousel/HotspotCarousel';
import MapMock from '../components/map/MapMock';

const categories = [
  { label: '🏛 Di tích' },
  { label: '🍜 Ẩm thực' },
  { label: '🌿 Thiên nhiên' },
  { label: '🛍 Mua sắm' },
  { label: '🏨 Lưu trú' },
  { label: '🎭 Giải trí' },
];

export default function HomeGuest() {
  const navigate = useNavigate();
  const { login } = useAuth();

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-title">Trang chủ</div>
          <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>
            Banner khẩu hiệu · Carousel điểm hot · Danh mục · Bản đồ
          </div>
        </div>
        {/* Nút đăng nhập / đăng ký */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>
            Đăng nhập
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>
            Đăng ký
          </button>
        </div>
      </div>

      <div className="screen-body">

        {/* Search bar */}
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Tìm địa điểm, loại hình, từ khoá…"
            onKeyDown={(e) => e.key === 'Enter' && navigate('/search')}
          />
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/map')}>
            🗺 Bản đồ
          </button>
        </div>

        {/* 2 cột: Banner + Bản đồ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '3fr 2fr',
          gap: 16,
          alignItems: 'stretch',
        }}>
          <div className="hero-banner" style={{ height: '100%', minHeight: 180 }}>
            <div className="hero-banner-dots" />
            <div className="hero-banner-art">🌏</div>
            <div className="hero-banner-badge">✦ Mùa hè 2025</div>
            <div className="hero-banner-content">
              <div className="hero-banner-eyebrow">Khám phá Việt Nam</div>
              <div className="hero-banner-title">
                Hành trình của bạn<br />bắt đầu từ <span>đây</span>
              </div>
              <div className="hero-banner-sub">
                Hơn 1.200 địa điểm du lịch được tuyển chọn — di tích,
                ẩm thực, thiên nhiên, văn hoá.
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <MapMock height="100%" showCta onOpen={() => navigate('/map')} />
            <div style={{
              position: 'absolute', top: 10, left: 12,
              background: 'rgba(15,17,23,0.75)',
              border: '1px solid var(--border)',
              borderRadius: 6, padding: '4px 10px',
              fontSize: 11, color: 'var(--text2)',
              backdropFilter: 'blur(4px)', zIndex: 11,
            }}>
              📍 Hà Nội · 24 địa điểm
            </div>
          </div>
        </div>

        {/* Carousel */}
        <HotspotCarousel />

        {/* Categories */}
        <div>
          <div className="section-heading">Danh mục</div>
          <div className="tag-row">
            {categories.map((cat, i) => (
              <button key={i} className={`tag${i === 0 ? ' active' : ''}`}
                onClick={() => navigate('/search')}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
