# BlueMoon Frontend (React + Vite)

- **Phụ trách thiết lập:** Nguyễn Trần Tuấn Kiệt (MSSV: 202416257)
- **Công nghệ:** React 18, JavaScript, HTML, CSS, React Router 6, Vite 5.

## 1. Yêu cầu môi trường

- **Node.js:** Khuyến nghị **Node.js 20 LTS** (hoặc Node.js `>= 18.18`).
- **npm:** Đi kèm theo Node.js (`>= 9`).
- **Trình duyệt:** Chrome, Edge hoặc Firefox phiên bản mới.

Kiểm tra phiên bản trên máy:
```bash
node -v
npm -v
```

## 2. Cấu hình môi trường

1. Di chuyển vào thư mục `frontend/`:
   ```bash
   cd frontend
   ```
2. Sao chép file cấu hình mẫu:
   - Windows (PowerShell / CMD):
     ```bash
     copy .env.example .env
     ```
   - macOS / Linux:
     ```bash
     cp .env.example .env
     ```
3. Kiểm tra nội dung `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```
   > File `.env` đã được đưa vào `.gitignore`, không đẩy cấu hình cá nhân lên Git.

## 3. Cài đặt thư viện và chạy ứng dụng

```bash
npm install
npm run dev
```

Mở trình duyệt tại: **http://localhost:5173**

> **Lưu ý về cổng `5173`:** Cổng này khớp sẵn với danh sách CORS `http://localhost:5173` đã cấu hình tại `backend/.../SecurityConfig.java`.

Các lệnh khác:
- Build kiểm tra bản production: `npm run build`
- Xem trước bản build: `npm run preview`

## 4. Kiểm tra kết nối React — Spring Boot — MySQL

1. Khởi chạy MySQL và chạy script khởi tạo `database/auth_audit.sql` theo hướng dẫn tại `backend/README.md`.
2. Khởi chạy backend Spring Boot (`mvnw.cmd spring-boot:run` trên Windows hoặc `./mvnw spring-boot:run` trên macOS/Linux) ở cổng `8080`.
3. Chạy frontend (`npm run dev`) và truy cập **http://localhost:5173/api-test**.
4. Màn hình **Thử gọi API (Health)** sẽ gửi `GET http://localhost:8080/api/health` và hiển thị:
   - Trạng thái Backend: `UP`
   - Trạng thái MySQL: `UP`
   - Kết quả `dbPing`: `1`
   - Số tài khoản mẫu `sampleUsersCount`: `3` (nếu đã nạp `auth_audit.sql`)

## 5. Minh bạch dữ liệu giả lập (Mock Data) trong Tuần 1

| Màn hình | Đường dẫn | Nguồn dữ liệu hiện tại |
|---|---|---|
| Thử gọi API (Health) | `/api-test` | **API thật** (`GET /api/health` → Spring Boot → MySQL) |
| Đăng nhập | `/login` | **Giả lập tuần 1** (kiểm tra validation phía client; chưa nối `POST /api/auth/login`) |
| Trang chính | `/dashboard` | **Giả lập tuần 1** (số liệu tổng quan mẫu) |
| Hộ gia đình | `/households` | **Giả lập tuần 1** (2 hộ mẫu `HO-001`, `HO-002`) |
| Cư dân & Biến động | `/residents` | **Giả lập tuần 1** (khớp DTO `api-search.md`, có kiểm tra ngày hiệu lực US-07) |
| Khoản thu & Chứng từ | `/fees` | **Giả lập tuần 1** (ví dụ `70 m² × 10.000 đ = 700.000 đ`, hỗ trợ xem trước & in `Ctrl+P`) |
