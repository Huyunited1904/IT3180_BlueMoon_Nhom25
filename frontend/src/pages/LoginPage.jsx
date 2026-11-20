import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formMessage, setFormMessage] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const errors = {};

    if (!username.trim()) {
      errors.username =
        'Tên đăng nhập không được để trống. Vui lòng nhập tài khoản được cấp.';
    }
    if (!password) {
      errors.password =
        'Mật khẩu không được để trống. Vui lòng nhập mật khẩu của bạn.';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormMessage('Vui lòng kiểm tra thông tin đăng nhập đã nhập.');
      return;
    }

    // Tuần 1 chưa có API POST /api/auth/login: chuyển vào trang chính để kiểm thử điều hướng.
    setFormMessage('');
    navigate('/dashboard');
  }

  return (
    <div className="login-wrapper">
      <div className="card login-card">
        <h2>Đăng nhập BlueMoon</h2>
        <p style={{ color: '#475569', marginTop: 0 }}>
          Hệ thống quản lý cư dân và thu phí chung cư (Tài khoản nội bộ).
        </p>

        <div className="alert alert-warn">
          <strong>Chế độ khung tuần 1 (Giả lập):</strong> API{' '}
          <code>POST /api/auth/login</code> chưa được triển khai ở backend. Nhập
          tên đăng nhập và mật khẩu bất kỳ để vào kiểm thử điều hướng giao diện.
        </div>

        {formMessage && <div className="alert alert-danger">{formMessage}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="username">Tên đăng nhập *</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ví dụ: qlcudan01"
              autoComplete="username"
            />
            {fieldErrors.username && (
              <span className="field-error">{fieldErrors.username}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="password">Mật khẩu *</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
            />
            {fieldErrors.password && (
              <span className="field-error">{fieldErrors.password}</span>
            )}
          </div>

          <div className="btn-row">
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
