import { apiRequest } from './httpClient';

/**
 * Gọi API kiểm tra trạng thái backend Spring Boot và kết nối MySQL.
 * Endpoint được cung cấp bởi nhánh chore/backend-auth-skeleton (HealthController).
 */
export function fetchBackendHealth() {
  return apiRequest('/api/health', { method: 'GET' });
}
