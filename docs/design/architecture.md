# Kiến trúc hệ thống BlueMoon

## 1. Mục đích tài liệu

Tài liệu mô tả kiến trúc ban đầu của hệ thống BlueMoon và các nguyên tắc tổ chức mã nguồn mà Nhóm 25 thống nhất sử dụng.

Tài liệu là căn cứ để các thành viên thiết kế và triển khai từng chức năng, phối hợp giữa frontend và backend, đồng thời tích hợp mã nguồn vào một hệ thống chung.

Phạm vi nghiệp vụ của hệ thống tuân theo bộ yêu cầu đã thống nhất gồm 11 yêu cầu chức năng thô, 7 yêu cầu phi chức năng và 16 User Story. Những thay đổi về kiến trúc hoặc phạm vi cần được trao đổi trong nhóm và cập nhật vào tài liệu liên quan.

## 2. Kiến trúc tổng thể

BlueMoon được xây dựng dưới dạng ứng dụng web, gồm ba thành phần chính:

| Thành phần | Công nghệ | Trách nhiệm |
|---|---|---|
| Frontend | React, JavaScript, HTML và CSS | Hiển thị giao diện, tiếp nhận thao tác của người dùng và trao đổi dữ liệu với backend |
| Backend | Java và Spring Boot | Cung cấp API, xác thực và phân quyền, kiểm tra dữ liệu, xử lý nghiệp vụ và truy cập cơ sở dữ liệu |
| Cơ sở dữ liệu | MySQL | Lưu trữ dữ liệu và thực thi các ràng buộc bảo đảm tính nhất quán |

Frontend và backend được tổ chức trong cùng repository nhưng là hai ứng dụng riêng. Backend được triển khai dưới dạng một ứng dụng Spring Boot thống nhất, bên trong chia thành các module nghiệp vụ.

Luồng trao đổi dữ liệu tổng quát:

Người dùng → React → API Spring Boot → MySQL

Kết quả được trả về theo chiều ngược lại:

MySQL → Spring Boot → React → Người dùng

React gửi yêu cầu HTTP đến backend; dữ liệu nghiệp vụ được trao đổi chủ yếu dưới dạng JSON. Frontend không kết nối trực tiếp với MySQL và không chứa thông tin đăng nhập cơ sở dữ liệu.

Phiên bản Java, Spring Boot, Node.js, MySQL và công cụ build sẽ được nhóm thống nhất, ghi trong tài liệu hướng dẫn cài đặt.

## 3. Tổ chức frontend

Frontend chịu trách nhiệm trình bày thông tin và hỗ trợ người dùng thực hiện các chức năng của hệ thống.

Các trách nhiệm chính:

- Xây dựng các trang, biểu mẫu và thành phần giao diện có thể tái sử dụng.
- Điều hướng giữa các màn hình.
- Quản lý trạng thái giao diện và dữ liệu phục vụ hiển thị.
- Gửi yêu cầu đến backend và hiển thị kết quả.
- Thể hiện trạng thái đang tải, kết quả rỗng, thao tác thành công và lỗi.
- Kiểm tra dữ liệu đầu vào cơ bản để hỗ trợ người dùng trước khi gửi yêu cầu.
- Hiển thị chức năng phù hợp với quyền của tài khoản.

Phần gọi API được tập trung trong các module dùng chung, hạn chế viết lặp cấu hình kết nối và xử lý lỗi ở từng màn hình.

Các phép tính hiển thị hoặc kiểm tra dữ liệu tại frontend không thay thế xử lý tại backend. Kết quả nghiệp vụ chính thức, bao gồm số phải thu, số đã đóng và số còn thiếu, do backend xác định.

Việc ẩn nút hoặc chặn điều hướng trên frontend chỉ phục vụ giao diện. Backend vẫn phải kiểm tra quyền đối với từng thao tác được bảo vệ.

## 4. Tổ chức backend

Backend sử dụng kiến trúc phân lớp. Mỗi lớp đảm nhận một nhóm trách nhiệm rõ ràng nhằm giảm phụ thuộc giữa các phần, hỗ trợ kiểm thử và thuận tiện khi thay đổi nghiệp vụ.

Luồng xử lý chính:

Controller → Service → Repository → MySQL

Entity và DTO được sử dụng để biểu diễn dữ liệu trong các phạm vi khác nhau, không phải các bước xử lý nối tiếp trong luồng trên.

### 4.1. Controller

Controller là nơi tiếp nhận các yêu cầu HTTP từ frontend.

Trách nhiệm:

- Khai báo các API và phương thức HTTP tương ứng.
- Tiếp nhận tham số đường dẫn, tham số truy vấn và dữ liệu trong request.
- Kích hoạt kiểm tra định dạng, kiểu dữ liệu và các trường bắt buộc thông qua DTO cùng cơ chế validation.
- Gọi Service để thực hiện nghiệp vụ.
- Trả response với mã trạng thái HTTP và dữ liệu phù hợp.

Controller không trực tiếp viết truy vấn cơ sở dữ liệu và không chứa các quy tắc nghiệp vụ phức tạp.

### 4.2. Service

Service chịu trách nhiệm xử lý nghiệp vụ và điều phối các thao tác cần thiết để hoàn thành yêu cầu.

Trách nhiệm:

- Kiểm tra điều kiện nghiệp vụ và trạng thái dữ liệu.
- Gọi một hoặc nhiều Repository để lấy và lưu dữ liệu.
- Thực hiện các phép tính và quy tắc nghiệp vụ.
- Xác định phạm vi transaction cho những thao tác cần thực hiện đồng bộ.
- Phát sinh lỗi nghiệp vụ rõ ràng khi yêu cầu không thể thực hiện.

Ví dụ nghiệp vụ thuộc Service:

- Tính khoản phải đóng từ diện tích và đơn giá áp dụng.
- Ngăn lập trùng khoản phải đóng cho cùng hộ, khoản thu và kỳ thu.
- Kiểm tra số tiền đóng phải dương và không vượt số còn thiếu.
- Hủy giao dịch theo đúng điều kiện, giữ lịch sử và tính lại số liệu liên quan.
- Tổng hợp thống kê, loại giao dịch đã hủy khỏi số tiền đã thu.

Các quyết định phụ thuộc dữ liệu hoặc trạng thái nghiệp vụ được xử lý tại backend, kể cả khi frontend đã kiểm tra trước đó.

### 4.3. Repository

Repository chịu trách nhiệm truy cập dữ liệu trong MySQL thông qua Spring Data JPA.

Trách nhiệm:

- Tìm kiếm, thêm mới và cập nhật dữ liệu.
- Khai báo các truy vấn cần thiết cho nghiệp vụ.
- Thực hiện truy vấn lọc, tổng hợp hoặc thống kê khi phù hợp.
- Cung cấp dữ liệu cho Service.

Repository không quyết định người dùng có được thực hiện một nghiệp vụ hay không. Các điều kiện nghiệp vụ và quyền thực hiện được kiểm tra ở tầng xử lý phù hợp trước khi ghi dữ liệu.

### 4.4. Entity

Entity biểu diễn dữ liệu được ánh xạ với các bảng trong cơ sở dữ liệu bằng JPA.

Entity thể hiện:

- Các thuộc tính dữ liệu.
- Khóa chính.
- Quan hệ giữa các đối tượng.
- Thông tin ánh xạ với bảng và cột.

Thiết kế Entity phải thống nhất với thiết kế CSDL đã được nhóm review. Không sử dụng Entity làm cấu trúc response mặc định cho mọi API.

### 4.5. DTO

DTO biểu diễn dữ liệu được tiếp nhận hoặc trả về qua API.

DTO được sử dụng để:

- Xác định rõ các trường frontend được phép gửi.
- Khai báo các điều kiện validation cho dữ liệu đầu vào.
- Chọn các trường cần trả về cho từng màn hình.
- Hạn chế việc API phụ thuộc trực tiếp vào cấu trúc Entity.
- Ngăn trả về các trường nội bộ hoặc nhạy cảm không cần thiết.

DTO đầu vào và DTO đầu ra có thể khác nhau. Mật khẩu đã băm không được đưa vào response.

### 4.6. Các thành phần dùng chung

Backend có các thành phần hỗ trợ dùng chung:

- Cấu hình ứng dụng và kết nối cơ sở dữ liệu.
- Xác thực và phân quyền.
- Xử lý ngoại lệ tập trung.
- Validation.
- Nhật ký thao tác.
- Ánh xạ giữa Entity và DTO khi cần thiết.

Lỗi được chuyển thành response thống nhất, không trả trực tiếp stack trace, thông tin kết nối hoặc chi tiết nội bộ cho frontend.

Cơ chế xác thực cụ thể sẽ được mô tả trong tài liệu thiết kế tài khoản và bảo mật.

## 5. Phân chia module nghiệp vụ

Backend chia thành các nhóm nghiệp vụ theo phạm vi đã thống nhất:

| Module | Nội dung chính |
|---|---|
| Tài khoản và phân quyền | Cấp tài khoản nội bộ, đăng nhập, xem thông tin cá nhân và đổi mật khẩu |
| Hộ gia đình và cư dân | Quản lý hồ sơ hộ, căn hộ, cư dân và các liên kết liên quan |
| Biến động cư trú | Chuyển đến, chuyển đi, tạm trú, tạm vắng và lịch sử cư trú |
| Khoản thu và tính phí | Thiết lập khoản thu, kỳ thu, đơn giá và lập danh sách phải thu |
| Thu tiền và giao dịch | Ghi nhận phí bắt buộc, đóng góp tự nguyện và hủy giao dịch |
| Chứng từ | Xem trước, in thông báo thu tiền và biên nhận |
| Tra cứu và thống kê | Tra cứu hồ sơ, lịch sử và thống kê số liệu thu phí |

Các module cùng sử dụng cơ sở dữ liệu và những cơ chế chung về quyền, nhật ký, validation và xử lý lỗi.

Khi một module cần gọi nghiệp vụ của module khác, việc phối hợp được thực hiện qua Service. Các thành viên không tự sao chép quy tắc nghiệp vụ sang nhiều vị trí.

## 6. Nguyên tắc thiết kế và sử dụng cơ sở dữ liệu

Hệ thống sử dụng MySQL với các bảng có quan hệ được thiết kế và review chung.

Các nguyên tắc:

- Mỗi bảng có khóa chính phù hợp.
- Các quan hệ được bảo vệ bằng khóa ngoại khi phù hợp với thiết kế.
- Sử dụng ràng buộc bắt buộc, duy nhất và các kiểm tra dữ liệu cần thiết.
- Dữ liệu tiền tệ sử dụng kiểu số thập phân chính xác; không dùng kiểu dấu phẩy động để tính tiền.
- Các thay đổi đơn giá hoặc cấu hình kỳ mới không làm thay đổi số liệu phải thu đã xác lập của kỳ cũ.
- Giao dịch bị hủy vẫn được lưu để phục vụ truy vết, không xóa khỏi lịch sử.
- Dữ liệu phục vụ thống kê phải tuân theo trạng thái có hiệu lực của giao dịch.
- Không tạo thêm nghĩa vụ đóng hoặc giao dịch chỉ vì người dùng in lại chứng từ.

Mỗi thành viên sử dụng cơ sở dữ liệu riêng trên máy nhưng phải dùng cùng phiên bản MySQL, script tạo bảng và dữ liệu mẫu đã thống nhất.

Mọi thay đổi cấu trúc bảng phải được trao đổi, cập nhật vào script chung và ghi rõ cách áp dụng. Không tự thay đổi CSDL trên máy cá nhân rồi coi đó là thiết kế chung.

Thông tin kết nối được cấu hình riêng theo môi trường. Repository chỉ lưu cấu hình mẫu không chứa bí mật.

## 7. Luồng xử lý minh họa

### 7.1. Ghi nhận đóng tiền

1. Người dùng chọn hộ và khoản phải đóng trên giao diện.
2. React gửi thông tin đóng tiền đến API backend.
3. Backend kiểm tra danh tính và quyền thực hiện.
4. Controller tiếp nhận DTO, kiểm tra dữ liệu đầu vào và gọi Service.
5. Service xác định khoản phải đóng, số đã đóng và số còn thiếu từ dữ liệu có hiệu lực.
6. Service kiểm tra số tiền phải dương và không vượt số còn thiếu.
7. Service điều phối việc ghi nhận giao dịch và các thay đổi liên quan trong một transaction.
8. Nếu xử lý thành công, transaction được commit. Nếu có lỗi thuộc điều kiện rollback, toàn bộ thay đổi trong transaction được hoàn tác.
9. Backend trả kết quả; React hiển thị thông tin mới.

Trường hợp có nhiều yêu cầu thu tiền đồng thời cho cùng khoản phải đóng, việc kiểm tra số còn thiếu và ghi nhận tiền phải được bảo vệ bằng cơ chế kiểm soát đồng thời phù hợp. Không chỉ dựa vào kiểm tra trước khi lưu trên frontend.

Cơ chế chống ghi nhận trùng khi gửi lại yêu cầu và phương án kiểm soát đồng thời được cụ thể hóa trong thiết kế giao dịch.

### 7.2. Hủy giao dịch

1. Người dùng có quyền chọn giao dịch cần hủy và nhập lý do.
2. Backend kiểm tra giao dịch tồn tại, còn hiệu lực và đủ điều kiện hủy.
3. Service cập nhật trạng thái hủy, lưu thông tin truy vết và tính lại các số liệu liên quan.
4. Những thay đổi cần nhất quán được thực hiện trong cùng transaction.
5. Giao dịch đã hủy không được hủy lại và không được tính vào tổng tiền đã thu.
6. Backend trả kết quả để frontend cập nhật hiển thị.

## 8. Cấu trúc repository

| Thư mục | Nội dung |
|---|---|
| frontend/ | Mã nguồn React, thành phần giao diện, điều hướng và các module gọi API |
| backend/ | Mã nguồn Java Spring Boot, cấu hình mẫu và kiểm thử backend |
| database/ | Script tạo bảng, thay đổi cấu trúc và dữ liệu mẫu |
| docs/requirements/ | Wishlist, Raw Log, User Story, AC, NFR và tài liệu truy vết |
| docs/planning/ | Kế hoạch dự án, phân công, tiến độ và theo dõi rủi ro |
| docs/design/ | Kiến trúc, ERD, mô tả bảng, thiết kế API và giao diện |
| README.md | Giới thiệu dự án và hướng dẫn thiết lập, chạy, kiểm thử |

Kiểm thử frontend và backend được đặt trong thư mục tương ứng của từng ứng dụng.

Thư viện tải về, sản phẩm build, cấu hình cá nhân và thông tin nhạy cảm được loại khỏi việc theo dõi Git bằng .gitignore phù hợp.

## 9. Nguyên tắc phối hợp triển khai

- Thống nhất dữ liệu API trước khi frontend và backend tích hợp.
- Mỗi thành viên triển khai trên nhánh theo nhiệm vụ và tạo Pull Request để review.
- Thay đổi liên quan nhiều module cần được thông báo cho những người bị ảnh hưởng.
- Mỗi phần việc cần có hướng dẫn kiểm tra và dữ liệu mẫu khi phù hợp.
- Kết quả kiểm thử phải ghi rõ phần đã xác minh và lỗi còn tồn tại.
- Thiết kế, mã nguồn và script CSDL phải được cập nhật đồng bộ.
- Các quy tắc nghiệp vụ dùng chung được đặt tại một nơi và tái sử dụng.

## 10. Tài liệu cần bổ sung

Từ kiến trúc ban đầu, nhóm tiếp tục hoàn thiện:

1. ERD và mô tả bảng, trường, khóa và ràng buộc.
2. Danh sách API, DTO đầu vào/đầu ra và quy ước xử lý lỗi.
3. Thiết kế giao diện và các trạng thái tương tác.
4. Thiết kế xác thực, phân quyền và nhật ký.
5. Thiết kế transaction, kiểm soát đồng thời và chống ghi nhận trùng.
6. Hướng dẫn cài đặt, cấu hình, chạy và kiểm thử.
7. Thiết kế sao lưu, phục hồi và phương án kiểm chứng các NFR.

Tài liệu này ghi nhận kiến trúc đã thống nhất, không xác nhận rằng các thành phần hoặc chức năng đã được triển khai hoàn tất.
