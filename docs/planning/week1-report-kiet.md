# Báo cáo đầu ra tuần 1 (09–15/11/2026) — Nguyễn Trần Tuấn Kiệt

- **Thành viên:** Nguyễn Trần Tuấn Kiệt (MSSV: 202416257)
- **Nhiệm vụ tuần 1:** Giao diện React và thiết kế biến động cư trú
- **Nhánh làm việc:** `feature/frontend-and-residency-design`

---

## 1. Danh mục đầu ra đã hoàn thành trên repo

| Hạng mục theo kế hoạch tuần 1 | Đầu ra trên repo | Trạng thái |
|---|---|---|
| Phác thảo màn hình đăng nhập, trang chính, hộ–cư dân, khoản thu, ghi nhận đóng tiền, thông báo thu tiền và biên nhận | [docs/design/ui-and-documents.md](../design/ui-and-documents.md) (có sơ đồ điều hướng Mermaid, wireframe, bảng trường/nút/lỗi tiếng Việt theo NFR-007) | Hoàn thành bản tuần 1 |
| Thiết kế biến động cư trú (chuyển đến/đi, tạm trú/tạm vắng, ngày hiệu lực, lịch sử) và đối chiếu giao diện–CSDL | [docs/design/residency-changes.md](../design/residency-changes.md) (có sơ đồ ERD cục bộ, mô tả bảng/ràng buộc, đề xuất API US-06/US-07 khớp `api-search.md`) | Hoàn thành bản đề xuất |
| Script SQL & dữ liệu mẫu phần biến động cư trú | [database/residency_changes.sql](../../database/residency_changes.sql) (MySQL 8.0, `utf8mb4`, view `v_residence_history` + seed mẫu) | Hoàn thành bản độc lập (chờ ghép FK) |
| Khởi tạo frontend React, bố cục chung, menu và điều hướng cơ bản | [frontend/](../../frontend/) (React 18 + Vite 5 + React Router 6, Layout/Sidebar/Topbar, 6 trang khung) | Hoàn thành mã nguồn |
| Màn hình thử gọi API phối hợp kiểm tra kết nối (ghi rõ dữ liệu giả) | [frontend/src/pages/ApiHealthPage.jsx](../../frontend/src/pages/ApiHealthPage.jsx) gọi thật `GET /api/health`; các màn hình còn lại đều gắn cảnh báo dữ liệu giả rõ ràng | Hoàn thành mã nguồn |
| Hướng dẫn cài đặt và chạy frontend | [frontend/README.md](../../frontend/README.md) | Hoàn thành |

---

## 2. Phần chưa hoàn thành / Đang chờ phối hợp trong nhóm

1. **Chưa kích hoạt khóa ngoại SQL & chưa chốt đối chiếu cuối với ERD chung (phụ thuộc Đỗ Duy Hưng):**
   - Trong `database/residency_changes.sql`, các `FOREIGN KEY` tới `households(id)`, `residents(id)`, `users(id)` đang được comment chú thích sẵn vì bảng `households` và `residents` chưa được đẩy lên repo. Cần Đỗ Duy Hưng ghép vào script CSDL tổng hợp và mở khóa ngoại.
2. **Chưa đối chiếu chi tiết trường thu phí & chứng từ với thiết kế dữ liệu thu phí (phụ thuộc Bùi Văn Thăng & Nguyễn Quang Huy):**
   - Mẫu Thông báo thu tiền (US-12) và Biên nhận (US-13) đã bám đúng 16 US/AC và ví dụ `70 m² × 10.000 đ/m² = 700.000 đ`, nhưng cần khớp lại tên cột/trường JSON chính xác khi Bùi Văn Thăng đẩy thiết kế dữ liệu thu phí và Nguyễn Quang Huy bổ sung API thu phí.
3. **Đã chạy thử thành công bộ khung Frontend React; còn bước test kết nối thật với Backend & MySQL:**
   - Đã cài Node.js và chạy thành công `npm install` và `npm run dev` (Vite v5.4.21 tại `http://localhost:5173`), kiểm tra điều hướng giữa tất cả các màn hình khung và mẫu chứng từ.
   - Bước chạy song song backend Spring Boot (nhánh `chore/backend-auth-skeleton`) và MySQL 8.0 để chụp kết quả gọi thật `GET /api/health` sẽ thực hiện ở phiên làm việc tiếp theo.

---

## 3. Đề xuất cho buổi review cuối tuần 1

1. Merge 4 nhánh nền (`docs/architecture`, `docs/api`, `chore/backend-auth-skeleton`, `feature/frontend-and-residency-design`) vào `main` sau khi review chéo.
2. Chốt phiên bản Node.js (đề xuất **Node.js 20 LTS**) trong `README.md` gốc.
3. Đỗ Duy Hưng và Bùi Văn Thăng bổ sung phần thiết kế CSDL & script SQL để cả nhóm chạy thử toàn bộ CSDL trống trên MySQL và bắt đầu lập trình chức năng ở tuần 16–22/11.
