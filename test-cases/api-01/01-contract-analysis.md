# API 01 — Bước 1: Phân tích hợp đồng API

- **API mục tiêu:** `PUT /api/users/me`.
- **Feature:** FR-04 — Quản lý hồ sơ cá nhân; Pool A; MSSV 23120274.
- **Skill áp dụng:** [api-test-generator](../../.agents/skills/api-test-generator/SKILL.md), mục 4, **Bước 1 — Phân tích hợp đồng API**.
- **Trạng thái:** kết quả phân tích của AI, chờ sinh viên review. Chỉ thực hiện bước 1; chưa phân tích implementation, chưa phân hoạch miền/biên, chưa lập bảng chuyển trạng thái, chưa thiết kế tình huống bảo mật/schema hay sinh test case.
- **Mục tiêu dài hạn:** ít nhất 35 test case có ý nghĩa cho API này theo yêu cầu HW06. Chưa có bộ case để đếm hoặc xác nhận đạt mục tiêu.

## 1. Nguồn và nguyên tắc đọc hợp đồng

| Ký hiệu | Tài liệu | Phần sử dụng |
| --- | --- | --- |
| A | [specs/api_specification.md](../../specs/api_specification.md) | Base URL; §1.1/1.2 về API hỗ trợ; §2, đặc biệt §2.1–2.2, dòng 57–74 |
| R | [eshop-sut/README.md](../../eshop-sut/README.md) | FR-02 về JWT; FR-04, dòng 62–68; mục 9, SEC-01–SEC-07, dòng 278–284 |
| G | [AGENTS.md](../../AGENTS.md) | Phạm vi công việc, human review, audit, không suy diễn và giới hạn Git |

- **Đặc tả:** nội dung có nguồn A/R, ghi rõ phạm vi API hay UI.
- **Nhận định AI:** ánh xạ yêu cầu, diễn giải tiền/hậu điều kiện và đề xuất API hỗ trợ; không tự trở thành yêu cầu mới.
- **TBD:** tài liệu chưa xác định đủ để đặt oracle cụ thể. Không dùng convention HTTP, ý nghĩa thông thường của PUT hay ví dụ JSON để điền thay đặc tả.
- **Hành vi implementation:** chưa khảo sát; không đọc server, middleware, database hoặc frontend code trong bước này.
- **Kết quả thực nghiệm:** chưa gửi request hoặc thao tác dữ liệu; không có PASS/FAIL, bug hay bằng chứng thực thi.
- **Giả định bổ sung:** chưa chốt giả định nào để lấp khoảng trống hợp đồng.

## 2. Nhận diện operation

| Tham số/quy tắc | Vị trí | Ràng buộc | Nguồn | Khoảng trống |
| --- | --- | --- | --- | --- |
| Base URL | URL | Tài liệu ghi `http://localhost:3000` | A, phần mở đầu | Chưa kiểm tra server có chạy hoặc deployment thực tế |
| HTTP method | Request line | `PUT` | A §2.2 | Không tự suy ra full replacement hoặc idempotency chi tiết từ tên method |
| Endpoint | Request path | `/api/users/me` | A §2.2 | Không có biến path được khai báo; không tự thêm `:id` |
| Feature và tác vụ | Nghiệp vụ | Cập nhật thông tin cá nhân cơ bản của người dùng đã đăng nhập | A §2.2; R FR-04 | Không có định nghĩa đầy đủ “cơ bản” ngoài ba trường được nêu |
| Path parameters | Path | Không có path parameter được tài liệu khai báo cho operation này | A §2.2 | Hành vi với path khác không thuộc hợp đồng operation hiện tại |
| Query parameters | Query | Không có query parameter được tài liệu khai báo | A §2.2 | Không có chính sách xử lý query dư; không suy ra chắc chắn bị từ chối hoặc bị bỏ qua |
| Body format | Body | A ghi “Body (JSON)” và minh họa một JSON object | A §2.2 | Chưa có request JSON Schema; body rỗng, malformed JSON, top-level sai kiểu: TBD |
| Content-Type request | Header | A nêu JSON body nhưng không khai báo header Content-Type bắt buộc | A §2.2 | `application/json` là lựa chọn kỹ thuật phù hợp với JSON, chưa phải quy tắc bắt buộc kèm mã lỗi được đặc tả; chính sách media type khác: TBD |
| Authorization | Header | **Bắt buộc** gửi `Authorization: Bearer <token>`; JWT phải hợp lệ | A §2; R FR-02; SEC-02 | Kiểu truyền header là văn bản; thuật toán JWT, claims, TTL, thu hồi token và mã lỗi từng trường hợp: TBD |
| Header khác | Header | Không có header khác được A §2 khai báo bắt buộc | A §2 | Không tự thêm API key/custom header vào hợp đồng SUT; các yêu cầu khi thực thi của bài HW06 là lớp riêng |

## 3. Tham số body và quy tắc liên quan

**Không có trường nào trong ba trường body được A §2.2 ghi riêng là required hoặc optional.** R FR-04 cho phép cập nhật các thông tin này nhưng không quy định mỗi request phải gửi đủ cả ba. Việc ba trường xuất hiện cùng nhau trong mẫu JSON không đủ căn cứ kết luận chúng đều bắt buộc.

| Tham số/quy tắc | Vị trí | Ràng buộc | Nguồn | Khoảng trống |
| --- | --- | --- | --- | --- |
| `name` | Body | Tương ứng Họ Tên được phép cập nhật. Mẫu JSON biểu diễn bằng string | A §2.2; R FR-04 | Required/optional, kiểu được chấp nhận chặt, null/rỗng, min/max length, Unicode, trim/chuẩn hóa: **TBD**. Không lấy yêu cầu bắt buộc của form đăng ký FR-01 áp sang cập nhật hồ sơ |
| `shipping_address` | Body | Tương ứng Địa chỉ giao hàng mặc định được phép cập nhật. Mẫu JSON là string | A §2.2; R FR-04 | Required/optional, kiểu chặt, null/rỗng, độ dài, chuẩn hóa địa chỉ: **TBD**. Không mặc định cập nhật địa chỉ đơn hàng cũ |
| `phone` | Body | Tương ứng Số điện thoại. Giá trị hợp lệ **bắt đầu bằng 0, từ 10–11 chữ số**. Mẫu JSON là string giữ số 0 đầu | A §2.2; R FR-04 | Required/optional, chấp nhận kiểu number hay ép kiểu, null/rỗng, trim, bộ chữ số được chấp nhận/chuẩn hóa: **TBD**. Không tự đặt regex chỉ cho ASCII hoặc đầu số nhà mạng |
| `role` | Body, trường ngoài mẫu | Client **không được thay đổi role** thông qua API cập nhật hồ sơ | R FR-04; SEC-06 | Có đủ căn cứ cho bất biến role không đổi; cách xử lý request có role (từ chối toàn bộ hay bỏ qua trường) và mã HTTP: **TBD** |
| `email` | Body, không được A liệt kê | R nói **không được thay đổi email qua giao diện**; A chỉ liệt kê ba trường cơ bản trên | R FR-04; A §2.2 | Chưa đủ căn cứ khẳng định API phải từ chối/bỏ qua email; không chuyển yêu cầu UI thành quy tắc API đã xác định |
| `id`, `user_id` hoặc trường dư khác | Body/query, không được khai báo | Không có tham số chọn user đích trong hợp đồng được A mô tả | A §2.2; R FR-04 | Chính sách additionalProperties, whitelist và xử lý trường dư: **TBD**. Không coi các tên trường nêu ở đây là tham số API được hỗ trợ |
| Cập nhật hồ sơ chính mình | Liên hệ xác thực và đối tượng cập nhật | Người dùng chỉ được cập nhật hồ sơ của chính mình | R FR-04 | Nhận định AI: danh tính đã xác thực phải chi phối đối tượng cập nhật. Tài liệu không định nghĩa claim/token field dùng để ánh xạ user |
| Quan hệ name/phone/address | Liên trường | Không có quy tắc phụ thuộc giá trị giữa ba trường được nêu | A §2.2; R FR-04 | Không suy ra quy tắc “ít nhất một trường”, “phải đủ ba trường” hoặc cặp trường bắt buộc đi cùng nhau |
| Thiếu một trường trong PUT | Body và dữ liệu lưu trữ | Chưa nêu full update hay partial update | A §2.2; R FR-04 | Giữ giá trị cũ/xóa giá trị/từ chối là **TBD**; chưa có oracle cho omission |
| Một trường không hợp lệ | Request và dữ liệu lưu trữ | FR-04 xác định phone hợp lệ, nhưng không mô tả cơ chế báo lỗi và tính nguyên tử của update | R FR-04 | Có thể phân biệt phone đúng/sai điều kiện nghiệp vụ; chưa xác định mã lỗi, message, cập nhật một phần/rollback cả request. Không tự cam kết dữ liệu luôn bất biến khi request lỗi |

### Ví dụ trong đặc tả

Trích mẫu body từ A §2.2, chỉ để minh họa hợp đồng, **không phải test case hoặc dữ liệu đã thực thi**:

```json
{
  "name": "Nguyen Van A",
  "shipping_address": "123 Le Loi, Q1, TP.HCM",
  "phone": "0912345678"
}
```

Phone trong mẫu đáp ứng quy tắc chữ số/độ dài/đầu 0 của FR-04. Mẫu không chứng minh required/optional, toàn bộ kiểu chấp nhận hoặc mọi điều kiện để request thành công. Token chỉ biểu diễn bằng placeholder `<token>`, không ghi thông tin xác thực thực tế.

## 4. Quyền truy cập, trạng thái trước/sau và response

Đây là mô tả hợp đồng và hậu điều kiện ở bước 1; chưa lập bảng State Transition, tình huống bảo mật, assertion schema hoặc các bước thực thi test.

| Tham số/quy tắc | Vị trí | Ràng buộc | Nguồn | Khoảng trống |
| --- | --- | --- | --- | --- |
| Actor | Xác thực/phân quyền | Người dùng đã đăng nhập được cập nhật hồ sơ mình; không yêu cầu role admin cho tác vụ FR-04 | R FR-04; A §2 | Hành vi với tài khoản bị xóa/khóa hoặc token cũ sau thay đổi tài khoản: TBD |
| Trước cập nhật | Hồ sơ và danh tính | Nhận định AI từ FR-04: cần xác định được user đã đăng nhập và hồ sơ đích của user đó | R FR-04 | Cơ chế tạo fixture, snapshot hoặc reset chưa được thực hiện/chốt |
| Sau cập nhật thành công | Dữ liệu hồ sơ | Nhận định AI từ tác vụ cập nhật: thông tin cơ bản được chấp nhận phải phản ánh thay đổi của chính user đó, theo ràng buộc FR-04 | A §2.2; R FR-04 | Giá trị lưu nguyên văn hay chuẩn hóa, trường bị bỏ sót, thời điểm nhất quán khi đọc lại: TBD |
| Bất biến quyền | Dữ liệu tài khoản | User không thể tự đổi role qua operation này | R FR-04; SEC-06 | Mã lỗi/cơ chế từ chối hoặc bỏ qua role: TBD; chưa khẳng định mọi trường khác đều rollback |
| Bất biến chủ thể | Đối tượng cập nhật | Không được cập nhật hồ sơ người khác | R FR-04 | Hợp đồng không có id chọn user đích; hành vi với thuộc tính dư và cấu trúc định danh nội bộ chưa xác định |
| Xác thực không hợp lệ | Điều kiện truy cập | SEC-02 yêu cầu JWT hợp lệ để thực hiện tác vụ được bảo vệ | A §2; SEC-02 | Không tự chọn HTTP 401/403, response message, cấu trúc lỗi hoặc chính sách lỗi ưu tiên |
| Response thành công | HTTP/status/header/body | A §2.2 **không nêu response thành công**, status hoặc payload mẫu | A §2.2 | Status, Content-Type, có body hay không, tên trường, kiểu, required, nullable, additionalProperties: **TBD**; không mượn response 200 của login/register |
| Response lỗi | HTTP/status/header/body | Không có danh mục mã lỗi hoặc error response cho API này | A §2.2; R FR-04; SEC-02/06 | Validation/auth/authorization/malformed request: status và schema đều **TBD**; không tự gán 400/401/403/404/422/500 |
| State machine | Mô hình nghiệp vụ | FR-04 mô tả cập nhật hồ sơ, không có state machine được đặc tả cho hồ sơ | R FR-04 | Hồ sơ trước/sau cập nhật là hậu điều kiện; không gán state machine FR-10 của đơn hàng cho API này |
| Khả năng đọc lại | API hỗ trợ | A §2.1 có `GET /api/users/me`, cùng yêu cầu Bearer token | A §2 | Có thể đề xuất quan sát hồ sơ, nhưng GET chưa có schema; chưa kiểm chứng thực tế |

**Giới hạn oracle hiện tại:** có căn cứ về quyền cập nhật hồ sơ bản thân, bất biến role và điều kiện phone. Chưa đủ hợp đồng để xác định exact response match hoặc mọi hành vi thiếu/null/sai kiểu. Không dùng quan sát implementation trong tương lai để tự thay thế yêu cầu còn thiếu.

## 5. Ánh xạ FR/SEC ở mức hợp đồng

| Yêu cầu | Liên hệ với API mục tiêu | Nguồn | Phạm vi và giới hạn |
| --- | --- | --- | --- |
| FR-04 | Yêu cầu chính: người dùng đã đăng nhập, ba loại thông tin được cập nhật, phone hợp lệ, chỉ sửa mình, không đổi role | R FR-04 | Email không đổi được nêu ở **UI**; chưa có quy tắc API cụ thể cho email |
| FR-02 | JWT được trả sau đăng nhập và gửi qua Bearer header | R FR-02; A §1.2/§2 | Là căn cứ xác thực/API hỗ trợ; không đưa logic khóa đăng nhập thành quy tắc của PUT hồ sơ |
| SEC-02 | Áp dụng trực tiếp: yêu cầu JWT hợp lệ | R mục 9 | Chưa xác định chi tiết token và lỗi HTTP |
| SEC-06 | Áp dụng trực tiếp: API cập nhật hồ sơ không cho client đổi role | R mục 9 | Xác định bất biến, chưa xác định response khi client gửi role |
| SEC-05 | Áp dụng với dữ liệu đi vào truy vấn CSDL | R mục 9 | Cần Parameterized Query; response API đơn lẻ không chứng minh cấu trúc truy vấn. Chưa phân tích implementation |
| SEC-04 | Áp dụng có điều kiện khi dữ liệu hồ sơ được hiển thị trên UI | R mục 9 | UI phải escape, không dùng innerHTML trực tiếp; chuỗi HTML trong JSON không tự là bug hoặc phải bị API từ chối |
| SEC-03 | Không phải yêu cầu admin cho tác vụ FR-04 | R SEC-03; R FR-04/FR-12 | API này không được đặc tả là admin-only; cấm tự nâng role có căn cứ riêng ở SEC-06 |
| SEC-01 | Không có chức năng lưu/đổi mật khẩu trong body được A §2.2 nêu | R SEC-01; A §2.2 | Yêu cầu lưu mật khẩu an toàn vẫn thuộc SUT, nhưng không khẳng định được bao phủ bởi hợp đồng PUT hồ sơ |
| SEC-07 | Không có OTP/reset password trong operation này | R SEC-07; A §2.2 | Ngoài chức năng trực tiếp của API mục tiêu; không thêm yêu cầu OTP vào cập nhật hồ sơ |

Các mục trên chỉ ánh xạ yêu cầu, chưa thực hiện Bước 4 Security Analysis hoặc Bước 5 Schema Analysis của Skill. Không tạo tình huống kiểm thử từ các điểm chưa rõ ở bước này.

## 6. API hỗ trợ và điều kiện dữ liệu dự kiến

**Đề xuất của AI, chưa gọi API hoặc chuẩn bị dữ liệu.** Request hỗ trợ không được tính thêm thành test case của API mục tiêu.

| Nhu cầu | API hỗ trợ có trong A | Hợp đồng đã biết | Điều kiện dữ liệu/giới hạn |
| --- | --- | --- | --- |
| Lấy danh tính/token thử nghiệm | `POST /api/login` — A §1.2 | Body email/password; thành công 200 trả token và user | Chỉ dùng tài khoản thử nghiệm được phép; không chép credential vào tài liệu. Chưa có JWT claims/TTL và cấu trúc user đầy đủ |
| Đọc hồ sơ trước/sau | `GET /api/users/me` — A §2.1 | Cùng header Bearer; lấy thông tin cá nhân | Có thể dùng cho đối chiếu danh tính và dữ liệu; response chưa có schema trong A, khả năng quan sát các trường còn cần xác nhận |
| Có thêm tài khoản riêng nếu cần | `POST /api/register` — A §1.1 | Mẫu name/email/password; R FR-01 có yêu cầu đăng ký | Chỉ là lựa chọn hỗ trợ; trường confirmation thiếu trong A. Chưa đăng ký tài khoản hoặc mở rộng phạm vi kiểm thử registration |
| Khôi phục hồ sơ thử nghiệm | Chính `PUT /api/users/me` với snapshot phù hợp — A §2.2 | Không có API reset hồ sơ riêng được A nêu | Cần lưu giá trị trước thay đổi; chưa bảo đảm khôi phục được dữ liệu null/thiếu do semantics update chưa rõ. Không sửa DB/source để cleanup |

Điều kiện dữ liệu dự kiến:
- Một user thử nghiệm có thể đăng nhập, biết danh tính và hồ sơ trước cập nhật; danh tính này gắn với token hợp lệ.
- Nếu cần đối chiếu quyền sở hữu ở các bước sau, có thêm user thử nghiệm riêng và hồ sơ của user đó; đây là đề xuất dữ liệu, không phải tuyên bố đã có fixture.
- Các giá trị snapshot phải được quản lý trong phạm vi dữ liệu thử nghiệm; chưa đặt cơ chế lưu token/snapshot, chưa tạo thêm file cấu hình.
- Không yêu cầu quyền admin để sử dụng FR-04; không cần dữ liệu đơn hàng, OTP hay coupon cho hợp đồng này.

## 7. Khoảng trống cần sinh viên review

| Mã khoảng trống | Nội dung chưa đủ căn cứ | Ảnh hưởng |
| --- | --- | --- |
| GAP-01 | Required/optional của body, từng trường, body rỗng và PUT partial/full | Chưa đặt được kỳ vọng khi thiếu trường; không mặc định giữ cũ hay xóa |
| GAP-02 | Kiểu chặt/ép kiểu; null/rỗng; trim, Unicode, độ dài name/address | Không tự mở rộng validation từ ví dụ hoặc form khác |
| GAP-03 | Bộ chữ số và quy tắc chuẩn hóa phone; cơ chế từ chối giá trị sai | FR-04 đủ định nghĩa điều kiện phone hợp lệ, chưa đủ regex cụ thể/error contract |
| GAP-04 | Trường dư, email, các trường định danh ngoài mẫu | Bất biến “chỉ sửa mình” rõ; chính sách bỏ qua/từ chối thêm trường còn TBD. Email UI không thay thế API contract |
| GAP-05 | JWT claims/TTL/thu hồi token, trường hợp tài khoản khóa/xóa | Không tự đặt lỗi HTTP hoặc mô hình token ngoài tài liệu |
| GAP-06 | Xử lý khi gửi role: bỏ qua hay từ chối; cập nhật một phần khi có trường lỗi | Role không được đổi là chắc chắn theo đặc tả; tính nguyên tử toàn request còn TBD |
| GAP-07 | Success/error response, status, Content-Type, schema đầy đủ | Chưa có exact-match oracle; không tự gán code/message hoặc additionalProperties=false |
| GAP-08 | Quan sát qua GET, nhất quán đọc lại và phục hồi snapshot | Chưa xác nhận việc setup/verify/cleanup khả thi bằng hợp đồng hiện có |
| GAP-09 | Bằng chứng ngoài API cho SEC-04/05 | Chưa chứng minh escape UI/parameterization và chưa được phép phân tích implementation |

Không phát hiện mâu thuẫn trực tiếp giữa A §2.2 và R FR-04 về ba loại thông tin hoặc yêu cầu xác thực. Tuy nhiên, mô tả “chỉ thông tin cá nhân cơ bản” không xác định cách xử lý mọi trường ngoài mẫu; các điểm thiếu nêu trên được giữ là **TBD**, không xem là quy tắc đã chốt hoặc bug.

**Điểm dừng review:** đã hoàn thành đầu ra Bước 1 theo Skill. Cần sinh viên review ràng buộc, các mục TBD và API hỗ trợ; chưa có xác nhận phê duyệt bước này. Không tự thực hiện Bước 2 hoặc các bước tiếp theo.

