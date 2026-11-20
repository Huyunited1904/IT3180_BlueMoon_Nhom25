import { NavLink, Outlet, useLocation } from 'react-router-dom';

const MENU_ITEMS = [
  { to: '/dashboard', label: 'Trang chính' },
  { to: '/households', label: 'Hộ gia đình' },
  { to: '/residents', label: 'Cư dân & Biến động' },
  { to: '/fees', label: 'Khoản thu & Chứng từ' },
  { to: '/api-test', label: 'Thử gọi API (Health)' },
  { to: '/login', label: 'Màn hình Đăng nhập' },
];

const PAGE_TITLES = {
  '/dashboard': 'Trang chính tổng quan',
  '/households': 'Quản lý Hộ gia đình (US-04, US-15)',
  '/residents': 'Cư dân & Biến động cư trú (US-05, US-06, US-07)',
  '/fees': 'Khoản thu, Đóng tiền & Chứng từ (US-08..14)',
  '/api-test': 'Kiểm tra kết nối React — Spring Boot — MySQL',
};

export default function Layout() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Hệ thống BlueMoon';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <h1>BlueMoon</h1>
          <span>Nhóm 25 • Bộ khung Tuần 1</span>
        </div>

        <nav className="nav-list" aria-label="Điều hướng chính">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-title">{title}</div>
          <div className="topbar-meta">
            <span className="badge badge-warn">Phiên bản khung tuần 1</span>
            <span>Nhân sự nội bộ (Chưa bật xác thực)</span>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
