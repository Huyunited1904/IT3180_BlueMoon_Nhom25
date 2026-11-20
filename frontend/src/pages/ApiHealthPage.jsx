import { useEffect, useState } from 'react';
import { fetchBackendHealth } from '../api/healthApi';
import { API_BASE_URL } from '../api/httpClient';

export default function ApiHealthPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function runHealthCheck() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchBackendHealth();
      setResult(response);
    } catch (err) {
      setResult(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runHealthCheck();
  }, []);

  return (
    <div>
      <div className="card">
        <h2>Thử gọi API kết nối Backend &amp; MySQL</h2>
        <p>
          Màn hình này gọi trực tiếp endpoint thật{' '}
          <code>GET {API_BASE_URL}/api/health</code> (do nhánh{' '}
          <code>chore/backend-auth-skeleton</code> cung cấp) để xác nhận kết nối{' '}
          <strong>React → Spring Boot → MySQL</strong> (không dùng dữ liệu giả).
        </p>

        <div className="btn-row">
          <button
            type="button"
            className="btn btn-primary"
            onClick={runHealthCheck}
            disabled={loading}
          >
            {loading ? 'Đang kiểm tra...' : 'Gọi lại GET /api/health'}
          </button>
        </div>
      </div>

      {result && (
        <div className="card">
          <div className="alert alert-success">
            Kết nối thành công tới Spring Boot và MySQL (HTTP {result.status},{' '}
            {result.durationMs} ms).
          </div>

          <div className="grid-cards">
            <div className="stat-card">
              <div className="stat-label">Trạng thái Backend</div>
              <div className="stat-value">
                <span className="badge badge-success">
                  {result.data?.status || 'UP'}
                </span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Trạng thái MySQL</div>
              <div className="stat-value">
                <span className="badge badge-success">
                  {result.data?.database || 'UP'}
                </span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Kết quả truy vấn SELECT 1</div>
              <div className="stat-value">{result.data?.dbPing ?? '-'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Số tài khoản mẫu (users)</div>
              <div className="stat-value">
                {result.data?.sampleUsersCount ?? '-'}
              </div>
            </div>
          </div>

          <h3>Phản hồi JSON nguyên bản</h3>
          <pre className="json-box">{JSON.stringify(result.data, null, 2)}</pre>
        </div>
      )}

      {error && (
        <div className="card">
          <div className="alert alert-danger">
            <strong>Không thể xác nhận kết nối:</strong> {error.message}
            {error.status ? ` (HTTP ${error.status} — ${error.code})` : ''}
          </div>
          {error.raw && typeof error.raw === 'object' && (
            <>
              <h3>Chi tiết phản hồi lỗi từ backend</h3>
              <pre className="json-box">
                {JSON.stringify(error.raw, null, 2)}
              </pre>
            </>
          )}
          <ul>
            <li>
              Kiểm tra backend đã chạy tại <code>{API_BASE_URL}</code> theo{' '}
              <code>backend/README.md</code>.
            </li>
            <li>
              Kiểm tra MySQL đã khởi động, đã tạo CSDL <code>bluemoon</code> và
              chạy script <code>database/auth_audit.sql</code>.
            </li>
            <li>
              Kiểm tra frontend đang chạy tại <code>http://localhost:5173</code>{' '}
              (khớp cấu hình CORS trong <code>SecurityConfig.java</code>).
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
