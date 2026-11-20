import { Link } from 'react-router-dom';

// Dữ liệu giả lập tuần 1 — sẽ thay bằng API thống kê (US-16) khi backend hoàn thiện.
const MOCK_SUMMARY = [
  { label: 'Tổng số hộ gia đình', value: '120 hộ' },
  { label: 'Tổng số cư dân đang cư trú', value: '415 người' },
  { label: 'Phí bắt buộc phải thu (11/2026)', value: '84.000.000 đ' },
  { label: 'Phí bắt buộc đã thu (11/2026)', value: '62.500.000 đ' },
  { label: 'Phí bắt buộc còn thiếu', value: '21.500.000 đ' },
  { label: 'Đóng góp tự nguyện (tách riêng)', value: '12.000.000 đ' },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="alert alert-warn">
        <strong>Lưu ý dữ liệu giả (Mock Data — Tuần 1):</strong> Các số liệu tổng
        quan dưới đây chỉ dùng minh họa bố cục màn hình chính. Để kiểm tra kết nối
        thật tới Spring Boot và MySQL, hãy mở mục{' '}
        <Link to="/api-test">Thử gọi API (Health)</Link>.
      </div>

      <div className="grid-cards">
        {MOCK_SUMMARY.map((item) => (
          <div key={item.label} className="stat-card">
            <div className="stat-label">{item.label}</div>
            <div className="stat-value">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Lối tắt kiểm tra bộ khung tuần 1</h3>
        <div className="btn-row">
          <Link to="/api-test" className="btn btn-primary">
            Kiểm tra kết nối Backend &amp; MySQL
          </Link>
          <Link to="/households" className="btn">
            Xem khung Hộ gia đình
          </Link>
          <Link to="/residents" className="btn">
            Xem khung Cư dân &amp; Biến động cư trú
          </Link>
          <Link to="/fees" className="btn">
            Xem khung Khoản thu &amp; Chứng từ
          </Link>
        </div>
      </div>
    </div>
  );
}
