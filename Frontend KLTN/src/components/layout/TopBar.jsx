import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './TopBar.css';

export default function TopBar() {
  const { user, logout, isLoggedIn } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lấy chữ cái đầu tên để làm avatar
  const initials = user?.full_name
  ? user.full_name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()
  : '?';

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  if (!isLoggedIn) return null; // Ẩn TopBar khi chưa login

  return (
    <div className="topbar">
      {/* Logo / App name */}
      <div className="topbar-brand" onClick={() => navigate('/')}>
        <span className="topbar-logo">🌏</span>
        <span className="topbar-name">VietTravel AI</span>
      </div>

      {/* User info + dropdown */}
      <div className="topbar-user" ref={dropdownRef}>
        <button
          className="topbar-user-btn"
          onClick={() => setDropdownOpen(prev => !prev)}
        >
          {/* Avatar */}
          <div className="topbar-avatar">
            {user.avatar
              ? <img src={user.avatar} alt={user.full_name} />
              : <span>{initials}</span>
            }
          </div>

          {/* Tên user */}
          <div className="topbar-user-info">
            <div className="topbar-user-name">{user.full_name}</div>
            <div className="topbar-user-email">{user.email}</div>
          </div>

          {/* Chevron */}
          <span className={`topbar-chevron ${dropdownOpen ? 'open' : ''}`}>▾</span>
        </button>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <div className="topbar-dropdown">
            <div className="topbar-dropdown-header">
              <div className="topbar-dropdown-avatar">
                <span>{initials}</span>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{user.full_name}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>{user.email}</div>
              </div>
            </div>

            <div className="topbar-dropdown-divider" />

            <button className="topbar-dropdown-item" onClick={() => { navigate('/profile'); setDropdownOpen(false); }}>
              👤 Hồ sơ của tôi
            </button>
            <button className="topbar-dropdown-item" onClick={() => { navigate('/plan'); setDropdownOpen(false); }}>
              📋 Kế hoạch của tôi
              <span className="topbar-dropdown-badge">{user.plansCount}</span>
            </button>
            <button className="topbar-dropdown-item" onClick={() => { navigate('/review'); setDropdownOpen(false); }}>
              ⭐ Đánh giá của tôi
              <span className="topbar-dropdown-badge">{user.reviewsCount}</span>
            </button>

            <div className="topbar-dropdown-divider" />

            <button className="topbar-dropdown-item danger" onClick={handleLogout}>
              🚪 Đăng xuất
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
