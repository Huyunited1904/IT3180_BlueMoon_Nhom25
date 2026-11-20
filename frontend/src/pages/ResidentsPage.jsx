import { useState } from 'react';

// Dữ liệu giả lập tuần 1 — khớp cấu trúc DTO mục 7.7 trong docs/design/api-search.md.
const MOCK_HISTORY = [
  {
    eventId: 9002,
    eventType: 'TEMPORARY_ABSENCE',
    eventLabel: 'Tạm vắng',
    residentCode: 'CD-001',
    fullName: 'Nguyễn Văn An',
    householdCode: 'HO-001',
    effectiveDate: '2026-11-12',
    endDate: '2026-11-15',
  },
  {
    eventId: 9001,
    eventType: 'MOVE_IN',
    eventLabel: 'Chuyển đến',
    residentCode: 'CD-001',
    fullName: 'Nguyễn Văn An',
    householdCode: 'HO-001',
    effectiveDate: '2026-11-10',
    endDate: null,
  },
];

export default function ResidentsPage() {
  const [recordType, setRecordType] = useState('TEMPORARY_ABSENCE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [validationMsg, setValidationMsg] = useState('');

  function handleValidateSample(event) {
    event.preventDefault();
    if (!startDate) {
      setValidationMsg(
        'Ngày bắt đầu không được để trống. Vui lòng chọn ngày bắt đầu hợp lệ.'
      );
      return;
    }
    if (endDate && endDate < startDate) {
      setValidationMsg(
        'Ngày kết thúc không được nhỏ hơn ngày bắt đầu. Vui lòng chọn lại khoảng thời gian hợp lệ.'
      );
      return;
    }
    setValidationMsg(
      'Dữ liệu biểu mẫu tạm trú/tạm vắng hợp lệ (chưa gọi API lưu trong tuần 1).'
    );
  }

  return (
    <div>
      <div className="alert alert-warn">
        <strong>Dữ liệu giả lập (Mock Data — Tuần 1):</strong> Minh họa bố cục
        lịch sử biến động cư trú (US-06, US-07, US-15) và kiểm tra ràng buộc ngày
        hiệu lực theo NFR-007.
      </div>

      <div className="card">
        <h3>Kiểm tra nhanh biểu mẫu Tạm trú / Tạm vắng (US-07)</h3>
        {validationMsg && (
          <div className="alert alert-warn">{validationMsg}</div>
        )}
        <form onSubmit={handleValidateSample} className="form-grid" noValidate>
          <div className="field">
            <label htmlFor="res-type">Loại đăng ký *</label>
            <select
              id="res-type"
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
            >
              <option value="TEMPORARY_RESIDENCE">Tạm trú</option>
              <option value="TEMPORARY_ABSENCE">Tạm vắng</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="res-start">Ngày bắt đầu *</label>
            <input
              id="res-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="res-end">Ngày kết thúc (nếu có)</label>
            <input
              id="res-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="field" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">
              Kiểm tra hợp lệ
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Lịch sử biến động cư trú mẫu (US-15)</h3>
        <table>
          <thead>
            <tr>
              <th>Mã CD</th>
              <th>Họ và tên</th>
              <th>Hộ liên quan</th>
              <th>Loại biến động</th>
              <th>Ngày hiệu lực / Bắt đầu</th>
              <th>Ngày kết thúc</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_HISTORY.map((ev) => (
              <tr key={`${ev.eventType}-${ev.eventId}`}>
                <td>{ev.residentCode}</td>
                <td>{ev.fullName}</td>
                <td>{ev.householdCode}</td>
                <td>
                  <span className="badge badge-success">{ev.eventLabel}</span>
                </td>
                <td>{ev.effectiveDate}</td>
                <td>{ev.endDate || 'Chưa xác định'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
