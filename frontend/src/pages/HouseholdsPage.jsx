import { useState } from 'react';

// Dữ liệu giả lập tuần 1 — sẽ thay bằng GET /api/households (api-households.md & api-search.md).
const MOCK_HOUSEHOLDS = [
  {
    id: 101,
    householdCode: 'HO-001',
    apartmentCode: 'A1201',
    headOfHouseholdName: 'Nguyễn Văn An',
    contactPhone: '0901234567',
    area: 70.0,
  },
  {
    id: 102,
    householdCode: 'HO-002',
    apartmentCode: 'A1202',
    headOfHouseholdName: 'Lê Thị Hoa',
    contactPhone: '0912345678',
    area: 85.5,
  },
];

export default function HouseholdsPage() {
  const [keyword, setKeyword] = useState('');

  const filtered = MOCK_HOUSEHOLDS.filter((item) => {
    const q = keyword.trim().toLowerCase();
    if (!q) return true;
    return (
      item.householdCode.toLowerCase().includes(q) ||
      item.apartmentCode.toLowerCase().includes(q) ||
      item.headOfHouseholdName.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="alert alert-warn">
        <strong>Dữ liệu giả lập (Mock Data — Tuần 1):</strong> Màn hình minh họa
        bố cục danh sách Hộ gia đình (US-04, US-15). API thật sẽ tích hợp sau khi
        backend hoàn thiện module Hộ gia đình.
      </div>

      <div className="card">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="hh-search">Tìm theo mã hộ, căn hộ hoặc tên chủ hộ</label>
            <input
              id="hh-search"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Ví dụ: HO-001, A1201, Nguyễn Văn An"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="alert alert-warn">
            Không tìm thấy hộ gia đình nào phù hợp với từ khóa &ldquo;{keyword}&rdquo;.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Mã hộ</th>
                <th>Căn hộ</th>
                <th>Chủ hộ</th>
                <th>SĐT liên hệ</th>
                <th>Diện tích (m²)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.householdCode}</td>
                  <td>{item.apartmentCode}</td>
                  <td>{item.headOfHouseholdName}</td>
                  <td>{item.contactPhone}</td>
                  <td>{item.area.toFixed(1)} m²</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
