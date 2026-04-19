import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    setLoading(true);
    try {
      // Gọi API thật — identifier có thể là email hoặc SĐT
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.detail;
      if (message) {
        setError(message);
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">

      {/* ===== CỘT TRÁI – Visual panel ===== */}
      <div className="auth-visual">
        <div className="auth-visual-overlay" />
        <div className="auth-visual-dots" />

        <div className="auth-visual-content">
          <div className="auth-visual-logo">
            <span className="auth-visual-logo-icon">🌏</span>
            <span className="auth-visual-logo-text">VietTravel AI</span>
          </div>

          <div className="auth-visual-headline">
            Khám phá Việt Nam<br />
            theo cách <span>của bạn</span>
          </div>

          <div className="auth-visual-desc">
            Hơn 1.200 địa điểm du lịch · Gợi ý AI cá nhân hoá ·
            Lập kế hoạch thông minh
          </div>

          {/* Stats */}
          <div className="auth-visual-stats">
            <div className="auth-stat">
              <div className="auth-stat-value">1,200+</div>
              <div className="auth-stat-label">Địa điểm</div>
            </div>
            <div className="auth-stat-divider" />
            <div className="auth-stat">
              <div className="auth-stat-value">4,800+</div>
              <div className="auth-stat-label">Đánh giá</div>
            </div>
            <div className="auth-stat-divider" />
            <div className="auth-stat">
              <div className="auth-stat-value">1,200+</div>
              <div className="auth-stat-label">Thành viên</div>
            </div>
          </div>
        </div>

        {/* Decorative map markers */}
        <div className="auth-deco-marker" style={{ top: '20%', left: '15%', animationDelay: '0s' }}>📍</div>
        <div className="auth-deco-marker" style={{ top: '60%', left: '70%', animationDelay: '0.8s' }}>📍</div>
        <div className="auth-deco-marker" style={{ top: '75%', left: '25%', animationDelay: '1.5s' }}>📍</div>
        <div className="auth-deco-marker" style={{ top: '35%', left: '80%', animationDelay: '0.4s' }}>📍</div>
      </div>

      {/* ===== CỘT PHẢI – Form đăng nhập ===== */}
      <div className="auth-form-panel">
        <div className="auth-form-card">

          {/* Header */}
          <div className="auth-form-header">
            <div className="auth-form-title">Đăng nhập</div>
            <div className="auth-form-sub">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="auth-link">Đăng ký ngay</Link>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-error">
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">

            <div className="auth-field">
              <label>Email hoặc số điện thoại</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  {/^\d+$/.test(form.email) ? '📱' : '✉️'}
                </span>
                <input
                  type="text"
                  name="email"
                  placeholder="Email hoặc số điện thoại"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="auth-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Mật khẩu</label>
                <span className="auth-link" style={{ fontSize: 12, cursor: 'pointer' }}>
                  Quên mật khẩu?
                </span>
              </div>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Nhập mật khẩu..."
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={`auth-eye-btn ${showPassword ? 'eye-open' : 'eye-closed'}`}
                  onClick={() => setShowPassword(p => !p)}
                >
                  {showPassword ? '👁' : '👁‍🗨'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="remember" style={{ accentColor: 'var(--accent)', cursor: 'pointer' }} />
              <label htmlFor="remember" style={{ fontSize: 13, color: 'var(--text2)', cursor: 'pointer' }}>
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button
              type="submit"
              className={`auth-submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                'Đăng nhập →'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>hoặc tiếp tục với</span>
          </div>

          {/* Social login */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="auth-social-btn">
              <span>🌐</span> Google
            </button>
            <button className="auth-social-btn">
              <span>📘</span> Facebook
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
