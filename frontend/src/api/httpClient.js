/**
 * Module gọi HTTP API dùng chung cho frontend BlueMoon.
 * - Tuân thủ docs/design/architecture.md (tập trung cấu hình kết nối và xử lý lỗi).
 * - Gửi kèm credentials ('include') để hỗ trợ session cookie HttpOnly (docs/design/api.md).
 * - Chuẩn hóa lỗi theo cấu trúc { status, code, message, fieldErrors } (NFR-007).
 */

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
).replace(/\/+$/, '');

export class ApiError extends Error {
  constructor({ status, code, message, fieldErrors = {}, raw = null }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.raw = raw;
  }
}

export async function apiRequest(path, options = {}) {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };

  let response;
  const startedAt = performance.now();
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch (networkError) {
    throw new ApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      message:
        'Không thể kết nối tới máy chủ backend. Vui lòng kiểm tra backend Spring Boot đã khởi chạy và cấu hình CORS/URL hợp lệ.',
      raw: networkError,
    });
  }

  const durationMs = Math.round(performance.now() - startedAt);
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    throw new ApiError({
      status: response.status,
      code: data?.code || `HTTP_${response.status}`,
      message:
        data?.message ||
        (response.status === 401
          ? 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.'
          : response.status === 403
            ? 'Bạn không có quyền thực hiện thao tác này.'
            : 'Yêu cầu xử lý không thành công. Vui lòng thử lại.'),
      fieldErrors: data?.fieldErrors || {},
      raw: data,
    });
  }

  return { data, status: response.status, durationMs, url };
}
