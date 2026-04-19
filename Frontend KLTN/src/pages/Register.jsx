import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim())        errs.fullName = 'Vui lòng nhập họ tên.';
    if (!form.email.includes('@'))    errs.email = 'Email không hợp lệ.';
    if (form.password.length < 6)     errs.password = 'Mật khẩu tối thiểu 6 ký tự.';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register({
        full_name: form.fullName,
        email: form.email || null,
        phone: form.phone || null,
        password: form.password,
      });
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.detail;
      setErrors({ general: message || 'Đăng ký thất bại. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra độ mạnh mật khẩu
  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return { level: 0, label: '', color: '' };
    if (p.length < 6)  return { level: 1, label: 'Yếu', color: 'var(--red)' };
    if (p.length < 10) return { level: 2, label: 'Trung bình', color: 'var(--accent2)' };
    return { level: 3, label: 'Mạnh', color: 'var(--green)' };
  };
  const strength = getPasswordStrength();

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
            Tham gia cộng đồng<br />
            du lịch <span>thông minh</span>
          </div>

          <div className="auth-visual-desc">
            Tạo tài khoản miễn phí để lưu kế hoạch, nhận gợi ý AI
            cá nhân hoá và chia sẻ trải nghiệm du lịch.
          </div>

          {/* Benefits list */}
          <div className="auth-benefits">
            {[
              { icon: '🤖', text: 'Gợi ý địa điểm từ AI theo sở thích' },
              { icon: '📋', text: 'Tạo và lưu kế hoạch du lịch' },
              { icon: '⭐', text: 'Đánh giá và chia sẻ trải nghiệm' },
              { icon: '🗺️', text: 'Xem bản đồ địa điểm tương tác' },
            ].map((b, i) => (
              <div key={i} className="auth-benefit-item">
                <span className="auth-benefit-icon">{b.icon}</span>
                <span>{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-deco-marker" style={{ top: '15%', left: '20%', animationDelay: '0s' }}>📍</div>
        <div className="auth-deco-marker" style={{ top: '55%', left: '75%', animationDelay: '1s' }}>📍</div>
        <div className="auth-deco-marker" style={{ top: '80%', left: '30%', animationDelay: '0.5s' }}>📍</div>
      </div>

      {/* ===== CỘT PHẢI – Form đăng ký ===== */}
      <div className="auth-form-panel">
        <div className="auth-form-card">

          <div className="auth-form-header">
            <div className="auth-form-title">Tạo tài khoản</div>
            <div className="auth-form-sub">
              Đã có tài khoản?{' '}
              <Link to="/login" className="auth-link">Đăng nhập</Link>
            </div>
          </div>
          {errors.general && (
            <div className="auth-error">⚠️ {errors.general}</div>
          )}
          <form onSubmit={handleSubmit} className="auth-form">

            {/* Họ tên */}
            <div className="auth-field">
              <label>Họ và tên</label>
              <div className={`auth-input-wrap ${errors.fullName ? 'error' : ''}`}>
                <span className="auth-input-icon">👤</span>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Nguyễn Văn An"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </div>
              {errors.fullName && <div className="auth-field-error">{errors.fullName}</div>}
            </div>

            {/* Email */}
            <div className="auth-field">
              <label>Email</label>
              <div className={`auth-input-wrap ${errors.email ? 'error' : ''}`}>
                <span className="auth-input-icon">✉️</span>
                <input
                  type="email"
                  name="email"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <div className="auth-field-error">{errors.email}</div>}
            </div>
            {/* Số điện thoại – không bắt buộc */}
            <div className="auth-field">
              <label>Số điện thoại <span style={{ color: 'var(--text2)', fontWeight: 400 }}>(tuỳ chọn)</span></label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">📱</span>
                <input
                  type="tel"
                  name="phone"
                  placeholder="0912 345 678"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="auth-field">
              <label>Mật khẩu</label>
              <div className={`auth-input-wrap ${errors.password ? 'error' : ''}`}>
                <span className="auth-input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={form.password}
                  onChange={handleChange}
                />
                <button type="button" className="auth-eye-btn"
                  onClick={() => setShowPassword(p => !p)}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {/* Password strength bar */}
              {form.password && (
                <div className="auth-strength">
                  <div className="auth-strength-bar">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="auth-strength-seg"
                        style={{ background: i <= strength.level ? strength.color : 'var(--border)' }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: strength.color }}>{strength.label}</span>
                </div>
              )}
              {errors.password && <div className="auth-field-error">{errors.password}</div>}
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="auth-field">
              <label>Xác nhận mật khẩu</label>
              <div className={`auth-input-wrap ${errors.confirmPassword ? 'error' : ''}`}>
                <span className="auth-input-icon">🔐</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <span style={{ color: 'var(--green)', fontSize: 16, paddingRight: 10 }}>✓</span>
                )}
              </div>
              {errors.confirmPassword && <div className="auth-field-error">{errors.confirmPassword}</div>}
            </div>

            {/* Terms */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <input type="checkbox" id="terms" required
                style={{ accentColor: 'var(--accent)', marginTop: 2, cursor: 'pointer' }} />
              <label htmlFor="terms" style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5, cursor: 'pointer' }}>
                Tôi đồng ý với{' '}
                <span className="auth-link">Điều khoản dịch vụ</span>
                {' '}và{' '}
                <span className="auth-link">Chính sách bảo mật</span>
              </label>
            </div>

            <button type="submit"
              className={`auth-submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Tạo tài khoản →'}
            </button>
          </form>

          <div className="auth-divider"><span>hoặc đăng ký với</span></div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="auth-social-btn"><span>🌐</span> Google</button>
            <button className="auth-social-btn"><span>📘</span> Facebook</button>
          </div>

        </div>
      </div>

    </div>
  );
}
