Dưới đây là bản dự thảo để đưa vào **`docs/design/api.md`**, đã cập nhật xác thực bằng session và các quy tắc mình vừa thống nhất.

---

# Thiết kế API BlueMoon — Tài khoản và xác thực

## 1. Mục đích và phạm vi

Tài liệu mô tả API phục vụ cấp tài khoản nội bộ, đăng nhập, đăng xuất, xem thông tin cá nhân và đổi mật khẩu của hệ thống BlueMoon.

Tài liệu là căn cứ để thống nhất dữ liệu trao đổi giữa frontend React và backend Spring Boot, triển khai kiểm tra quyền và xây dựng các ca kiểm thử.

Phạm vi được đối chiếu với các yêu cầu:

| Mã yêu cầu | Nội dung |
|---|---|
| US-01 | Cấp tài khoản nội bộ và phân quyền |
| US-02 | Đăng nhập |
| US-03 | Xem thông tin cá nhân và đổi mật khẩu |
| NFR-001 | Bảo vệ mật khẩu |
| NFR-002 | Kiểm soát quyền truy cập tại backend |
| NFR-005 | Ghi nhật ký thay đổi quan trọng |
| NFR-007 | Giao diện và thông báo lỗi bằng tiếng Việt |

Đăng xuất được bổ sung trong thiết kế để kết thúc phiên sử dụng. Đây là thao tác hỗ trợ vòng đời xác thực, không tạo thêm mã User Story.

## 2. Quy ước chung

### 2.1. Đường dẫn và dữ liệu

- Đường dẫn API bắt đầu bằng `/api`.
- Tên tài nguyên và trường dữ liệu sử dụng tiếng Anh.
- Tên trường JSON sử dụng kiểu `camelCase`.
- Request có nội dung JSON sử dụng `Content-Type: application/json`.
- Thông báo hiển thị cho người dùng sử dụng tiếng Việt có dấu.
- Mỗi API trả mã trạng thái HTTP phù hợp với kết quả xử lý.

### 2.2. Cấu trúc lỗi

Các API sử dụng cùng cấu trúc:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Vui lòng kiểm tra thông tin đã nhập.",
  "fieldErrors": {
    "username": "Tên đăng nhập không được để trống."
  }
}
```

| Trường | Ý nghĩa |
|---|---|
| `code` | Mã lỗi để frontend xác định cách xử lý |
| `message` | Thông báo tổng quát cho người dùng |
| `fieldErrors` | Lỗi theo từng trường; trả `{}` khi không có lỗi trường cụ thể |

Response không chứa stack trace, truy vấn SQL, thông tin kết nối CSDL hoặc dữ liệu xác thực nhạy cảm.

### 2.3. Mã trạng thái HTTP

| Mã | Ý nghĩa |
|---|---|
| `200 OK` | Yêu cầu được xử lý thành công |
| `201 Created` | Tạo tài khoản thành công |
| `400 Bad Request` | Dữ liệu đầu vào hoặc điều kiện xử lý không hợp lệ |
| `401 Unauthorized` | Chưa đăng nhập hoặc thông tin xác thực không hợp lệ |
| `403 Forbidden` | Không có quyền hoặc không đáp ứng kiểm tra bảo vệ request |
| `409 Conflict` | Xung đột dữ liệu, chẳng hạn tên đăng nhập đã tồn tại |
| `500 Internal Server Error` | Lỗi xử lý nội bộ |

Đối với API, backend trả response JSON thay vì chuyển hướng sang trang đăng nhập HTML. Frontend tiếp nhận `401` để hiển thị yêu cầu đăng nhập lại.

## 3. Xác thực và quản lý phiên

### 3.1. Cơ chế xác thực

Hệ thống sử dụng **session phía backend**.

Sau khi kiểm tra thông tin đăng nhập thành công, backend thiết lập phiên xác thực và gửi mã phiên về trình duyệt bằng cookie. Các request tiếp theo sử dụng cookie này để xác định tài khoản đang đăng nhập.

Thông tin xác thực được quản lý phía backend. Frontend không lưu mật khẩu hoặc mã phiên vào `localStorage`.

Backend phải thay mới mã phiên khi đăng nhập thành công để hạn chế việc sử dụng lại mã phiên có trước đăng nhập.

### 3.2. Cookie phiên

Cookie phiên được cấu hình theo môi trường triển khai:

| Thuộc tính | Quy định |
|---|---|
| `HttpOnly` | Bật để JavaScript phía trình duyệt không đọc trực tiếp mã phiên |
| `Secure` | Bật trong môi trường triển khai qua HTTPS |
| `SameSite` | Cấu hình theo quan hệ giữa địa chỉ frontend và backend |
| `Path`, `Domain` | Giới hạn trong phạm vi ứng dụng cần sử dụng |

Nếu frontend và backend chạy khác origin, frontend phải gửi request kèm credentials; backend chỉ cho phép các origin đã cấu hình cụ thể.

Các thao tác thay đổi dữ liệu phải được bảo vệ chống CSRF. Thiết kế triển khai cần xác định cách frontend lấy và gửi CSRF token; `HttpOnly` không thay thế cơ chế bảo vệ này.

### 3.3. Vòng đời phiên

- Mỗi lần đăng nhập trên một trình duyệt hoặc thiết bị có thể tạo một phiên riêng.
- Phiên hết hạn hoặc bị thu hồi không được sử dụng để truy cập API được bảo vệ.
- Đăng xuất kết thúc phiên hiện tại.
- Đổi mật khẩu thành công thu hồi các phiên khác của cùng tài khoản và duy trì phiên đang thực hiện đổi mật khẩu.
- Request đang xử lý trước thời điểm thu hồi có thể đã được chấp nhận; các request xác thực sau thời điểm thu hồi phải bị từ chối.

Thời gian hết hạn phiên và nơi lưu session cần được xác định trong cấu hình triển khai.

## 4. Quy tắc tài khoản và mật khẩu

### 4.1. Cấp tài khoản

Tài khoản được người quản trị cấp cho nhân sự nội bộ. Hệ thống không cung cấp đăng ký công khai.

Tên đăng nhập phải duy nhất. Vai trò được cấp phải thuộc danh sách hợp lệ và nằm trong quyền cấp của người thực hiện.

### 4.2. Chính sách mật khẩu

- Mật khẩu khi cấp tài khoản và mật khẩu mới khi thay đổi phải có tối thiểu **8 ký tự**.
- Chưa quy định bắt buộc chữ hoa, chữ số hoặc ký tự đặc biệt.
- Không tự cắt khoảng trắng hoặc thay đổi nội dung mật khẩu.
- Mật khẩu được lưu bằng cơ chế băm an toàn.
- Không ghi mật khẩu hoặc giá trị băm vào nhật ký.
- Không trả mật khẩu hoặc giá trị băm qua API.

Đăng nhập kiểm tra mật khẩu với dữ liệu đã lưu, không áp lại chính sách tạo mật khẩu mới để từ chối mật khẩu hiện có.

### 4.3. Vai trò

Trong các ví dụ dưới đây, `RESIDENT_MANAGER` minh họa vai trò quản lý cư dân.

Mã vai trò, danh sách vai trò và ma trận quyền phải được thống nhất trong thiết kế phân quyền trước khi triển khai. Frontend không được tự quyết định hoặc mở rộng quyền của tài khoản.

## 5. Danh sách API

| Phương thức | Đường dẫn | Chức năng | Điều kiện truy cập |
|---|---|---|---|
| POST | `/api/users` | Cấp tài khoản nội bộ | Đã đăng nhập, có quyền cấp tài khoản |
| POST | `/api/auth/login` | Đăng nhập | Không yêu cầu phiên đã xác thực |
| POST | `/api/auth/logout` | Đăng xuất phiên hiện tại | Sử dụng phiên hiện tại nếu có |
| GET | `/api/users/me` | Xem thông tin tài khoản hiện tại | Đã đăng nhập |
| PUT | `/api/users/me/password` | Đổi mật khẩu | Đã đăng nhập |

## 6. API cấp tài khoản nội bộ

### 6.1. Thông tin chung

```http
POST /api/users
```

**Yêu cầu liên quan:** US-01, NFR-001, NFR-002, NFR-005, NFR-007.

### 6.2. Request body

```json
{
  "username": "nhanvien01",
  "password": "MatKhauViDu123!",
  "role": "RESIDENT_MANAGER"
}
```

| Trường | Kiểu | Bắt buộc | Điều kiện |
|---|---|---|---|
| `username` | String | Có | Không trống, chưa được sử dụng |
| `password` | String | Có | Tối thiểu 8 ký tự |
| `role` | String | Có | Vai trò hợp lệ, người thực hiện được phép cấp |

### 6.3. Response thành công

**HTTP `201 Created`**

```json
{
  "id": 12,
  "username": "nhanvien01",
  "role": "RESIDENT_MANAGER"
}
```

### 6.4. Trường hợp lỗi

| Tình huống | HTTP | Mã lỗi |
|---|---|---|
| Chưa đăng nhập hoặc phiên không hợp lệ | 401 | `UNAUTHENTICATED` |
| Không có quyền cấp tài khoản hoặc cấp vai trò được yêu cầu | 403 | `FORBIDDEN` |
| Thiếu dữ liệu, mật khẩu dưới 8 ký tự hoặc vai trò không hợp lệ | 400 | `VALIDATION_ERROR` |
| Tên đăng nhập đã tồn tại | 409 | `USERNAME_ALREADY_EXISTS` |
| Lỗi nội bộ khi lưu | 500 | `INTERNAL_ERROR` |

Ví dụ tên đăng nhập trùng:

```json
{
  "code": "USERNAME_ALREADY_EXISTS",
  "message": "Tên đăng nhập đã được sử dụng.",
  "fieldErrors": {
    "username": "Vui lòng chọn tên đăng nhập khác."
  }
}
```

### 6.5. Quy tắc xử lý

1. Kiểm tra phiên và quyền cấp tài khoản.
2. Kiểm tra dữ liệu đầu vào.
3. Kiểm tra tên đăng nhập và vai trò.
4. Băm mật khẩu.
5. Lưu tài khoản, vai trò và nhật ký trong cùng transaction.
6. Trả thông tin tài khoản vừa tạo.

CSDL phải có ràng buộc duy nhất đối với tên đăng nhập để ngăn tạo trùng khi có nhiều request đồng thời.

Nhật ký ghi người thực hiện, thời điểm, tài khoản được tạo và vai trò được cấp.

## 7. API đăng nhập

### 7.1. Thông tin chung

```http
POST /api/auth/login
```

**Yêu cầu liên quan:** US-02, NFR-001, NFR-002, NFR-007.

### 7.2. Request body

```json
{
  "username": "nhanvien01",
  "password": "MatKhauViDu123!"
}
```

| Trường | Kiểu | Bắt buộc | Điều kiện |
|---|---|---|---|
| `username` | String | Có | Không trống |
| `password` | String | Có | Không trống |

### 7.3. Response thành công

**HTTP `200 OK`**

Backend thiết lập phiên xác thực và gửi cookie phiên. Response body:

```json
{
  "user": {
    "id": 12,
    "username": "nhanvien01",
    "role": "RESIDENT_MANAGER"
  }
}
```

Không trả JWT hoặc mã phiên trong response body.

### 7.4. Trường hợp lỗi

| Tình huống | HTTP | Mã lỗi |
|---|---|---|
| Thiếu tên đăng nhập hoặc mật khẩu | 400 | `VALIDATION_ERROR` |
| Tài khoản không tồn tại hoặc mật khẩu sai | 401 | `INVALID_CREDENTIALS` |
| Lỗi nội bộ hoặc không truy cập được CSDL | 500 | `INTERNAL_ERROR` |

Tên đăng nhập không tồn tại và mật khẩu sai sử dụng cùng thông báo:

```json
{
  "code": "INVALID_CREDENTIALS",
  "message": "Tên đăng nhập hoặc mật khẩu không đúng.",
  "fieldErrors": {}
}
```

### 7.5. Quy tắc xử lý

1. Kiểm tra dữ liệu đầu vào.
2. Tìm tài khoản theo tên đăng nhập.
3. Kiểm chứng mật khẩu bằng cơ chế phù hợp với thuật toán băm.
4. Nếu hợp lệ, thiết lập thông tin xác thực trong session và thay mới mã phiên.
5. Trả thông tin tài khoản.

Đăng nhập thành công không cấp quyền sử dụng mọi API. Backend tiếp tục kiểm tra quyền tại từng thao tác được bảo vệ.

## 8. API đăng xuất

### 8.1. Thông tin chung

```http
POST /api/auth/logout
```

API kết thúc phiên hiện tại. Không có request body.

### 8.2. Response thành công

**HTTP `200 OK`**

```json
{
  "message": "Đăng xuất thành công."
}
```

### 8.3. Quy tắc xử lý

- Vô hiệu hóa phiên hiện tại phía backend.
- Xóa cookie phiên bằng các thuộc tính phạm vi tương ứng khi tạo cookie.
- Frontend xóa thông tin người dùng đang giữ trong bộ nhớ ứng dụng.
- Không ảnh hưởng đến các phiên khác của cùng tài khoản.
- Request gọi lại khi không còn phiên vẫn có thể trả thành công, sau khi đáp ứng kiểm tra bảo vệ request áp dụng.

Chỉ xóa thông tin trên frontend không được coi là hoàn thành đăng xuất. Mã phiên cũ phải mất khả năng truy cập API được bảo vệ.

## 9. API xem thông tin cá nhân

### 9.1. Thông tin chung

```http
GET /api/users/me
```

**Yêu cầu liên quan:** US-03, NFR-001, NFR-002, NFR-007.

API không có request body.

Backend lấy danh tính từ phiên đã xác thực, không nhận ID tài khoản từ frontend.

### 9.2. Response thành công

**HTTP `200 OK`**

```json
{
  "id": 12,
  "username": "nhanvien01",
  "role": "RESIDENT_MANAGER"
}
```

Đây là tập trường ban đầu. Họ tên, email hoặc số điện thoại được bổ sung khi thiết kế dữ liệu tài khoản thống nhất các trường này.

### 9.3. Trường hợp lỗi

| Tình huống | HTTP | Mã lỗi |
|---|---|---|
| Chưa đăng nhập, phiên hết hạn hoặc bị thu hồi | 401 | `UNAUTHENTICATED` |
| Tài khoản gắn với phiên không còn tồn tại | 401 | `UNAUTHENTICATED` |
| Lỗi nội bộ khi đọc dữ liệu | 500 | `INTERNAL_ERROR` |

### 9.4. Quy tắc xử lý

- Chỉ trả hồ sơ của tài khoản đang đăng nhập.
- Đọc thông tin hiện tại của tài khoản từ backend.
- Chuyển dữ liệu sang response DTO.
- Không trả Entity trực tiếp nếu có thể làm lộ trường nội bộ hoặc dữ liệu nhạy cảm.

## 10. API đổi mật khẩu

### 10.1. Thông tin chung

```http
PUT /api/users/me/password
```

**Yêu cầu liên quan:** US-03, NFR-001, NFR-002, NFR-005, NFR-007.

### 10.2. Request body

```json
{
  "currentPassword": "MatKhauCu123!",
  "newPassword": "MatKhauMoi456!",
  "confirmPassword": "MatKhauMoi456!"
}
```

| Trường | Kiểu | Bắt buộc | Điều kiện |
|---|---|---|---|
| `currentPassword` | String | Có | Đúng mật khẩu hiện tại |
| `newPassword` | String | Có | Tối thiểu 8 ký tự |
| `confirmPassword` | String | Có | Trùng chính xác với `newPassword` |

### 10.3. Response thành công

**HTTP `200 OK`**

```json
{
  "message": "Đổi mật khẩu thành công. Các phiên đăng nhập khác đã được đăng xuất."
}
```

Chỉ trả thông báo này khi việc cập nhật mật khẩu và thu hồi các phiên khác đã được thực hiện thành công.

### 10.4. Trường hợp lỗi

| Tình huống | HTTP | Mã lỗi |
|---|---|---|
| Chưa đăng nhập hoặc phiên không hợp lệ | 401 | `UNAUTHENTICATED` |
| Thiếu dữ liệu, mật khẩu mới dưới 8 ký tự hoặc xác nhận không khớp | 400 | `VALIDATION_ERROR` |
| Mật khẩu hiện tại không đúng | 400 | `CURRENT_PASSWORD_INCORRECT` |
| Lỗi nội bộ khi xử lý | 500 | `INTERNAL_ERROR` |

Ví dụ:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Vui lòng kiểm tra thông tin đổi mật khẩu.",
  "fieldErrors": {
    "newPassword": "Mật khẩu mới phải có tối thiểu 8 ký tự.",
    "confirmPassword": "Mật khẩu xác nhận không khớp với mật khẩu mới."
  }
}
```

### 10.5. Quy tắc xử lý

1. Kiểm tra phiên và xác định tài khoản đang đăng nhập.
2. Kiểm tra dữ liệu đầu vào.
3. Kiểm chứng mật khẩu hiện tại.
4. Kiểm tra độ dài mật khẩu mới và xác nhận.
5. Băm mật khẩu mới.
6. Cập nhật mật khẩu và ghi nhật ký trong cùng transaction.
7. Thu hồi các phiên khác của tài khoản, duy trì phiên hiện tại.
8. Trả kết quả thành công.

Thiết kế quản lý phiên phải bảo đảm không bỏ sót các phiên cũ khi có đăng nhập hoặc đổi mật khẩu đồng thời.

Nếu nơi lưu session tách khỏi CSDL, không mặc định transaction CSDL có thể hoàn tác thao tác thu hồi phiên. Phần triển khai phải xác định cách phối hợp và xử lý lỗi giữa hai thành phần trước khi hoàn thiện chức năng.

### 10.6. Nhật ký

Nhật ký ghi:

- Tài khoản thực hiện.
- Thời điểm thay đổi.
- Đối tượng tài khoản bị tác động.
- Hành động đổi mật khẩu.

Không ghi mật khẩu cũ, mật khẩu mới, mật khẩu xác nhận hoặc giá trị băm.

### 10.7. Hành vi sau khi đổi mật khẩu

- Phiên đang thực hiện tiếp tục sử dụng hệ thống.
- Các phiên khác không được truy cập API được bảo vệ.
- Frontend tại các phiên bị thu hồi chuyển về đăng nhập khi nhận `401`.
- Đăng nhập bằng mật khẩu cũ thất bại.
- Đăng nhập bằng mật khẩu mới thành công.

## 11. Truy vết và kiểm thử

| API | Yêu cầu liên quan | Tình huống kiểm tra chính |
|---|---|---|
| Cấp tài khoản | US-01 | Tạo đúng vai trò; từ chối tên trùng, dữ liệu thiếu và mật khẩu dưới 8 ký tự |
| Đăng nhập | US-02 | Thông tin đúng; sai mật khẩu; tên không tồn tại; kiểm tra cookie phiên |
| Đăng xuất | Hỗ trợ US-02 | Phiên hiện tại mất hiệu lực; các phiên khác vẫn sử dụng được |
| Xem thông tin cá nhân | US-03 | Trả đúng tài khoản; không lộ mật khẩu; từ chối phiên không hợp lệ |
| Đổi mật khẩu | US-03 | Kiểm tra mật khẩu hiện tại, độ dài, xác nhận; mật khẩu cũ mất hiệu lực; thu hồi phiên khác |
| Các API được bảo vệ | NFR-002 | Gọi trực tiếp khi chưa đăng nhập hoặc không đủ quyền |
| Tạo tài khoản, đổi mật khẩu | NFR-001, NFR-005 | Kiểm tra dữ liệu lưu, response và nhật ký |
| Các API | NFR-007 | Thông báo tiếng Việt, chỉ rõ lỗi và cách sửa |

Quy tắc tối thiểu 8 ký tự và thu hồi các phiên khác là quyết định được bổ sung trong thiết kế. Các tài liệu AC và truy vết liên quan cần được cập nhật đồng bộ khi nhóm duyệt.

## 12. Các chi tiết cần hoàn thiện trước triển khai

1. Mã vai trò, quyền tương ứng và quyền được phép cấp từng vai trò.
2. Quy tắc tên đăng nhập: độ dài, ký tự cho phép, chuẩn hóa và phân biệt chữ hoa/chữ thường.
3. Nơi lưu session, thời gian hết hạn và cơ chế thu hồi các phiên khác.
4. Cấu hình cookie, CORS và cách trao đổi CSRF token.
5. Các trường thông tin cá nhân ngoài mã tài khoản, tên đăng nhập và vai trò.

Tài liệu ghi nhận thiết kế API dự kiến, chưa xác nhận các chức năng đã được lập trình hoặc kiểm thử hoàn tất.
