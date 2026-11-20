import { useState } from 'react';

// Dữ liệu giả lập tuần 1 — dùng đúng ví dụ nghiệp vụ của nhóm (70 m² × 10.000 đ = 700.000 đ).
const MOCK_NOTICE = {
  householdCode: 'HO-001',
  apartmentCode: 'A1201',
  headOfHouseholdName: 'Nguyễn Văn An',
  area: 70,
  feeName: 'Phí quản lý chung cư',
  period: 'Tháng 11/2026',
  unitPrice: 10000,
  totalDue: 700000,
  paidAmount: 300000,
  remainingAmount: 400000,
  dueDate: '30/11/2026',
};

const MOCK_RECEIPT = {
  transactionCode: 'GD-20261115-001',
  householdCode: 'HO-001',
  apartmentCode: 'A1201',
  headOfHouseholdName: 'Nguyễn Văn An',
  feeName: 'Phí quản lý chung cư — Tháng 11/2026',
  amount: 300000,
  paymentDate: '15/11/2026',
  remainingAfter: 400000,
};

function formatVnd(value) {
  return `${value.toLocaleString('vi-VN')} đ`;
}

export default function FeesPage() {
  const [activeDoc, setActiveDoc] = useState('notice');

  return (
    <div>
      <div className="alert alert-warn no-print">
        <strong>Dữ liệu giả lập (Mock Data — Tuần 1):</strong> Minh họa mẫu xem
        trước &amp; in Thông báo thu tiền (US-12) và Biên nhận thu tiền (US-13).
        In lại biên nhận không tạo thêm giao dịch mới.
      </div>

      <div className="card no-print">
        <div className="btn-row">
          <button
            type="button"
            className={`btn ${activeDoc === 'notice' ? 'btn-primary' : ''}`}
            onClick={() => setActiveDoc('notice')}
          >
            Xem trước Thông báo thu tiền (US-12)
          </button>
          <button
            type="button"
            className={`btn ${activeDoc === 'receipt' ? 'btn-primary' : ''}`}
            onClick={() => setActiveDoc('receipt')}
          >
            Xem trước Biên nhận thu tiền (US-13)
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => window.print()}
          >
            In chứng từ đang xem
          </button>
        </div>
      </div>

      {activeDoc === 'notice' ? (
        <div className="doc-preview">
          <h2 style={{ textAlign: 'center', marginBottom: 4 }}>
            THÔNG BÁO THU TIỀN
          </h2>
          <p style={{ textAlign: 'center', marginTop: 0, color: '#475569' }}>
            Ban Quản trị Chung cư BlueMoon — Kỳ thu: {MOCK_NOTICE.period}
          </p>
          <p>
            <strong>Mã hộ:</strong> {MOCK_NOTICE.householdCode} |{' '}
            <strong>Căn hộ:</strong> {MOCK_NOTICE.apartmentCode} |{' '}
            <strong>Chủ hộ:</strong> {MOCK_NOTICE.headOfHouseholdName}
          </p>
          <p>
            <strong>Diện tích:</strong> {MOCK_NOTICE.area} m² |{' '}
            <strong>Hạn đóng:</strong> {MOCK_NOTICE.dueDate}
          </p>
          <table>
            <thead>
              <tr>
                <th>Khoản thu</th>
                <th>Cách tính</th>
                <th>Phải thu</th>
                <th>Đã đóng</th>
                <th>Còn thiếu</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{MOCK_NOTICE.feeName}</td>
                <td>
                  {MOCK_NOTICE.area} m² × {formatVnd(MOCK_NOTICE.unitPrice)}/m²
                </td>
                <td>{formatVnd(MOCK_NOTICE.totalDue)}</td>
                <td>{formatVnd(MOCK_NOTICE.paidAmount)}</td>
                <td>
                  <strong>{formatVnd(MOCK_NOTICE.remainingAmount)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="doc-preview">
          <h2 style={{ textAlign: 'center', marginBottom: 4 }}>
            BIÊN NHẬN THU TIỀN
          </h2>
          <p style={{ textAlign: 'center', marginTop: 0, color: '#475569' }}>
            Mã giao dịch: <strong>{MOCK_RECEIPT.transactionCode}</strong>
          </p>
          <p>
            <strong>Mã hộ:</strong> {MOCK_RECEIPT.householdCode} |{' '}
            <strong>Căn hộ:</strong> {MOCK_RECEIPT.apartmentCode} |{' '}
            <strong>Chủ hộ:</strong> {MOCK_RECEIPT.headOfHouseholdName}
          </p>
          <p>
            <strong>Khoản thu:</strong> {MOCK_RECEIPT.feeName}
          </p>
          <p>
            <strong>Ngày đóng:</strong> {MOCK_RECEIPT.paymentDate}
          </p>
          <p>
            <strong>Số tiền đã nộp:</strong>{' '}
            <strong>{formatVnd(MOCK_RECEIPT.amount)}</strong> (Còn thiếu sau lần
            đóng: {formatVnd(MOCK_RECEIPT.remainingAfter)})
          </p>
        </div>
      )}
    </div>
  );
}
