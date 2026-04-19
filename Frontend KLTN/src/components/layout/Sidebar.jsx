import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";

const userLinks = [
  { to: "/", icon: "🏠", label: "Trang chủ" },
  { to: "/map", icon: "🗺️", label: "UC1 – Xem bản đồ" },
  { to: "/search", icon: "🔍", label: "UC2 – Tìm kiếm" },
  { to: "/place", icon: "📍", label: "UC3 – Chi tiết địa điểm" },
  { to: "/ai", icon: "🤖", label: "UC5 – Gợi ý AI" },
  { to: "/plan/create", icon: "📋", label: "UC6 – Tạo kế hoạch" },
  { to: "/plan", icon: "⚙️", label: "UC7 – Quản lý kế hoạch" },
  { to: "/chat", icon: "💬", label: "UC9 – Chat AI" },
  { to: "/review/write/1", icon: "✍️", label: "UC10 – Viết đánh giá" },
  { to: "/review", icon: "⭐", label: "UC11 – Xem đánh giá" },
];

const adminLinks = [
  { to: "/admin/login", icon: "🔐", label: "UC12 – Đăng nhập" },
  { to: "/admin/places", icon: "🏛️", label: "UC13 – Quản lý địa điểm" },
  { to: "/admin/users", icon: "👥", label: "UC14 – Quản lý user" },
  { to: "/admin/reviews", icon: "💬", label: "UC15 – Quản lý đánh giá" },
  { to: "/admin/stats", icon: "📊", label: "UC16 – Thống kê" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const closeMobile = () => setMobileOpen(false);

  const NavItems = ({ onClickItem }) => (
    <>
      <div className="nav-group">
        <div className="nav-group-label">{collapsed ? "·" : "👤 User"}</div>
        {userLinks.map((link) => (
          <NavLink
            key={link.to}
  to={link.to}
  className={({ isActive }) => {
    let active = isActive;

    // UC10 – Viết đánh giá
    if (link.to.startsWith('/review/write')) {
      active = location.pathname.startsWith('/review/write');
    }

    // UC11 – Xem đánh giá
    if (link.to === '/review') {
      active = location.pathname === '/review';
    }

    return `nav-item${active ? ' active' : ''}${collapsed ? ' collapsed' : ''}`;
  }}
  onClick={onClickItem}
  title={collapsed ? link.label : undefined}
          >
            <div className="icon">{link.icon}</div>
            {!collapsed && <span className="nav-label">{link.label}</span>}
          </NavLink>
        ))}
      </div>

      <div className="nav-group">
        <div className="nav-group-label">{collapsed ? "·" : "🛡️ Admin"}</div>
        {adminLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `nav-item${isActive ? " active" : ""}${collapsed ? " collapsed" : ""}`
            }
            onClick={onClickItem}
            title={collapsed ? link.label : undefined}
          >
            <div className="icon">{link.icon}</div>
            {!collapsed && <span className="nav-label">{link.label}</span>}
          </NavLink>
        ))}
      </div>
    </>
  );

  return (
    <>
      {/* ===== NAVBAR MOBILE ===== */}
      <div className="mobile-navbar">
        <div className="mobile-navbar-logo">
          <span className="mobile-logo-text">VietTravel AI</span>
        </div>
        <button
          className="hamburger-btn"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-icon ${mobileOpen ? "open" : ""}`}>
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      {/* ===== DRAWER MOBILE ===== */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={closeMobile}>
          <nav className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-logo">
              <div className="logo-title">VietTravel AI</div>
              <div className="logo-sub">Wireframe System</div>
            </div>
            <NavItems onClickItem={closeMobile} />
          </nav>
        </div>
      )}

      {/* ===== SIDEBAR DESKTOP ===== */}
      <nav className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
        {/* Logo – ẩn text khi collapsed */}
        <div className="sidebar-logo">
          {!collapsed && (
            <>
              <div className="logo-title">VietTravel AI</div>
              <div className="logo-sub">Wireframe System</div>
            </>
          )}
          {collapsed && <div className="logo-icon-only">🌏</div>}
        </div>

        {/* Nav items */}
        <div className="sidebar-inner">
          <NavItems onClickItem={undefined} />
        </div>

        {/* ===== NÚT MŨI TÊN COLLAPSE – nhô ra giữa cạnh phải ===== */}
        <button
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed((prev) => !prev)}
          title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
        >
          <span className={`collapse-arrow ${collapsed ? "right" : "left"}`}>
            ‹
          </span>
        </button>
      </nav>
    </>
  );
}
