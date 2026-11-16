
**Phụ trách:** Nguyễn Hoàng Nhật Huy  
**Căn cứ:** `US-01`, `US-02`, `US-03`, `NFR-001`, `NFR-002`, `NFR-005`, `NFR-007` và `docs/design/api.md`.

---

## 1. Thiết kế dữ liệu (`database/auth_audit.sql`)

| Bảng | Mục đích | Ràng buộc chính |
|---|---|---|
| `roles` | Danh mục vai trò nội bộ | `id` (`PK`), `code` (`UNIQUE`), `name` |
| `permissions` | Danh mục quyền thao tác chi tiết | `id` (`PK`), `code` (`UNIQUE`), `description` |
| `role_permissions` | Bảng nối nhiều–nhiều giữa vai trò và quyền | `PK (role_id, permission_id)`, FK tới `roles`, `permissions` |
| `users` | Tài khoản đăng nhập nội bộ của Ban quản trị | `id` (`PK`), `username` (`UNIQUE`), `password_hash`, `full_name`, `phone`, `role_id` (FK), `status` (`ACTIVE`/`LOCKED`) |
| `audit_logs` | Nhật ký thao tác quan trọng dùng chung toàn hệ thống | `id` (`PK`), `actor_user_id` (FK), `actor_username`, `action`, `entity_type`, `entity_id`, `summary`, `reason`, `details_json`, `created_at` |

### Đề xuất ma trận vai trò và quyền (chốt cùng nhóm)

| Vai trò (`roles.code`) | Quyền được gán (`permissions.code`) |
|---|---|
| `ADMIN` | Toàn bộ quyền (`USER_MANAGE`, `HOUSEHOLD_READ`, `HOUSEHOLD_WRITE`, `RESIDENT_CHANGE_WRITE`, `FEE_CONFIG`, `PAYMENT_RECORD`, `PAYMENT_CANCEL`, `REPORT_VIEW`, `AUDIT_LOG_VIEW`) |
| `RESIDENT_MANAGER` | `HOUSEHOLD_READ`, `HOUSEHOLD_WRITE`, `RESIDENT_CHANGE_WRITE` |
| `FEE_COLLECTOR` | `HOUSEHOLD_READ`, `FEE_CONFIG`, `PAYMENT_RECORD`, `PAYMENT_CANCEL`, `REPORT_VIEW` |

---

## 2. Luồng nghiệp vụ và bảo mật

### 2.1. Cấp tài khoản nội bộ (`US-01`, `RAW-008`)

- **Không có đăng ký công khai.** Chỉ tài khoản có quyền `USER_MANAGE` (mặc định `ADMIN`) mới được tạo tài khoản qua `POST /api/users`.
- Quy tắc `username`: đề xuất độ dài 3–50 ký tự, chỉ gồm chữ/số/dấu gạch dưới hoặc chấm; cắt khoảng trắng đầu/cuối và kiểm tra trùng không phân biệt hoa/thường (có ràng buộc `UNIQUE` tại MySQL).
- Mật khẩu: tối thiểu **8 ký tự**, **không tự cắt khoảng trắng**, băm bằng **`BCryptPasswordEncoder`** (`NFR-001`) trước khi lưu vào `users.password_hash`.
- Việc lưu tài khoản và ghi `audit_logs` thực hiện trong cùng transaction (`@Transactional`).

### 2.2. Đăng nhập và quản lý phiên (`US-02`)

- Sử dụng **session phía backend + cookie phiên (`HttpOnly`)**; không dùng JWT hay lưu thông tin xác thực trong `localStorage`.
- `POST /api/auth/login` kiểm tra `username`, kiểm tra `status = ACTIVE` và đối chiếu mật khẩu qua `BCryptPasswordEncoder.matches()`.
- Nếu sai tên đăng nhập hoặc mật khẩu, trả chung `401 UNAUTHORIZED` (`INVALID_CREDENTIALS`) để tránh lộ thông tin tài khoản tồn tại.
- Khi đăng nhập thành công, backend thay mới session ID để chống session fixation.
- Khi dev tách origin giữa React (`localhost:5173` / `3000`) và Spring Boot (`localhost:8080`), bật CORS `allowCredentials = true`. Khi triển khai API ghi dữ liệu (`POST`/`PUT`), áp dụng kiểm tra CSRF và trả `403 FORBIDDEN` (`CSRF_INVALID`) nếu token thiếu/sai.

### 2.3. Kiểm tra quyền dùng chung (`NFR-002`, `WBS 3.4`)

- Mọi thao tác bảo vệ đều phải kiểm tra phiên và quyền ở **backend** (không chỉ ẩn nút trên giao diện).
- Chưa đăng nhập / phiên hết hạn → trả `401` JSON `{"code":"UNAUTHENTICATED",...}` (không redirect sang trang HTML).
- Đã đăng nhập nhưng thiếu quyền → trả `403` JSON `{"code":"FORBIDDEN",...}`.

### 2.4. Xem thông tin cá nhân và đổi mật khẩu (`US-03`)

- `GET /api/users/me` lấy định danh từ session hiện tại, trả DTO `{ id, username, fullName, phone, role }` (không bao giờ trả Entity trực tiếp hoặc `password_hash`).
- `PUT /api/users/me/password` kiểm tra mật khẩu hiện tại, mật khẩu mới ≥ 8 ký tự và khớp `confirmPassword` → băm BCrypt → cập nhật DB và ghi nhật ký trong cùng transaction → thu hồi các phiên đăng nhập khác, giữ phiên hiện tại.

---

## 3. Thiết kế Nhật ký thao tác dùng chung (`NFR-005`, `WBS 8.3`)

- Các module (`USER`, `HOUSEHOLD`, `RESIDENT`, `FEE_ITEM`, `TRANSACTION`...) gọi chung một service ghi vào bảng `audit_logs` trong cùng transaction nghiệp vụ; nếu ghi log thất bại thì rollback thao tác.
- Các trường bắt buộc: người thực hiện (`actor_user_id`, `actor_username` lấy từ session), hành động (`action`), đối tượng (`entity_type`, `entity_id`), mô tả tiếng Việt (`summary`) và thời điểm (`created_at`).
- Khi hủy giao dịch (`US-14`), bắt buộc lưu thêm `reason`.
- **Nguyên tắc bảo mật:** không ghi mật khẩu hoặc `password_hash` vào `summary` hay `details_json`; không cung cấp API sửa hoặc xóa `audit_logs` cho người dùng thông thường.
- Lưu ý: `audit_logs` theo dõi thao tác trên dữ liệu hệ thống, tách biệt hoàn toàn với lịch sử cư trú (chuyển đến/đi, tạm trú/vắng).

---

## 4. Trạng thái hoàn thành Tuần 1 (09–15/11/2026)

- **Đã hoàn thành:**
  - Khởi tạo dự án Spring Boot `4.1.2` (Java 17, Maven Wrapper) và cấu trúc package `config`, `controller`, `service`, `repository`, `entity`, `dto`, `exception`.
  - Tách cấu hình kết nối MySQL cá nhân (`application-local.properties` nằm trong `.gitignore`, cung cấp `.example` và `backend/README.md`).
  - Thiết kế 5 bảng `roles`, `permissions`, `role_permissions`, `users`, `audit_logs` và dữ liệu mẫu trong `database/auth_audit.sql`, đã nạp chạy thử trên MySQL 8.0.
  - Cấu hình `SecurityConfig` (`BCryptPasswordEncoder`, CORS, trả JSON `401`/`403`) và API `GET /api health` kiểm tra truy vấn thật trên bảng `users`.
- **Chưa triển khai trong Tuần 1 (chuyển sang tuần tiếp theo):**
  - Triển khai các endpoint `POST /api/users`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/users/me`, `PUT /api/users/me/password`, cơ chế thu hồi các phiên khác và tích hợp CSRF token hoàn chỉnh.
```