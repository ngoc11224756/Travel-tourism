// MapMock.jsx
// Đây là bản đồ giả (wireframe).
// Khi tích hợp Google Maps API thật, thay toàn bộ file này bằng:
//   import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api'

export default function MapMock({ height = 300, showCta = false, onOpen }) {
  return (
    <div className="map-area" style={{ height, position: 'relative' }}>
      <div className="map-grid" />

      {/* Markers */}
      <div className="map-marker"       style={{ top: '25%', left: '38%' }} />
      <div className="map-marker hot"   style={{ top: '40%', left: '52%' }} />
      <div className="map-marker green" style={{ top: '52%', left: '33%' }} />
      <div className="map-marker"       style={{ top: '20%', left: '62%' }} />
      <div className="map-marker hot"   style={{ top: '63%', left: '58%' }} />
      <div className="map-marker green" style={{ top: '35%', left: '70%' }} />

      {/* Controls */}
      <div className="map-controls">
        <div className="map-ctrl-btn">＋</div>
        <div className="map-ctrl-btn">－</div>
        <div className="map-ctrl-btn">⊙</div>
      </div>

      <div className="map-label">
        📍 Hà Nội &nbsp;|&nbsp; 🔵 Di tích &nbsp; 🟠 Ẩm thực &nbsp; 🟢 Thiên nhiên
      </div>

      {/* CTA Overlay – hiện trên trang Home */}
      {showCta && (
        <div className="map-cta-overlay">
          <div className="map-cta-title">📍 Xem bản đồ đầy đủ</div>
          <div className="map-cta-sub">Tìm địa điểm theo vị trí · Zoom · Lọc theo danh mục</div>
          <button className="btn btn-primary" onClick={onOpen} style={{ marginTop: 4 }}>
            🗺 Mở bản đồ
          </button>
        </div>
      )}
    </div>
  );
}
