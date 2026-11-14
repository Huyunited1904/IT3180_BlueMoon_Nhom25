---

# Thiết kế API tra cứu hộ gia đình, cư dân và lịch sử biến động

## 1. Mục đích và phạm vi

Tài liệu mô tả các API phục vụ **US-15 — Tra cứu hồ sơ hộ gia đình, cư dân và lịch sử biến động**.

Các chức năng được thiết kế:

- Tra cứu danh sách hộ gia đình.
- Xem chi tiết hộ gia đình và các thành viên hiện tại.
- Tra cứu danh sách cư dân.
- Xem chi tiết hồ sơ cư dân.
- Tra cứu lịch sử biến động theo hộ gia đình hoặc cư dân.

Các API trong tài liệu chỉ đọc dữ liệu. Việc ghi nhận chuyển đến, chuyển đi, tạm trú và tạm vắng được thực hiện qua các API thuộc US-06 và US-07.

**Trạng thái tài liệu:** bản thiết kế ban đầu. Tên trường, quan hệ dữ liệu và cấu trúc lịch sử cần được đối chiếu với ERD trước khi triển khai.

### 1.1. Căn cứ yêu cầu

| Mã yêu cầu | Nội dung áp dụng |
|---|---|
| US-15 | Tra cứu hồ sơ hộ gia đình, cư dân và lịch sử biến động |
| NFR-002 | Xác thực và kiểm tra quyền truy cập tại backend |
| NFR-004 | Kiểm chứng hiệu năng tra cứu theo mục tiêu và điều kiện kiểm thử đã thống nhất |
| NFR-007 | Hiển thị tiếng Việt chính xác; thông báo lỗi rõ nguyên nhân và cách xử lý |

## 2. Quy ước chung

### 2.1. Giao thức và định dạng dữ liệu

- Các endpoint bắt đầu bằng `/api`.
- Sử dụng phương thức `GET` cho các thao tác tra cứu.
- Phản hồi sử dụng JSON; tên trường theo quy tắc `camelCase`.
- Ngày nghiệp vụ sử dụng định dạng `YYYY-MM-DD`.
- Thông báo lỗi sử dụng tiếng Việt.
- Không gửi request body trong các API tra cứu của tài liệu này.

### 2.2. Xác thực và phân quyền

Tất cả API yêu cầu phiên đăng nhập hợp lệ và quyền tra cứu hồ sơ cư trú.

Backend phải kiểm tra quyền trước khi truy xuất và trả dữ liệu. Việc ẩn chức năng trên giao diện không thay thế kiểm tra quyền tại backend.

Khi frontend và backend chạy khác origin, frontend gửi request kèm credentials theo cấu hình session và CORS của hệ thống.

Các API `GET` không được thay đổi dữ liệu nghiệp vụ.

### 2.3. Phân trang

Các API trả danh sách sử dụng phân trang:

| Tham số | Kiểu dữ liệu | Mặc định | Quy tắc |
|---|---|---|---|
| `page` | Số nguyên | `0` | Phải lớn hơn hoặc bằng `0` |
| `size` | Số nguyên | `20` | Từ `1` đến `100` |

Trang đầu tiên có chỉ số `0`.

Cấu trúc phản hồi:

```json
{
  "items": [],
  "page": 0,
  "size": 20,
  "totalElements": 0,
  "totalPages": 0
}
```

| Trường | Ý nghĩa |
|---|---|
| `items` | Danh sách bản ghi trong trang hiện tại |
| `page` | Chỉ số trang hiện tại |
| `size` | Kích thước trang được yêu cầu |
| `totalElements` | Tổng số bản ghi phù hợp với bộ lọc |
| `totalPages` | Tổng số trang tương ứng |

Không có kết quả hoặc yêu cầu trang vượt quá số trang hiện có vẫn trả `200 OK` với `items: []`. Các trường tổng số phản ánh kết quả của bộ lọc.

### 2.4. Quy tắc tìm kiếm

- Loại bỏ khoảng trắng ở đầu và cuối `keyword`.
- Không truyền `keyword` hoặc truyền chuỗi rỗng được hiểu là không lọc theo từ khóa.
- Tìm kiếm từ khóa theo chuỗi con trong các trường được quy định tại từng endpoint.
- Các trường nằm trong cùng bộ lọc từ khóa được kết hợp bằng điều kiện **OR**.
- Các bộ lọc khác nhau được kết hợp bằng điều kiện **AND**.
- Đề xuất tìm kiếm không phân biệt chữ hoa và chữ thường.
- Quy tắc phân biệt dấu tiếng Việt cần được thống nhất theo cấu hình cơ sở dữ liệu và kiểm thử trước khi triển khai.
- Truy vấn phải được tham số hóa; không ghép trực tiếp dữ liệu người dùng vào câu lệnh SQL.

### 2.5. Cấu trúc lỗi

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Tham số tra cứu chưa hợp lệ. Vui lòng kiểm tra lại.",
  "fieldErrors": {
    "size": "Số bản ghi mỗi trang phải từ 1 đến 100."
  }
}
```

Với lỗi không gắn với trường cụ thể, `fieldErrors` là đối tượng rỗng.

Phản hồi không chứa stack trace, câu lệnh SQL hoặc thông tin cấu hình nội bộ.

## 3. API tra cứu danh sách hộ gia đình

### 3.1. Phương thức và đường dẫn

```http
GET /api/households
```

### 3.2. Tham số truy vấn

| Tham số | Kiểu dữ liệu | Bắt buộc | Ý nghĩa |
|---|---|---|---|
| `keyword` | Chuỗi | Không | Tìm theo mã hộ hoặc tên chủ hộ |
| `apartmentCode` | Chuỗi | Không | Lọc chính xác theo mã căn hộ |
| `page` | Số nguyên | Không | Chỉ số trang |
| `size` | Số nguyên | Không | Số bản ghi mỗi trang |

Nếu ERD sử dụng căn hộ là thực thể riêng, nhóm cần thống nhất việc sử dụng `apartmentId` thay cho `apartmentCode` trước khi chốt hợp đồng API.

Ví dụ:

```http
GET /api/households?apartmentCode=A1201&page=0&size=20
```

Ví dụ kết hợp từ khóa và căn hộ:

```http
GET /api/households?keyword=An&apartmentCode=A1201&page=0&size=20
```

Request thứ hai chỉ trả các hộ thuộc căn hộ `A1201` và có mã hộ hoặc tên chủ hộ chứa từ khóa `An`.

### 3.3. Quy tắc xử lý

1. Kiểm tra phiên đăng nhập và quyền tra cứu.
2. Kiểm tra tham số phân trang và bộ lọc.
3. Chuẩn hóa dữ liệu tìm kiếm.
4. Truy vấn danh sách theo bộ lọc.
5. Sắp xếp theo mã hộ tăng dần; sử dụng ID làm tiêu chí phụ để bảo đảm thứ tự ổn định.
6. Trả dữ liệu của trang hiện tại và thông tin phân trang.

### 3.4. Phản hồi thành công

```http
200 OK
```

```json
{
  "items": [
    {
      "id": 101,
      "householdCode": "HO-001",
      "apartmentCode": "A1201",
      "headOfHouseholdName": "Nguyễn Văn An",
      "contactPhone": "0901234567",
      "area": 70.5
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

### 3.5. Trường hợp không có kết quả

```http
200 OK
```

```json
{
  "items": [],
  "page": 0,
  "size": 20,
  "totalElements": 0,
  "totalPages": 0
}
```

Frontend hiển thị thông báo: **“Không tìm thấy hộ gia đình phù hợp.”**

## 4. API xem chi tiết hộ gia đình

### 4.1. Phương thức và đường dẫn

```http
GET /api/households/{householdId}
```

### 4.2. Tham số đường dẫn

| Tham số | Kiểu dữ liệu | Quy tắc |
|---|---|---|
| `householdId` | Số nguyên | ID nội bộ của hộ gia đình; phải lớn hơn `0` |

### 4.3. Quy tắc xử lý

1. Kiểm tra phiên đăng nhập và quyền tra cứu.
2. Kiểm tra định dạng ID.
3. Tìm hồ sơ hộ gia đình.
4. Lấy danh sách thành viên hiện tại theo quan hệ dữ liệu đã thống nhất.
5. Trả thông tin hộ và các thành viên.

Danh sách thành viên hiện tại không được xác định chỉ dựa trên việc từng có liên kết với hộ. Cách xác định phải phù hợp với mô hình quản lý chuyển đến và chuyển đi của US-06.

### 4.4. Phản hồi thành công

```http
200 OK
```

```json
{
  "id": 101,
  "householdCode": "HO-001",
  "apartmentCode": "A1201",
  "headOfHouseholdName": "Nguyễn Văn An",
  "contactPhone": "0901234567",
  "area": 70.5,
  "members": [
    {
      "id": 501,
      "residentCode": "CD-001",
      "fullName": "Nguyễn Văn An",
      "relationshipToHead": "Chủ hộ"
    }
  ]
}
```

Nếu hộ tồn tại nhưng chưa có thành viên hiện tại, trả `members: []`.

Các thành viên đã chuyển đi được tra cứu thông qua lịch sử biến động.

### 4.5. Không tìm thấy hộ

```http
404 Not Found
```

```json
{
  "code": "HOUSEHOLD_NOT_FOUND",
  "message": "Không tìm thấy hồ sơ hộ gia đình.",
  "fieldErrors": {}
}
```

## 5. API tra cứu danh sách cư dân

### 5.1. Phương thức và đường dẫn

```http
GET /api/residents
```

### 5.2. Tham số truy vấn

| Tham số | Kiểu dữ liệu | Bắt buộc | Ý nghĩa |
|---|---|---|---|
| `keyword` | Chuỗi | Không | Tìm theo mã cư dân hoặc họ tên |
| `householdId` | Số nguyên | Không | Lọc theo hộ hiện tại; nếu truyền phải lớn hơn `0` |
| `page` | Số nguyên | Không | Chỉ số trang |
| `size` | Số nguyên | Không | Số bản ghi mỗi trang |

Ví dụ:

```http
GET /api/residents?keyword=An&householdId=101&page=0&size=20
```

### 5.3. Quy tắc xử lý

1. Kiểm tra phiên đăng nhập và quyền tra cứu.
2. Kiểm tra tham số.
3. Tìm cư dân theo mã hoặc họ tên.
4. Nếu có `householdId`, chỉ lấy cư dân có liên kết hiện tại với hộ đó.
5. Sắp xếp theo mã cư dân tăng dần; sử dụng ID làm tiêu chí phụ.
6. Trả danh sách và thông tin phân trang.

Khi không lọc theo hộ, phạm vi tra cứu bao gồm các hồ sơ cư dân được hệ thống lưu giữ, kể cả hồ sơ đã chuyển đi.

Một bộ lọc `householdId` đúng định dạng nhưng không có kết quả phù hợp trả danh sách rỗng, không trả `404`.

### 5.4. Phản hồi thành công

```http
200 OK
```

```json
{
  "items": [
    {
      "id": 501,
      "residentCode": "CD-001",
      "fullName": "Nguyễn Văn An",
      "householdId": 101,
      "householdCode": "HO-001",
      "relationshipToHead": "Chủ hộ"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

Đối với cư dân không còn hộ hiện tại, `householdId`, `householdCode` và quan hệ với chủ hộ hiện tại có thể là `null`, tùy mô hình dữ liệu đã chốt.

### 5.5. Trường hợp không có kết quả

Trả `200 OK` với danh sách rỗng.

Frontend hiển thị: **“Không tìm thấy cư dân phù hợp.”**

## 6. API xem chi tiết cư dân

### 6.1. Phương thức và đường dẫn

```http
GET /api/residents/{residentId}
```

### 6.2. Tham số đường dẫn

| Tham số | Kiểu dữ liệu | Quy tắc |
|---|---|---|
| `residentId` | Số nguyên | ID nội bộ của cư dân; phải lớn hơn `0` |

### 6.3. Quy tắc xử lý

1. Kiểm tra phiên đăng nhập và quyền tra cứu.
2. Kiểm tra định dạng ID.
3. Tìm hồ sơ cư dân.
4. Lấy thông tin hộ hiện tại nếu có.
5. Trả hồ sơ theo DTO, không trả trực tiếp toàn bộ Entity.

### 6.4. Phản hồi thành công

```http
200 OK
```

```json
{
  "id": 501,
  "residentCode": "CD-001",
  "fullName": "Nguyễn Văn An",
  "relationshipToHead": "Chủ hộ",
  "household": {
    "id": 101,
    "householdCode": "HO-001",
    "apartmentCode": "A1201"
  }
}
```

Nếu cư dân không còn hộ hiện tại, `household` và quan hệ với chủ hộ hiện tại có thể là `null`. Hồ sơ và lịch sử cư trú vẫn được giữ lại.

Các trường hồ sơ bổ sung chỉ được trả sau khi đã thống nhất với thiết kế US-05 và ERD.

API không trả mật khẩu, mã phiên hoặc thông tin xác thực.

### 6.5. Không tìm thấy cư dân

```http
404 Not Found
```

```json
{
  "code": "RESIDENT_NOT_FOUND",
  "message": "Không tìm thấy hồ sơ cư dân.",
  "fieldErrors": {}
}
```

## 7. API tra cứu lịch sử biến động

### 7.1. Phương thức và đường dẫn

Tra cứu theo cư dân:

```http
GET /api/residents/{residentId}/residence-history
```

Tra cứu theo hộ gia đình:

```http
GET /api/households/{householdId}/residence-history
```

Hai endpoint sử dụng chung quy ước bộ lọc và phân trang.

### 7.2. Tham số truy vấn

| Tham số | Kiểu dữ liệu | Bắt buộc | Ý nghĩa |
|---|---|---|---|
| `eventType` | Chuỗi | Không | Loại biến động cần tra cứu |
| `fromDate` | Ngày | Không | Ngày bắt đầu khoảng tra cứu |
| `toDate` | Ngày | Không | Ngày kết thúc khoảng tra cứu |
| `page` | Số nguyên | Không | Chỉ số trang |
| `size` | Số nguyên | Không | Số bản ghi mỗi trang |

### 7.3. Loại biến động

| Giá trị đề xuất | Ý nghĩa |
|---|---|
| `MOVE_IN` | Chuyển đến |
| `MOVE_OUT` | Chuyển đi |
| `TEMPORARY_RESIDENCE` | Tạm trú |
| `TEMPORARY_ABSENCE` | Tạm vắng |

Các mã này phải được thống nhất với API ghi nhận biến động của US-06 và US-07.

### 7.4. Quy tắc lọc thời gian

- `fromDate` và `toDate` bao gồm cả ngày bắt đầu và ngày kết thúc.
- Nếu cùng truyền hai ngày, `fromDate` phải nhỏ hơn hoặc bằng `toDate`.
- Nếu chỉ truyền `fromDate`, không giới hạn phía ngày kết thúc.
- Nếu chỉ truyền `toDate`, không giới hạn phía ngày bắt đầu.
- Nếu không truyền cả hai, không lọc theo thời gian.
- Chuyển đến và chuyển đi được lọc theo ngày hiệu lực.
- Tạm trú và tạm vắng được lọc theo khoảng thời gian có giao với khoảng tra cứu.
- Ngày kết thúc chưa được xác định được xử lý như khoảng thời gian chưa có điểm kết thúc, theo quy tắc dữ liệu của US-07.

Ví dụ: một lần tạm vắng từ `2026-11-10` đến `2026-11-20` vẫn xuất hiện khi tra cứu từ `2026-11-14` đến `2026-11-15`.

### 7.5. Ví dụ request

Theo cư dân:

```http
GET /api/residents/501/residence-history?fromDate=2026-11-01&toDate=2026-11-30&page=0&size=20
```

Theo hộ và loại biến động:

```http
GET /api/households/101/residence-history?eventType=MOVE_IN&page=0&size=20
```

### 7.6. Quy tắc xử lý

1. Kiểm tra phiên đăng nhập và quyền tra cứu.
2. Kiểm tra ID hộ hoặc cư dân.
3. Kiểm tra đối tượng được tra cứu tồn tại.
4. Kiểm tra loại biến động, ngày và tham số phân trang.
5. Truy vấn các sự kiện liên quan đến đối tượng.
6. Áp dụng bộ lọc.
7. Sắp xếp theo ngày hiệu lực giảm dần và sử dụng tiêu chí phụ ổn định.
8. Trả dữ liệu theo DTO lịch sử thống nhất.

Lịch sử theo hộ phải bao gồm các sự kiện liên quan đến hộ đó, kể cả của cư dân hiện đã chuyển đi.

Thông tin hộ của từng sự kiện phải phản ánh hộ liên quan tại thời điểm biến động. Không lấy hộ hiện tại của cư dân để thay thế cho hộ trong các sự kiện trước đây.

### 7.7. Phản hồi thành công

```http
200 OK
```

```json
{
  "items": [
    {
      "eventId": 9002,
      "eventType": "TEMPORARY_ABSENCE",
      "residentId": 501,
      "residentCode": "CD-001",
      "fullName": "Nguyễn Văn An",
      "householdId": 101,
      "householdCode": "HO-001",
      "effectiveDate": "2026-11-12",
      "endDate": "2026-11-15"
    },
    {
      "eventId": 9001,
      "eventType": "MOVE_IN",
      "residentId": 501,
      "residentCode": "CD-001",
      "fullName": "Nguyễn Văn An",
      "householdId": 101,
      "householdCode": "HO-001",
      "effectiveDate": "2026-11-10",
      "endDate": null
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 2,
  "totalPages": 1
}
```

### 7.8. Ý nghĩa các trường lịch sử

| Trường | Ý nghĩa |
|---|---|
| `eventId` | ID của sự kiện trong nguồn dữ liệu tương ứng |
| `eventType` | Loại biến động |
| `residentId` | ID cư dân liên quan |
| `residentCode` | Mã cư dân |
| `fullName` | Họ và tên cư dân |
| `householdId` | ID hộ liên quan đến sự kiện |
| `householdCode` | Mã hộ liên quan đến sự kiện |
| `effectiveDate` | Ngày hiệu lực hoặc ngày bắt đầu |
| `endDate` | Ngày kết thúc đối với sự kiện có khoảng thời gian |

Nếu các loại biến động nằm trong những bảng khác nhau, `eventId` có thể không duy nhất trên toàn bộ danh sách. Khi đó, sử dụng cặp **`eventType` và `eventId`** để nhận diện bản ghi.

DTO này không yêu cầu cơ sở dữ liệu phải lưu tất cả loại biến động trong cùng một bảng.

### 7.9. Phân biệt lịch sử cư trú và nhật ký hệ thống

| Nội dung | Lịch sử cư trú | Nhật ký hệ thống |
|---|---|---|
| Mục đích | Theo dõi biến động cư trú | Theo dõi thao tác trên dữ liệu |
| Ví dụ | Chuyển đến, chuyển đi, tạm trú, tạm vắng | Người dùng sửa số điện thoại của hộ |
| Thời gian chính | Ngày hiệu lực nghiệp vụ | Thời điểm thực hiện thao tác |
| Phạm vi API này | Có | Không |

### 7.10. Trường hợp không có lịch sử

Nếu hộ hoặc cư dân tồn tại nhưng chưa có lịch sử phù hợp, trả `200 OK` với `items: []`.

Nếu hộ hoặc cư dân không tồn tại, trả `404` với mã lỗi tương ứng.

## 8. Tổng hợp mã lỗi

| HTTP | Mã lỗi | Tình huống |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Sai định dạng ID, ngày, phân trang hoặc loại biến động |
| `401` | `UNAUTHENTICATED` | Chưa đăng nhập hoặc phiên không hợp lệ |
| `403` | `FORBIDDEN` | Không có quyền tra cứu |
| `404` | `HOUSEHOLD_NOT_FOUND` | Không tìm thấy hộ khi xem chi tiết hoặc lịch sử theo hộ |
| `404` | `RESIDENT_NOT_FOUND` | Không tìm thấy cư dân khi xem chi tiết hoặc lịch sử theo cư dân |
| `500` | `INTERNAL_ERROR` | Lỗi ngoài dự kiến |

Không sử dụng `404` cho danh sách tìm kiếm không có kết quả.

## 9. Yêu cầu triển khai

### 9.1. Tổ chức xử lý

- **Controller:** tiếp nhận và kiểm tra định dạng tham số; trả HTTP response.
- **Service:** áp dụng quy tắc tra cứu, kiểm tra đối tượng và điều phối dữ liệu.
- **Repository:** truy vấn cơ sở dữ liệu theo bộ lọc và phân trang.
- **DTO:** giới hạn các trường dữ liệu trả về theo hợp đồng API.

### 9.2. Dữ liệu và hiệu năng

- Thực hiện phân trang tại cơ sở dữ liệu, không tải toàn bộ dữ liệu rồi chia trang trong bộ nhớ.
- Đánh giá chỉ mục trên mã hộ, mã cư dân, khóa liên kết và ngày hiệu lực dựa trên truy vấn thực tế.
- Kiểm tra số lượng truy vấn khi tải danh sách và thành viên để tránh phát sinh truy vấn lặp không cần thiết.
- Đo hiệu năng theo bộ dữ liệu, số người dùng đồng thời và môi trường đã thống nhất trong NFR-004.
- Không xác nhận đạt NFR-004 khi chưa có kết quả kiểm thử.

### 9.3. Bảo vệ dữ liệu

- Chỉ trả dữ liệu cần thiết cho chức năng tra cứu.
- Không trả trực tiếp toàn bộ Entity hoặc các quan hệ ngoài phạm vi.
- Không ghi toàn bộ hồ sơ cá nhân vào log kỹ thuật nếu không cần thiết.
- Backend phải bảo đảm các bộ lọc không vượt qua giới hạn quyền truy cập đã được cấu hình.

## 10. Tình huống kiểm thử

| Mã | Tình huống | Kết quả mong đợi |
|---|---|---|
| SEARCH-01 | Tìm hộ theo mã hộ | Trả đúng kết quả phù hợp |
| SEARCH-02 | Tìm hộ theo tên chủ hộ | Áp dụng đúng quy tắc tìm kiếm |
| SEARCH-03 | Lọc hộ theo mã căn hộ | Chỉ trả hộ thuộc căn hộ được chọn |
| SEARCH-04 | Kết hợp từ khóa và căn hộ | Chỉ trả kết quả thỏa cả hai bộ lọc |
| SEARCH-05 | Tìm cư dân theo mã hoặc họ tên | Trả đúng danh sách |
| SEARCH-06 | Lọc cư dân theo hộ hiện tại | Không lẫn thành viên đã chuyển khỏi hộ |
| SEARCH-07 | Tìm kiếm không có kết quả | Trả `200` và danh sách rỗng |
| SEARCH-08 | Xem hộ không tồn tại | Trả `404 HOUSEHOLD_NOT_FOUND` |
| SEARCH-09 | Xem cư dân không tồn tại | Trả `404 RESIDENT_NOT_FOUND` |
| SEARCH-10 | Hộ chưa có thành viên | Trả `members: []` |
| SEARCH-11 | `page` âm hoặc `size` ngoài giới hạn | Trả `400` |
| SEARCH-12 | Trang vượt quá số trang hiện có | Trả `200`, danh sách rỗng và tổng số đúng |
| SEARCH-13 | Ngày không đúng định dạng | Trả `400`, chỉ rõ trường lỗi |
| SEARCH-14 | `fromDate` lớn hơn `toDate` | Trả `400` |
| SEARCH-15 | Khoảng tạm trú/tạm vắng giao với khoảng tra cứu | Sự kiện được đưa vào kết quả |
| SEARCH-16 | Lọc đúng ngày bắt đầu hoặc kết thúc | Kết quả tuân theo quy tắc bao gồm hai đầu mút |
| SEARCH-17 | Cư dân đã chuyển hộ | Lịch sử vẫn gắn đúng hộ của từng sự kiện |
| SEARCH-18 | Đối tượng tồn tại nhưng không có lịch sử | Trả `200`, danh sách rỗng |
| SEARCH-19 | Chưa đăng nhập hoặc phiên hết hiệu lực | Trả `401` |
| SEARCH-20 | Đăng nhập nhưng thiếu quyền | Trả `403` |
| SEARCH-21 | Dữ liệu tiếng Việt có dấu | Lưu chuyển và hiển thị chính xác |
| SEARCH-22 | Gọi các API tra cứu | Không thay đổi dữ liệu nghiệp vụ |

## 11. Đối chiếu chức năng với US-15

| Nhu cầu | Endpoint |
|---|---|
| Tra cứu danh sách hộ gia đình | `GET /api/households` |
| Xem chi tiết hộ và thành viên hiện tại | `GET /api/households/{householdId}` |
| Tra cứu danh sách cư dân | `GET /api/residents` |
| Xem chi tiết cư dân | `GET /api/residents/{residentId}` |
| Tra cứu lịch sử theo hộ | `GET /api/households/{householdId}/residence-history` |
| Tra cứu lịch sử theo cư dân | `GET /api/residents/{residentId}/residence-history` |

## 12. Nội dung cần thống nhất trước khi triển khai

1. Cách biểu diễn căn hộ và chủ hộ trong ERD và DTO.
2. Cách xác định hộ hiện tại và thành viên hiện tại sau biến động cư trú.
3. Danh mục loại biến động và cấu trúc dữ liệu lịch sử của US-06, US-07.
4. Quy tắc tìm kiếm có hoặc không phân biệt dấu tiếng Việt.
5. Giới hạn độ dài từ khóa và các tham số văn bản.
6. Mã quyền tra cứu và cách gán quyền cho từng vai trò.
7. Các trường hồ sơ bổ sung được phép trả về theo yêu cầu đã thống nhất.

Tài liệu ghi nhận thiết kế API, chưa xác nhận các endpoint đã được triển khai hoặc kiểm thử hoàn tất.
