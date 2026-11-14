# THIẾT KẾ API QUẢN LÝ HỒ SƠ CƯ DÂN (US-05)

## 1. Phạm vi và căn cứ yêu cầu

Tài liệu mô tả thiết kế API thêm mới và cập nhật hồ sơ cư dân, thuộc **US-05 – Thêm và cập nhật hồ sơ cư dân**.

Các thông tin tối thiểu được xác định trong yêu cầu bao gồm:

- Mã cư dân duy nhất.
- Họ và tên.
- Hộ gia đình liên kết.
- Quan hệ với chủ hộ.

Các trường thông tin khác như ngày sinh, giới tính, số định danh hoặc nghề nghiệp chỉ được bổ sung vào hợp đồng API sau khi đối chiếu với tài liệu yêu cầu và sơ đồ thực thể – liên kết (ERD). Tài liệu này chưa quy định các trường đó là bắt buộc.

**Các yêu cầu liên quan:**

| Mã yêu cầu | Nội dung áp dụng |
|---|---|
| US-05 | Thêm và cập nhật hồ sơ cư dân |
| NFR-002 | Xác thực và kiểm tra quyền tại backend |
| NFR-005 | Ghi nhật ký thay đổi |
| NFR-007 | Thông báo lỗi bằng tiếng Việt, chỉ rõ trường dữ liệu và cách khắc phục |

---

## 2. API thêm hồ sơ cư dân

### 2.1. Phương thức và đường dẫn

```http
POST /api/residents
Content-Type: application/json
```

### 2.2. Dữ liệu đầu vào

**Request Body:**

```json
{
  "residentCode": "CD-001",
  "fullName": "Nguyễn Văn An",
  "householdId": 101,
  "relationshipToHead": "Chủ hộ"
}
```

**Quy định các trường dữ liệu:**

| Trường | Kiểu dữ liệu | Bắt buộc | Quy tắc kiểm tra |
|---|---|---|---|
| `residentCode` | Chuỗi | Có | Không được để trống; giá trị phải duy nhất |
| `fullName` | Chuỗi | Có | Không được để trống; hỗ trợ tiếng Việt có dấu |
| `householdId` | Số nguyên | Có | Phải tham chiếu đến hộ gia đình tồn tại |
| `relationshipToHead` | Chuỗi | Có | Phải thuộc danh mục quan hệ đã được thống nhất |

**Lưu ý:** Giá trị `"Chủ hộ"` trong ví dụ chỉ mang tính minh họa. Nhóm cần thống nhất danh mục quan hệ với chủ hộ và cách thức lưu trữ, bao gồm mã danh mục hoặc giá trị văn bản có kiểm soát.

### 2.3. Quy tắc xử lý

1. Kiểm tra trạng thái đăng nhập, quyền thêm hồ sơ cư dân và tính hợp lệ của CSRF token.
2. Kiểm tra tính đầy đủ và hợp lệ của dữ liệu đầu vào.
3. Kiểm tra mã cư dân chưa tồn tại trong hệ thống.
4. Kiểm tra sự tồn tại của hộ gia đình được liên kết.
5. Kiểm tra quan hệ với chủ hộ có thuộc danh mục hợp lệ hay không.
6. Tạo hồ sơ cư dân và thiết lập liên kết với hộ gia đình tương ứng.
7. Ghi nhật ký thao tác thêm mới hồ sơ.
8. Commit transaction và trả về thông tin hồ sơ vừa được tạo.

**Các ràng buộc nghiệp vụ:**

- Mã cư dân phải có ràng buộc duy nhất (`UNIQUE`) tại cơ sở dữ liệu nhằm bảo đảm tính toàn vẹn dữ liệu, kể cả khi hai request đồng thời sử dụng cùng một mã cư dân.
- Việc tạo hồ sơ cư dân không đồng nghĩa với việc tạo tài khoản đăng nhập.
- Việc tạo hồ sơ ban đầu không tự động được xem là ghi nhận sự kiện chuyển đến. Nếu cần ghi nhận biến động cư trú, hệ thống phải sử dụng quy trình nghiệp vụ thuộc **US-06**.

### 2.4. Phản hồi thành công

**HTTP Status:** `201 Created`

**Response Body:**

```json
{
  "id": 501,
  "residentCode": "CD-001",
  "fullName": "Nguyễn Văn An",
  "householdId": 101,
  "relationshipToHead": "Chủ hộ"
}
```

### 2.5. Các trường hợp lỗi

| HTTP Status | Mã lỗi | Mô tả |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Dữ liệu đầu vào bị thiếu hoặc không hợp lệ |
| `400` | `INVALID_HOUSEHOLD_REFERENCE` | Hộ gia đình được chọn không tồn tại |
| `401` | `UNAUTHENTICATED` | Phiên đăng nhập không hợp lệ hoặc đã hết hạn |
| `403` | `FORBIDDEN` | Người dùng không có quyền thực hiện thao tác |
| `403` | `CSRF_INVALID` | Kiểm tra CSRF không thành công |
| `409` | `RESIDENT_CODE_ALREADY_EXISTS` | Mã cư dân đã tồn tại trong hệ thống |
| `500` | `INTERNAL_ERROR` | Hệ thống gặp lỗi ngoài dự kiến |

**Ví dụ phản hồi khi hộ gia đình không tồn tại:**

```json
{
  "code": "INVALID_HOUSEHOLD_REFERENCE",
  "message": "Không thể tạo hồ sơ cư dân vì hộ gia đình được chọn không tồn tại.",
  "fieldErrors": {
    "householdId": "Vui lòng chọn một hộ gia đình hợp lệ."
  }
}
```

### 2.6. Quản lý transaction

Các thao tác tạo hồ sơ cư dân, thiết lập liên kết với hộ gia đình và ghi nhật ký phải được thực hiện trong cùng một transaction nếu cùng sử dụng một cơ sở dữ liệu.

Nếu bất kỳ thao tác nào thất bại, hệ thống phải rollback toàn bộ transaction để tránh lưu trữ dữ liệu không hoàn chỉnh hoặc không nhất quán.

### 2.7. Các tình huống kiểm thử

| Trường hợp kiểm thử | Kết quả mong đợi |
|---|---|
| Dữ liệu đầu vào hợp lệ | Trả về `201 Created` và tạo hồ sơ thành công |
| Mã cư dân đã tồn tại | Trả về `409 Conflict` |
| Thiếu họ tên hoặc quan hệ với chủ hộ | Trả về `400 Bad Request`, chỉ rõ trường bị lỗi |
| Hộ gia đình không tồn tại | Trả về `400 Bad Request`, không tạo hồ sơ |
| Họ tên chứa ký tự tiếng Việt có dấu | Lưu trữ và trả về dữ liệu chính xác |
| Hai request đồng thời sử dụng cùng mã cư dân | Chỉ một hồ sơ được tạo thành công |
| Người dùng không có quyền hoặc CSRF không hợp lệ | Trả về `403 Forbidden`, không tạo hồ sơ |
| Thao tác ghi nhật ký thất bại | Rollback toàn bộ transaction |

---

## 3. API cập nhật hồ sơ cư dân

### 3.1. Phương thức và đường dẫn

```http
PUT /api/residents/{residentId}
Content-Type: application/json
```

Trong đó, `residentId` là ID của hồ sơ cư dân cần cập nhật.

### 3.2. Dữ liệu đầu vào

API này cho phép cập nhật thông tin của cư dân trong phạm vi hộ gia đình hiện tại.

**Request Body:**

```json
{
  "fullName": "Nguyễn Văn An",
  "relationshipToHead": "Chủ hộ"
}
```

**Quy định các trường dữ liệu:**

| Trường | Kiểu dữ liệu | Bắt buộc | Quy tắc kiểm tra |
|---|---|---|---|
| `fullName` | Chuỗi | Có | Không được để trống |
| `relationshipToHead` | Chuỗi | Có | Phải thuộc danh mục quan hệ hợp lệ |

**Các ràng buộc nghiệp vụ:**

- Không cho phép cập nhật các trường `id` và `residentCode`.
- Không cho phép thay đổi `householdId` thông qua API cập nhật hồ sơ thông thường.
- Việc cập nhật không được làm thay đổi lịch sử cư trú của cư dân.

**Đề xuất phân định với US-06:**

Việc chuyển cư dân sang hộ gia đình khác có thể ảnh hưởng đến lịch sử cư trú. Vì vậy, thao tác này cần được thực hiện thông qua quy trình quản lý biến động cư trú thuộc **US-06**, thay vì cập nhật trực tiếp trường `householdId`.

Quyết định trên cần được nhóm thống nhất khi hoàn thiện thiết kế US-06.

Trong trường hợp nhóm cho phép điều chỉnh liên kết hộ gia đình nhằm sửa dữ liệu nhập sai, cần thiết kế riêng quy trình thao tác, quyền truy cập và cơ chế ghi nhật ký phù hợp.

### 3.3. Quy tắc xử lý

1. Kiểm tra trạng thái đăng nhập, quyền cập nhật hồ sơ cư dân và tính hợp lệ của CSRF token.
2. Kiểm tra sự tồn tại của hồ sơ cư dân theo `residentId`.
3. Kiểm tra tính đầy đủ và hợp lệ của dữ liệu đầu vào.
4. Cập nhật các trường thông tin được phép chỉnh sửa.
5. Giữ nguyên mã cư dân, liên kết hộ gia đình và lịch sử cư trú.
6. Ghi nhật ký thay đổi, bao gồm giá trị trước và sau của các trường được cập nhật.
7. Commit transaction và trả về thông tin hồ sơ sau khi cập nhật.

**Lưu ý về tính nhất quán dữ liệu:**

Nếu việc thay đổi quan hệ với chủ hộ thành `"Chủ hộ"` ảnh hưởng đến thông tin chủ hộ được lưu trong bảng hộ gia đình, hệ thống phải xử lý theo quy tắc nghiệp vụ đã thống nhất.

Các thay đổi liên quan phải được thực hiện trong cùng một transaction, bảo đảm không xảy ra tình trạng thông tin chủ hộ giữa các bảng dữ liệu không nhất quán.

### 3.4. Phản hồi thành công

**HTTP Status:** `200 OK`

**Response Body:**

```json
{
  "id": 501,
  "residentCode": "CD-001",
  "fullName": "Nguyễn Văn An",
  "householdId": 101,
  "relationshipToHead": "Chủ hộ"
}
```

### 3.5. Các trường hợp lỗi

| HTTP Status | Mã lỗi | Mô tả |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Dữ liệu không hợp lệ hoặc chứa trường không được phép cập nhật |
| `401` | `UNAUTHENTICATED` | Phiên đăng nhập không hợp lệ hoặc đã hết hạn |
| `403` | `FORBIDDEN` | Người dùng không có quyền cập nhật |
| `403` | `CSRF_INVALID` | Kiểm tra CSRF không thành công |
| `404` | `RESIDENT_NOT_FOUND` | Không tìm thấy hồ sơ cư dân theo ID |
| `409` | `RESIDENT_UPDATE_CONFLICT` | Xung đột với quy tắc nghiệp vụ liên quan đến chủ hộ |
| `500` | `INTERNAL_ERROR` | Hệ thống gặp lỗi ngoài dự kiến |

### 3.6. Các tình huống kiểm thử

| Trường hợp kiểm thử | Kết quả mong đợi |
|---|---|
| Dữ liệu cập nhật hợp lệ | Trả về `200 OK` và lưu dữ liệu chính xác |
| Yêu cầu thay đổi mã cư dân | Trả về `400 Bad Request` |
| Yêu cầu thay đổi hộ gia đình qua API này | Trả về `400 Bad Request` theo phương án phân định đã đề xuất |
| Họ tên bị bỏ trống | Trả về `400 Bad Request` |
| Hồ sơ cư dân không tồn tại | Trả về `404 Not Found` |
| Cập nhật thông tin thành công | Giữ nguyên mã cư dân và lịch sử cư trú |
| Thay đổi quan hệ chủ hộ gây mất nhất quán | Từ chối cập nhật theo quy tắc nghiệp vụ |
| Thao tác ghi nhật ký thất bại | Rollback toàn bộ transaction |
