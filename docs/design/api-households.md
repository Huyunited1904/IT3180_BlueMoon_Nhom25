# Thiết kế API quản lý hộ gia đình

Tài liệu mô tả API quản lý hộ gia đình thuộc US-04.
Tên trường và quan hệ dữ liệu cần được đối chiếu với ERD
trước khi hoàn thiện thiết kế.

## 1. API thêm hồ sơ hộ gia đình

### 1.1. Mục đích

Tạo hồ sơ hộ gia đình để quản lý thông tin căn hộ, chủ hộ, số liên hệ và diện tích phục vụ tính phí.

API chỉ tạo hồ sơ hộ. Danh sách thành viên được bổ sung qua API quản lý cư dân thuộc US-05.

### 1.2. Căn cứ yêu cầu

| Yêu cầu | Nội dung liên quan |
|---|---|
| US-04 | Thêm và cập nhật hồ sơ hộ gia đình |
| AC của US-04 | Tạo được hộ khi mã chưa tồn tại, đầy đủ thông tin bắt buộc và diện tích dương |
| AC của US-04 | Từ chối mã hộ trùng, dữ liệu thiếu hoặc diện tích không dương |
| NFR-002 | Kiểm tra quyền quản lý hồ sơ tại backend |
| NFR-005 | Ghi nhật ký tạo hồ sơ |
| NFR-007 | Thông báo lỗi tiếng Việt, chỉ rõ trường và cách sửa |

### 1.3. Phương thức và đường dẫn

```http
POST /api/households
Content-Type: application/json
```

**Điều kiện truy cập:**

- Người dùng đã đăng nhập bằng session hợp lệ.
- Người dùng có quyền thêm hồ sơ hộ gia đình.
- Request đáp ứng kiểm tra CSRF theo cấu hình xác thực chung.

Backend xác định người thực hiện từ session. Frontend không gửi `createdBy` để quyết định người tạo hồ sơ.

### 1.4. Dữ liệu gửi lên

Ví dụ:

```json
{
  "householdCode": "HO-001",
  "apartmentCode": "A1201",
  "headOfHouseholdName": "Nguyễn Văn An",
  "contactPhone": "0901234567",
  "area": 70.5
}
```

| Trường | Kiểu dữ liệu | Bắt buộc | Ý nghĩa và điều kiện |
|---|---|---|---|
| `householdCode` | String | Có | Mã hộ; không trống và chưa được sử dụng |
| `apartmentCode` | String | Có | Thông tin xác định căn hộ của hộ |
| `headOfHouseholdName` | String | Có | Họ tên chủ hộ; không trống |
| `contactPhone` | String | Có | Số điện thoại liên hệ; không trống |
| `area` | Number | Có | Diện tích căn hộ, đơn vị m²; phải lớn hơn 0 |

**Quy ước dữ liệu:**

- Số điện thoại sử dụng chuỗi để giữ số `0` đầu.
- Diện tích cho phép có phần thập phân.
- Chuỗi chỉ chứa khoảng trắng được xem là không hợp lệ.
- Mã hộ và thông tin văn bản được loại bỏ khoảng trắng ở đầu, cuối trước khi lưu.
- Các giới hạn độ dài, định dạng số điện thoại, quy tắc mã hộ và độ chính xác diện tích phải thống nhất với thiết kế CSDL.

**Điểm cần đối chiếu với ERD:**

Trong ví dụ này, thông tin chủ hộ được gửi dưới dạng họ tên. Nếu CSDL xác định chủ hộ bằng liên kết tới hồ sơ cư dân, cần điều chỉnh DTO và trình tự tạo dữ liệu để tránh tình huống “tạo hộ cần cư dân, tạo cư dân lại cần hộ”.

Tương tự, nếu căn hộ là thực thể riêng, có thể dùng `apartmentId` thay cho `apartmentCode`; backend phải kiểm tra căn hộ được tham chiếu tồn tại.

### 1.5. Kết quả thành công

**HTTP `201 Created`**

Response minh họa:

```json
{
  "id": 101,
  "householdCode": "HO-001",
  "apartmentCode": "A1201",
  "headOfHouseholdName": "Nguyễn Văn An",
  "contactPhone": "0901234567",
  "area": 70.5
}
```

| Trường | Ý nghĩa |
|---|---|
| `id` | Khóa định danh nội bộ do backend tạo |
| `householdCode` | Mã hộ sử dụng trong nghiệp vụ |
| Các trường còn lại | Thông tin đã được kiểm tra và lưu thành công |

Việc dùng đồng thời `id` và `householdCode` là đề xuất thiết kế. Cần thống nhất với khóa chính trong ERD và quy ước các API tiếp theo.

Frontend sử dụng dữ liệu response để hiển thị kết quả hoặc chuyển sang trang chi tiết hộ.

### 1.6. Các trường hợp lỗi

| Tình huống | HTTP status | Mã lỗi |
|---|---|---|
| Chưa đăng nhập, session hết hạn hoặc bị thu hồi | `401 Unauthorized` | `UNAUTHENTICATED` |
| Không có quyền thêm hồ sơ hộ | `403 Forbidden` | `FORBIDDEN` |
| CSRF token thiếu hoặc không hợp lệ | `403 Forbidden` | `CSRF_INVALID` |
| Thiếu trường bắt buộc, sai kiểu dữ liệu hoặc diện tích không dương | `400 Bad Request` | `VALIDATION_ERROR` |
| Mã hộ đã tồn tại | `409 Conflict` | `HOUSEHOLD_CODE_ALREADY_EXISTS` |
| Lỗi xử lý nội bộ | `500 Internal Server Error` | `INTERNAL_ERROR` |

**Ví dụ diện tích không hợp lệ:**

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Vui lòng kiểm tra thông tin hồ sơ hộ.",
  "fieldErrors": {
    "area": "Diện tích phải lớn hơn 0 m²."
  }
}
```

**Ví dụ mã hộ đã tồn tại:**

```json
{
  "code": "HOUSEHOLD_CODE_ALREADY_EXISTS",
  "message": "Mã hộ đã được sử dụng.",
  "fieldErrors": {
    "householdCode": "Vui lòng nhập mã hộ khác."
  }
}
```

Khi dữ liệu không hợp lệ, hệ thống không tạo hồ sơ hộ.

### 1.7. Luồng xử lý backend

1. **Kiểm tra xác thực và quyền:** xác định tài khoản từ session, kiểm tra quyền thêm hồ sơ.
2. **Kiểm tra request:** Controller tiếp nhận DTO, kiểm tra kiểu dữ liệu và các trường bắt buộc.
3. **Kiểm tra nghiệp vụ:** Service chuẩn hóa dữ liệu, kiểm tra mã hộ và các liên kết theo thiết kế CSDL.
4. **Lưu hồ sơ:** Repository lưu thông tin hộ.
5. **Ghi nhật ký:** lưu người thực hiện, thời điểm, đối tượng và nội dung tạo mới.
6. **Hoàn tất transaction:** hồ sơ và nhật ký phải được lưu nhất quán; nếu một bước ghi thất bại thì rollback.
7. **Trả response:** chuyển dữ liệu sang DTO và trả `201 Created`.

CSDL phải có ràng buộc duy nhất cho mã hộ. Chỉ kiểm tra mã trùng trước khi lưu là chưa đủ, vì hai request có thể cùng vượt qua bước kiểm tra đó.

### 1.8. Quy tắc nghiệp vụ và giới hạn thao tác

- Tạo hộ không tự tạo tài khoản đăng nhập cho chủ hộ hoặc cư dân.
- Tạo hộ không tự ghi nhận thành viên.
- Tạo hộ không tự lập khoản phải thu hoặc giao dịch thu tiền.
- Diện tích được lưu để phục vụ bước tính phí sau này.
- Không suy ra quy tắc “mỗi căn hộ chỉ có một hộ” khi nhóm chưa thống nhất quan hệ này trong thiết kế dữ liệu.
- Backend chỉ nhận các trường được khai báo trong DTO, không cho frontend tự đặt ID nội bộ hoặc thông tin kiểm toán.

### 1.9. Tình huống kiểm thử

| Mã | Tình huống | Kết quả mong đợi |
|---|---|---|
| HH-CREATE-01 | Người có quyền gửi đầy đủ thông tin, mã hộ mới, diện tích `70.5` | Trả `201`; dữ liệu lưu đúng |
| HH-CREATE-02 | Mã hộ đã tồn tại | Trả `409`; không tạo thêm hộ |
| HH-CREATE-03 | Thiếu trường bắt buộc hoặc chuỗi chỉ chứa khoảng trắng | Trả `400`; chỉ rõ trường lỗi |
| HH-CREATE-04 | Diện tích bằng `0` hoặc âm | Trả `400`; không lưu |
| HH-CREATE-05 | Diện tích là chuỗi không biểu diễn được số | Trả `400`; không lưu |
| HH-CREATE-06 | Chưa đăng nhập | Trả `401`; không tạo hộ |
| HH-CREATE-07 | Đăng nhập nhưng không có quyền | Trả `403`; không tạo hộ |
| HH-CREATE-08 | Hai request đồng thời tạo cùng mã hộ mới | Chỉ một hồ sơ được tạo; request còn lại trả lỗi trùng mã |
| HH-CREATE-09 | Giả lập lỗi khi ghi nhật ký | Hồ sơ và nhật ký không bị lưu dở dang |
| HH-CREATE-10 | Tạo thành công | Có nhật ký xác định đúng người thực hiện và hồ sơ được tạo |

---
