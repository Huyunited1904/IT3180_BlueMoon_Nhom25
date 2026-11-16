# BlueMoon Backend (Spring Boot)

## 1. Yêu cầu môi trường
- **Java:** JDK 17 (LTS)
- **Database:** MySQL 8.0 (cài trực tiếp hoặc chạy qua Docker)
- **Công cụ build:** Sử dụng Maven Wrapper (`./mvnw` / `mvnw.cmd`) đi kèm trong thư mục `backend/`

## 2. Chuẩn bị cơ sở dữ liệu
1. Tạo database tên `bluemoon` (charset `utf8mb4`, collation `utf8mb4_unicode_ci`).
2. Chạy script khởi tạo bảng và dữ liệu mẫu phần tài khoản – phân quyền – nhật ký tại `../database/auth_audit.sql`.

## 3. Cấu hình kết nối trên máy cá nhân
1. Sao chép file mẫu cấu hình:
   - Đường dẫn file mẫu: `src/main/resources/application-local.properties.example`
   - Tạo bản sao cùng thư mục tên: `src/main/resources/application-local.properties`
2. Mở `application-local.properties` và cập nhật `spring.datasource.url`, `username`, `password` theo MySQL trên máy bạn.
   > **Lưu ý:** File `application-local.properties` đã được loại khỏi Git trong `.gitignore`. Không đưa mật khẩu cá nhân vào `application.properties` hoặc file `.example`.

## 4. Chạy backend
Mở terminal tại thư mục `backend/` và chạy:

- **macOS / Linux:**
  ```bash
  ./mvnw spring-boot:run
  ```

- **Windows:**
  ```cmd
  mvnw.cmd spring-boot:run
  ```
