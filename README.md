# BlueMoon — Quản lý cư dân và thu phí chung cư

**Bài tập lớn môn Nhập môn Công nghệ phần mềm — IT3180**  
**Nhóm thực hiện: Nhóm 25**

BlueMoon là ứng dụng web nội bộ hỗ trợ Ban quản trị chung cư quản lý thông tin hộ gia đình, cư dân và hoạt động thu phí. Hệ thống tập trung dữ liệu, hỗ trợ tra cứu lịch sử và theo dõi số tiền phải thu, đã thu, còn thiếu của từng hộ.

## 1. Mục tiêu dự án

- Quản lý thống nhất hồ sơ hộ gia đình, cư dân và biến động cư trú.
- Hỗ trợ thiết lập khoản thu, kỳ thu và tính phí theo diện tích căn hộ.
- Ghi nhận từng lần đóng tiền, phân biệt phí bắt buộc với đóng góp tự nguyện.
- Cung cấp thông báo thu tiền, biên nhận và thống kê phục vụ đối chiếu.
- Kiểm soát quyền truy cập, bảo vệ dữ liệu và lưu nhật ký thay đổi quan trọng.

## 2. Thành viên

| Họ và tên | MSSV | Trách nhiệm chính |
|---|---|---|
| Nguyễn Quang Huy | 202416517 | Phụ trách chính; kiến trúc, thiết kế API, tính phí, thu phí bắt buộc, hủy giao dịch và tích hợp MVP |
| Bùi Văn Thăng | 202416606 | Phụ chính; thiết kế dữ liệu thu phí, quản lý khoản thu, thống kê và hỗ trợ tích hợp |
| Nguyễn Hoàng Nhật Huy | 202416521 | Thiết lập backend, tài khoản, xác thực, phân quyền và nhật ký |
| Đỗ Duy Hưng | 202416511 | Quản lý hộ–cư dân, tổng hợp thiết kế CSDL, script SQL, sao lưu và phục hồi |
| Nguyễn Trần Tuấn Kiệt | 202416257 | Thiết lập frontend, giao diện, biến động cư trú, đóng góp tự nguyện và chứng từ |

Cả nhóm tham gia review, kiểm thử chéo, cập nhật tài liệu và sửa lỗi theo phần việc phụ trách. Phân công chi tiết được quản lý trong WBS và kế hoạch tuần.

## 3. Phạm vi v1.0

Bộ yêu cầu gồm **11 yêu cầu chức năng thô, 7 yêu cầu phi chức năng và 16 User Story**, được tổ chức thành **5 Epic và 16 Feature**.

| Nhóm chức năng | Nội dung |
|---|---|
| Tài khoản và phân quyền | Cấp tài khoản nội bộ, gán quyền, đăng nhập, đăng xuất, xem thông tin cá nhân và đổi mật khẩu |
| Hộ gia đình và cư dân | Thêm, cập nhật hồ sơ hộ, thông tin căn hộ, chủ hộ, diện tích và thành viên |
| Biến động cư trú | Ghi nhận chuyển đến, chuyển đi, tạm trú, tạm vắng và lưu lịch sử |
| Khoản thu và tính phí | Thiết lập khoản thu, kỳ hoặc đợt thu, hạn đóng, đơn giá và danh sách phải thu |
| Thu tiền và giao dịch | Ghi nhận phí bắt buộc, đóng góp tự nguyện và hủy giao dịch ghi nhầm |
| Chứng từ | Xem và in thông báo thu tiền, biên nhận |
| Tra cứu và thống kê | Tìm hồ sơ, xem lịch sử và tổng hợp số phải thu, đã thu, còn thiếu |

### Quy tắc nghiệp vụ chính

- Tài khoản do người quản trị cấp; không có đăng ký công khai.
- Phí dịch vụ và phí quản lý được tính theo diện tích căn hộ và đơn giá của kỳ thu.
- Không lập trùng khoản phải thu cho cùng hộ, khoản thu và kỳ thu.
- Phí bắt buộc cho phép đóng nhiều lần; số tiền mỗi lần phải dương và không vượt số còn thiếu.
- Đóng góp tự nguyện được thống kê riêng, không phát sinh nợ cho hộ không tham gia.
- Hủy giao dịch phải có lý do, giữ lịch sử và cập nhật lại số liệu liên quan.
- In lại biên nhận không tạo thêm giao dịch.
- Thay đổi diện tích hoặc đơn giá không tự làm thay đổi khoản phải thu đã xác lập của kỳ cũ.

### Ngoài phạm vi v1.0

- Cổng sử dụng riêng dành cho cư dân.
- Thanh toán trực tuyến và đối soát ngân hàng tự động.
- Quản lý phương tiện, phí gửi xe và thu hộ điện, nước, internet.

## 4. Công nghệ và kiến trúc

| Thành phần | Công nghệ |
|---|---|
| Frontend | React, JavaScript, HTML, CSS |
| Backend | Java, Spring Boot |
| Truy cập dữ liệu | Spring Data JPA, Hibernate |
| Cơ sở dữ liệu | MySQL |
| Quản lý mã nguồn | Git, GitHub |
| Kiểm tra API | Postman |

Phiên bản công nghệ và công cụ build sẽ được bổ sung sau khi nhóm thống nhất.

React trao đổi dữ liệu với Spring Boot qua HTTP API. Backend kiểm tra quyền, xử lý nghiệp vụ và truy cập MySQL; frontend không kết nối trực tiếp với cơ sở dữ liệu.

Backend được tổ chức theo các lớp:

| Thành phần | Trách nhiệm |
|---|---|
| Controller | Tiếp nhận request, kiểm tra dữ liệu đầu vào và trả response |
| Service | Xử lý nghiệp vụ và điều phối transaction |
| Repository | Truy vấn và lưu dữ liệu |
| Entity | Ánh xạ dữ liệu với các bảng trong CSDL |
| DTO | Biểu diễn dữ liệu đầu vào và đầu ra của API |

Thiết kế xác thực sử dụng **session phía backend** và cookie phiên. Quyền truy cập được kiểm tra tại backend đối với từng thao tác được bảo vệ.

## 5. Tổ chức repository

Các thư mục được bổ sung theo tiến độ triển khai.

| Đường dẫn | Nội dung |
|---|---|
| `frontend/` | Mã nguồn React và kiểm thử frontend |
| `backend/` | Mã nguồn Spring Boot và kiểm thử backend |
| `database/` | Script tạo bảng, thay đổi cấu trúc và dữ liệu mẫu |
| `docs/requirements/` | Tài liệu yêu cầu, tiêu chí chấp nhận và bảng truy vết |
| `docs/planning/` | Kế hoạch, phân công, tiến độ và quản lý rủi ro |
| `docs/design/` | Kiến trúc, ERD, thiết kế API và giao diện |
| `README.md` | Giới thiệu dự án và hướng dẫn làm việc chung |

## 6. Kế hoạch và trạng thái

Nhóm đã xây dựng bộ tài liệu yêu cầu và kế hoạch dự án. Giai đoạn triển khai bắt đầu từ **09/11/2026**.

Tuần **09–15/11/2026** tập trung vào:

- Rà soát yêu cầu và thống nhất các quyết định thiết kế.
- Hoàn thiện kiến trúc, thiết kế CSDL, API và giao diện.
- Khởi tạo frontend, backend và cấu hình kết nối MySQL.
- Chuẩn bị script tạo bảng, dữ liệu mẫu và hướng dẫn chạy.
- Kiểm tra kết nối React–Spring Boot–MySQL trên máy các thành viên.

Các mốc Sprint, MVP và bàn giao sẽ được rà soát theo thời điểm bắt đầu thực tế, nguồn lực và hạn nộp học phần.

Các chức năng trong README mô tả phạm vi phát triển. Tiến độ hoàn thành được cập nhật theo kết quả triển khai, review và kiểm thử thực tế.

## 7. Thiết lập môi trường

Hướng dẫn cài đặt và lệnh chạy từng thành phần sẽ được bổ sung khi bộ khung dự án sẵn sàng.

Nguyên tắc sử dụng môi trường:

- Sử dụng phiên bản công nghệ đã thống nhất.
- Mỗi thành viên sử dụng CSDL riêng, được tạo từ cùng script và dữ liệu mẫu.
- Thay đổi cấu trúc bảng phải được review và cập nhật vào script chung.
- Thông tin kết nối, mật khẩu và cấu hình cá nhân được thiết lập riêng theo môi trường.
- Repository chỉ lưu cấu hình mẫu không chứa bí mật.
- Thư viện tải về, sản phẩm build và cấu hình cá nhân được loại khỏi Git bằng `.gitignore`.

## 8. Quy trình đóng góp

1. Đọc yêu cầu và tiêu chí chấp nhận liên quan đến nhiệm vụ.
2. Cập nhật mã nguồn từ `main`, tạo nhánh riêng theo công việc.
3. Thực hiện thay đổi, kiểm tra và commit với thông điệp rõ ràng.
4. Tạo Pull Request vào `main`, mô tả nội dung và cách kiểm tra.
5. Một thành viên khác review trước khi merge.
6. Cập nhật tài liệu nếu thay đổi ảnh hưởng đến API, CSDL hoặc hướng dẫn chạy.

| Tiền tố nhánh | Mục đích |
|---|---|
| `feature/` | Phát triển chức năng |
| `fix/` | Sửa lỗi |
| `docs/` | Bổ sung hoặc cập nhật tài liệu |
| `chore/` | Cấu hình và bảo trì dự án |

## 9. Kiểm thử và chất lượng

Chức năng được kiểm tra dựa trên **Acceptance Criteria** của từng User Story và yêu cầu phi chức năng.

Các nội dung kiểm thử chính:

- Dữ liệu hợp lệ, thiếu, trùng và không hợp lệ.
- Truy cập khi chưa đăng nhập hoặc vượt quyền.
- Tính phí, đóng nhiều lần, đóng góp tự nguyện và hủy giao dịch.
- Tính nhất quán dữ liệu và rollback khi xử lý lỗi.
- Bảo vệ mật khẩu, nhật ký thay đổi, sao lưu và phục hồi.
- Hiệu năng tra cứu, thống kê và thông báo tiếng Việt.

Kết quả kiểm thử ghi rõ môi trường, dữ liệu, kết quả mong đợi, kết quả thực tế và lỗi còn tồn tại.

## 10. Tài liệu dự án

| Nhóm tài liệu | Thành phần |
|---|---|
| Yêu cầu | Client Wishlist, As-Is, Visionary Scenario, NFR, Raw Log, Epic/Feature, User Story, Acceptance Criteria, Product Backlog, Traceability Matrix |
| Kế hoạch | Project Charter, WBS, Agile Project Plan, Gantt Chart, Timeline, Risk Matrix, Risk Tracker, Dashboard, kế hoạch tuần |
| Thiết kế | Kiến trúc hệ thống, thiết kế CSDL, API, giao diện và quy tắc xử lý nghiệp vụ |

Tài liệu đang review được theo dõi qua Pull Request. Tài liệu được duyệt sẽ được cập nhật vào các thư mục tương ứng trên nhánh `main`.
