# API 01 — Bước 5: Schema Analysis

- **API:** `PUT /api/users/me` — FR-04 — Pool A; MSSV 23120274.
- **Skill:** [api-test-generator](../../.agents/skills/api-test-generator/SKILL.md), mục 4, Bước 5; bổ sung phân tích request schema theo yêu cầu sinh viên.
- **Phạm vi:** phân tích hợp đồng và checkpoint; chưa viết JSON Schema/OpenAPI, assertion thực thi hoặc test case hoàn chỉnh.
- **Trạng thái:** kết quả AI chờ review. Chưa phân tích implementation, thực thi API, tạo response thực nghiệm hoặc thực hiện bước 6. Các TBD ở bước trước tiếp tục được giữ mở.

## 1. Nguồn và phân loại căn cứ

| Ký hiệu | Nguồn | Phần liên quan |
| --- | --- | --- |
| A | [Đặc tả API](../../specs/api_specification.md), §2–2.2 | Bearer, endpoint, JSON request minh họa; không có response của PUT |
| R | [Yêu cầu SUT](../../eshop-sut/README.md), FR-04; SEC-02/06 | Thông tin được cập nhật, phone, chủ sở hữu và role |
| C | [Bước 1](01-contract-analysis.md), mục 2–7 | Hợp đồng, kiểu minh họa, response thiếu và GAP-01–GAP-09 |
| D | [Bước 2](02-domain-analysis.md) | Domain/BVA và miền chưa đủ đặc tả |
| S | [Bước 3](03-state-analysis.md), mục 3–6 | Hậu điều kiện và bất biến, tách khỏi schema |
| Q | [Bước 4](04-security-analysis.md), mục 2, 4–9 | Security oracle, giới hạn bằng chứng và chống đếm trùng |
| G | [AGENTS.md](../../AGENTS.md) | Phạm vi, audit, review và giới hạn Git |

Quy ước:
- **Được đặc tả:** nội dung A/R nêu trực tiếp; chỉ áp dụng đúng phạm vi câu mô tả.
- **Minh họa:** thuộc tính quan sát được trong mẫu, không chứng minh mọi request/response hợp lệ có cùng cấu trúc hoặc kiểu.
- **TBD:** chưa có căn cứ cho assertion cứng. Không lấy HTTP convention, tên method, framework hoặc response API khác để lấp chỗ trống.
- **Checkpoint nghiệp vụ:** oracle về dữ liệu/quyền, không tự là assertion cấu trúc JSON.
- Tất cả phân tích/đề xuất checkpoint dưới đây do AI tổng hợp từ tài liệu; không phải hành vi code hoặc bằng chứng thực thi.

**Kết luận cốt lõi:** A §2.2 có body JSON minh họa nhưng **không có success response hoặc error response**, kể cả ví dụ. Chưa đủ căn cứ tạo schema response hoàn chỉnh hoặc khẳng định exact match. R FR-04 bổ sung quy tắc nghiệp vụ, không bổ sung hợp đồng JSON response.

## 2. Request schema: phần có căn cứ và phần minh họa

### 2.1. Operation, header và bao gói request

| Schema ID | Thành phần request | Nội dung có căn cứ | Phân loại | Phần TBD/truy vết |
| --- | --- | --- | --- | --- |
| SC-REQ-01 | Method/path | `PUT /api/users/me`; không khai báo path parameter | Được đặc tả — A §2.2 | Không tự thêm id vào route; C mục 2 |
| SC-REQ-02 | Query | A không liệt kê query parameter cho operation | Không có tham số được khai báo | Không suy ra query dư bị cấm hoặc chắc chắn bỏ qua; D DP-QUERY-01/02 |
| SC-REQ-03 | Authorization | Header `Authorization: Bearer <token>`; JWT hợp lệ | Được đặc tả — A §2; R SEC-02 | Không có schema claim, thuật toán, TTL hoặc token length; D DP-AUTH-01–08; C GAP-05 |
| SC-REQ-04 | Body format | A ghi “Body (JSON)” | Được đặc tả về định dạng | Cú pháp JSON hỏng không phải JSON hợp lệ; parser/error/status không được nêu; D DP-BODY-04 |
| SC-REQ-05 | Top-level body | Mẫu A là object có ba key name/shipping_address/phone | **Minh họa**, không có formal request schema | Chưa đủ để assert mọi array/scalar/null phải bị từ chối; D DP-BODY-01/03 |
| SC-REQ-06 | Body required, empty object và partial update | Không nêu required body, minProperties hoặc danh sách required field | TBD | Không tự đặt phải có đủ ba field, ít nhất một field hoặc PUT full replacement; C GAP-01; D DP-BODY-02/05 |
| SC-REQ-07 | Content-Type request | A mô tả JSON body, không khai báo header Content-Type bắt buộc | JSON body được đặc tả; exact media type policy TBD | Không tự đặt status cho thiếu/khác media type hoặc charset; D DP-HDR-01/02 |
| SC-REQ-08 | Additional properties/duplicate keys | Không có whitelist formal, additionalProperties hoặc xử lý khóa lặp | TBD | Không tự đặt additionalProperties=false, thứ tự ưu tiên khóa hoặc min/max số field; C GAP-04/06; D DP-EXTRA-01/DP-BODY-06 |
| SC-REQ-09 | Giới hạn kích thước | Không có body/header size limit hoặc max nesting trong nguồn | TBD | Không tự đặt biên payload/độ sâu hoặc SLA; D mục 5.2 |

“Không khai báo query/path parameter” là ghi nhận tài liệu, không phải một assertion cấm mọi đầu vào dư.

### 2.2. Trường body và kiểu dữ liệu

| Schema ID | Trường | Mẫu/kiểu trong ví dụ A | Ràng buộc được đặc tả | Required/optional, nullable và phần còn thiếu |
| --- | --- | --- | --- | --- |
| SC-FIELD-01 | name | `"Nguyen Van A"`, JSON string | Là Họ Tên được cập nhật theo FR-04 | Required/optional, nullable, kiểu chặt/ép kiểu, min/max length, pattern, trim và Unicode: TBD. Không áp required của đăng ký FR-01 |
| SC-FIELD-02 | shipping_address | `"123 Le Loi, Q1, TP.HCM"`, JSON string | Là Địa chỉ giao hàng mặc định được cập nhật theo FR-04 | Required/optional, nullable, kiểu chặt, độ dài, cấu trúc/format địa chỉ và normalization: TBD |
| SC-FIELD-03 | phone | `"0912345678"`, JSON string giữ số 0 đầu | FR-04: phone hợp lệ bắt đầu 0, từ 10–11 chữ số | Required/optional, nullable, ép kiểu, Unicode digit set, trim/normalization: TBD. Không tự chốt JSON Schema type=string cho mọi giá trị được API nhận |
| SC-FIELD-04 | role ngoài mẫu | Không có trong body mẫu | SEC-06/FR-04: client không được thay role | Đây là **bất biến quyền**, không đủ để đặt role thành field schema bị cấm tuyệt đối hoặc kết luận request có role phải bị từ chối. Reject/ignore, nullable/type policy: TBD |
| SC-FIELD-05 | email ngoài mẫu | Không có trong body mẫu | FR-04: không đổi email qua giao diện | Không đủ căn cứ assert field email readOnly/forbidden ở API hoặc gán format=email cho request PUT; C GAP-04 |
| SC-FIELD-06 | id/user_id/field dư | Không có trong body mẫu | FR-04: chỉ sửa hồ sơ chính mình | Không biết kiểu/required/format cho field không được hỗ trợ đã xác nhận. Bất biến chủ thể không tự thành additionalProperties=false |

Nguồn các dòng SC-FIELD-01–03: A §2.2 và R FR-04; SC-FIELD-04–06: A §2.2, R FR-04/SEC-06; các giới hạn từ C GAP-01–04/06 và D.

Phone có giới hạn nghiệp vụ 10–11 **chữ số**, nhưng chưa có bộ chữ số hoặc cơ chế normalization đầy đủ. BVA 9/10/11/12 tại D dùng chuỗi ASCII để phân biệt độ dài. Không biến lựa chọn đại diện này thành regex ASCII bắt buộc; không bổ sung regex JSON Schema hoặc quy tắc đầu số nhà mạng.

### 2.3. Dữ liệu minh họa nguyên bản

Mẫu của A §2.2, không phải schema hoặc request đã thực thi:

```json
{
  "name": "Nguyen Van A",
  "shipping_address": "123 Le Loi, Q1, TP.HCM",
  "phone": "0912345678"
}
```

Mẫu không chứng minh: field bắt buộc, null bị cấm, additionalProperties=false, thứ tự key, giá trị cố định/enum, giới hạn length của name/address hoặc kiểu nghiêm ngặt toàn miền. Thiếu một key, null và chuỗi rỗng là ba hình thức khác nhau đã phân tích ở D; không hợp nhất thành một lỗi schema mặc định.

## 3. Success response schema

Bảng theo đầu ra Bước 5 của Skill. Các dòng mô tả **checkpoint cần xác định**, không phải assertion đã đủ căn cứ để chạy.

| Schema ID | Loại response | Assertion/checkpoint cần xác định | Nguồn | Trạng thái xác định/TBD |
| --- | --- | --- | --- | --- |
| SC-SUC-01 | Success | HTTP status chính xác và cách nhận diện success | A §2.2 không nêu | **TBD**; không mượn status từ login/register hoặc suy từ PUT |
| SC-SUC-02 | Success | Content-Type, charset và body có/không | A §2.2 không nêu | **TBD**; không mặc định response JSON hoặc luôn có body |
| SC-SUC-03 | Success | Top-level object/array/scalar, envelope hoặc lồng trường | Không có response mẫu trong A | **TBD**; không tự tạo cấu trúc user/data/message/success |
| SC-SUC-04 | Success | Tên field và required fields | Không có response contract | **TBD**; không bắt response trả lại name/phone/address hoặc id |
| SC-SUC-05 | Success | Kiểu từng field, nested schema, array items | Không có response contract | **TBD**; kiểu string của request sample không xác định kiểu response |
| SC-SUC-06 | Success | Enum, format, pattern, min/max length/value và nullability | R FR-04 chỉ có quy tắc dữ liệu phone, không nêu ánh xạ response | **TBD** về schema response. Không áp giới hạn phone vào field JSON chưa được định danh |
| SC-SUC-07 | Success | Additional properties, số field và exact set of keys | Không có response contract | **TBD**; không assert exact match hoặc cấm field ngoài danh sách tự đặt |
| SC-SUC-08 | Success | Quan hệ response với dữ liệu gửi/lưu, echo hoặc dữ liệu canonical | A §2.2; C GAP-02/08; S POST-01 | **TBD** về response; hậu điều kiện cập nhật có căn cứ nhưng phải quan sát dữ liệu thích hợp |
| SC-SUC-09 | Success | Các field role/email/token/password có xuất hiện hay không | A không mô tả response PUT; Q SA-OBS-01 | **TBD** về danh sách field. Không suy từ SEC-01 rằng đã xác định schema cấm password; mọi quan sát nhạy cảm cần căn cứ riêng và không đưa credential vào báo cáo |

**Không có assertion cấu trúc success response vô điều kiện đủ căn cứ ở tài liệu hiện có.** Điều đó phản ánh thiếu hợp đồng, không phải API có thể trả tùy ý mà đã được xác nhận đúng.

## 4. Error response schema

R quy định điều kiện được phép cập nhật, nhưng không mô tả error envelope, error code hoặc status của endpoint.

| Schema ID | Loại response | Assertion/checkpoint cần xác định | Nguồn | Trạng thái xác định/TBD |
| --- | --- | --- | --- | --- |
| SC-ERR-01 | Lỗi xác thực | Status/Content-Type/body khi thiếu hoặc JWT không hợp lệ | A §2; R SEC-02; D DP-AUTH-02–05 | **TBD về schema/status**; bất biến không cập nhật trái phép giữ nguyên |
| SC-ERR-02 | Lỗi quyền chủ thể | Status/envelope/code/message khi client định sửa user khác | R FR-04; Q SA-IDOR-01/02 | **TBD**; trường định danh dư có thể bị ignore/reject theo policy chưa nêu |
| SC-ERR-03 | Role ngoài mẫu | Có error response hay không; kiểu và cấu trúc nếu có | R SEC-06; Q SA-ROLE-01/02 | **TBD**; có thể role bị bỏ qua hoặc request bị từ chối, không tự chọn một cách |
| SC-ERR-04 | Phone sai điều kiện | Status, message, chi tiết validation và phản hồi theo field | R FR-04; D DP-PHONE-03–07 | **TBD**; phone nguyên dạng sai điều kiện không tự xác định error contract |
| SC-ERR-05 | Body/field thiếu/null/sai kiểu | Có lỗi hay không và error schema | C GAP-01–03; D DP-BODY-02/03/05 | **TBD** vì nhiều miền chưa có quy tắc API |
| SC-ERR-06 | Malformed JSON/media type | Status, có body, Content-Type và cấu trúc parse error | A §2.2 chỉ nêu JSON body; D DP-BODY-04/DP-HDR-02 | **TBD**; không dùng mặc định Express/framework khi chưa phân tích implementation |
| SC-ERR-07 | Tất cả nhánh lỗi nếu có | Top-level, required field, types, enum, nullability, additionalProperties, cấu trúc nested | Không có error sample/schema trong A | **TBD**; không tự thêm error/message/errors/code hoặc danh sách lỗi theo field |
| SC-ERR-08 | Nhiều yếu tố sai cùng lúc | Thứ tự ưu tiên lỗi, số lỗi và cấu trúc tổng hợp | C GAP-06; D DP-BODY-06 | **TBD**; không suy ra fail-fast hoặc trả tất cả lỗi |
| SC-ERR-09 | Lỗi và dữ liệu sau thao tác | Response lỗi có chứng minh dữ liệu/quyền không đổi không? | S ST-DATA-03/04/12; Q mục 7 | **Không đủ chỉ từ response**. Không cập nhật trái phép/role không đổi có oracle riêng; rollback mọi field với mọi lỗi chưa đặc tả |

Không đặt thông điệp lỗi chính xác hoặc một schema lỗi dùng chung cho mọi nhánh. Không suy từ thông báo lỗi thích hợp của chức năng khác thành error contract của PUT hồ sơ.

## 5. Checkpoint để kiểm tra response và hậu điều kiện

Phân biệt **ghi nhận bằng chứng**, **assertion schema đang TBD** và **oracle nghiệp vụ đã có căn cứ**. Đây chưa phải test script hoặc test case.

| Checkpoint ID | Nội dung quan sát/kiểm tra | Mức độ sử dụng hiện tại | Truy vết/giới hạn |
| --- | --- | --- | --- |
| CP-OBS-01 | Ghi nhận status, header, body thô và tương quan request khi được phép thực thi | Có thể dùng làm kế hoạch thu thập bằng chứng; **không có expected status/schema để PASS/FAIL** | SC-SUC-01/02; SC-ERR-01–08; không lưu token/credential thật |
| CP-OBS-02 | Nếu response tự khai báo media type JSON, ghi nhận việc body có parse được thành JSON hay không | **Quan sát có điều kiện**, không khẳng định SUT bắt buộc trả JSON; chưa đặt assertion hợp đồng | SC-SUC-02/03; SC-ERR-06/07. Response rỗng chưa mặc định sai |
| CP-OBS-03 | Nếu parse được JSON, liệt kê key, kiểu, null/nested structure thực tế | Chỉ mô tả bằng chứng tương lai; **không dùng mẫu runtime để tự tạo schema chuẩn** | SC-SUC-04–07; SC-ERR-07; chưa thực thi |
| CP-SCHEMA-01 | So status, Content-Type, body presence với contract của từng nhánh | **TBD/chưa bật assertion cứng** | Chờ làm rõ SC-SUC-01/02 và SC-ERR; không chấp nhận mọi status bằng assertion quá rộng để làm PASS |
| CP-SCHEMA-02 | So required/type/enum/format/nullability/additionalProperties và exact keys | **TBD/chưa đủ căn cứ** | SC-SUC-03–07; SC-ERR-07. Không tự điền schema từ request sample |
| CP-DATA-01 | Dữ liệu được cập nhật phản ánh field cơ bản được chấp nhận của đúng user | Oracle nghiệp vụ có căn cứ **có điều kiện quan sát** | S POST-01/ST-DATA-01; Q SA-AUTH-01. Không bắt PUT response echo field; có thể cần GET/nguồn dữ liệu được phép |
| CP-AUTH-01 | Request không có JWT hợp lệ không cập nhật hồ sơ trái phép | Oracle nghiệp vụ có căn cứ; response đơn lẻ chưa đủ | S INV-03/ST-DATA-04; Q SA-AUTH-02–04; không gắn status tự đặt |
| CP-OWNER-01 | Request xác thực là U1 không sửa hồ sơ U2 | Oracle quyền có căn cứ; cần snapshot U2 riêng | S INV-01; Q SA-IDOR-01/02. Response chứa ID không thay thế dữ liệu thực |
| CP-ROLE-01 | Role thực tế không đổi qua cập nhật hồ sơ | Oracle quyền có căn cứ; cần nguồn quan sát quyền/role | S INV-02; Q SA-ROLE-01/02. Field role được echo hoặc token cũ chưa đủ bằng chứng |
| CP-PHONE-01 | Áp điều kiện phone FR-04 lên giá trị hồ sơ đã xác định được | Oracle dữ liệu có căn cứ; **ánh xạ vị trí response và normalization còn TBD** | S INV-04; D DP-PHONE/BVA-PHONE; không tự assert phone tồn tại ở root PUT response |

CP-DATA/AUTH/OWNER/ROLE/PHONE được dẫn lại để tránh nhầm “response có đúng cấu trúc” với “tác vụ đúng nghiệp vụ”. Chúng **không bổ sung schema response đã xác định**, không được đếm thêm case chỉ vì đặt tên checkpoint ở bước 5.

Không thêm latency/SLA, timestamp, version, sorting, key order hoặc exact message chưa có nguồn.

## 6. Truy vết và tránh trùng lặp

| Nội dung bước 5 | Nguồn phân tích trước | Cách tái sử dụng |
| --- | --- | --- |
| Field name/address, thiếu/null/rỗng/kiểu và độ dài | C GAP-01/02; D DP-NAME-01–06, DP-ADDR-01–06 | D đã phân loại miền TBD; không tạo thêm case lỗi schema bắt buộc |
| Phone và biên 10–11 chữ số | D DP-PHONE-01–12, BVA-PHONE-01–04; S INV-04 | Giữ cùng miền/biên; không sao chép mỗi validation thành một “schema case” riêng |
| JWT/header | D DP-AUTH-01–08, DP-HDR-01/02; Q SA-AUTH-01–05 | Điều kiện xác thực không xác định status hoặc error envelope |
| Role và field dư | D DP-ROLE-01–04, DP-EMAIL-01, DP-ID-01/02, DP-EXTRA-01; Q SA-ROLE-01/SA-MASS-01 | Bất biến role/quyền tách khỏi additionalProperties và error schema |
| Top-level/malformed/body thiếu hoặc partial | D DP-BODY-01–06; S ST-DATA-06/07/12 | Không gán shape/type chặt hoặc rollback từ mẫu object |
| Hồ sơ trước/sau, chủ sở hữu và role | S INV-01–04, POST-01; Q mục 7 | Dùng checkpoint nghiệp vụ sẵn có; chưa có schema PUT/GET để assert field cụ thể |
| Exact response match và dữ liệu nhạy cảm | C GAP-07/08; Q SA-OBS-01 | Giữ chờ làm rõ, không suy ra schema từ runtime hoặc logic bảo mật |
| UI, query parameterization, OTP/password | C GAP-09; Q mục 2/6/7 | Không biến SEC-04/05/01/07 thành assertion JSON có thể chứng minh mọi thứ |

Mỗi test case ở giai đoạn sau có thể có nhiều checkpoint tương thích, nhưng một checkpoint không được tính thành một test case độc lập. Các mục TBD không được tính là assertion/case sẵn sàng có oracle đầy đủ. Không tuyên bố đã đủ ≥35 case hay coverage schema hoàn chỉnh.

## 7. Nội dung cần làm rõ trước khi đặt assertion schema

1. Request: body/field required, kiểu được chấp nhận chặt, nullable, empty strings, full/partial update, additionalProperties và duplicate-key policy.
2. Phone: chuẩn hóa và bộ chữ số; cách biểu diễn JSON được chấp nhận. Không thay thế bằng regex do AI tự đặt.
3. Success: mã HTTP, có body hay không, Content-Type, envelope, field names, required/types, enum/format/nullable và chính sách field dư.
4. Error: nhánh nào trả lỗi, status từng nhánh, Content-Type/body presence, error envelope, trường bắt buộc/kiểu/message policy và thứ tự lỗi.
5. Quan sát hậu điều kiện: GET /me có field nào, role có quan sát được không, dữ liệu nào canonical và thời điểm nhất quán đọc lại.
6. Chuẩn exact match cần schema có căn cứ được xác nhận; không biến “chưa có hợp đồng” thành “schema rỗng cho phép tất cả” để đánh PASS.

Không có mẫu response PUT nào để so sánh hình dạng ở thời điểm phân tích. Chưa đọc implementation hoặc chạy API để điền các điểm thiếu. Không sửa nội dung/hạn chế ở các bước trước.

**Điểm dừng:** đã hoàn thành Bước 5 ở mức phân tích request/success/error schema, checkpoint và truy vết. Chỉ tạo tài liệu này và ghi nối tiếp AI Audit; chưa sinh test case hoàn chỉnh, chưa thực thi API, chưa phân tích implementation hoặc bước 6. Chờ sinh viên review.

