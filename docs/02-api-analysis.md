# Phân tích API HW06 – EShop

- MSSV: 23120274.
- Trạng thái: đề xuất phân tích của AI, chờ sinh viên review; chưa chọn chính thức ba API.
- Phạm vi: phân tích tài liệu; chưa sinh test case, chưa chạy SUT, chưa chỉnh sửa source, chưa thao tác staging/commit/push.

## 1. Nguồn và cách phân biệt bằng chứng

| Ký hiệu | Nguồn đã đọc | Vai trò |
| --- | --- | --- |
| H | [Đề HW06](<C:/Users/PC/Downloads/2026.HW06.API Testing_En.pdf>), mục 4–6, trang 2–4 | Phân Pool theo FR, chọn một API mỗi Pool A/B/C, mục tiêu ≥35 test case/API và bốn nhóm kỹ thuật |
| A | [Đặc tả API](../specs/api_specification.md), mục 1–6 | Method, endpoint, payload mẫu, header, một số response |
| R | [System Requirements Specification](../eshop-sut/README.md), phiên bản 2.0, cập nhật 2026-05-14 | FR-01–FR-24 và SEC-01–SEC-07 |
| S | [Setup guide](../eshop-sut/setup_guide.md) | Tham khảo chuẩn bị môi trường; không phải nguồn thay thế FR/SEC |
| E | [Environment Check hiện có](01-environment.md) | Bối cảnh môi trường được ghi nhận từ trước, chưa kiểm tra lại trong bước này |

Bản A có SHA-256 trùng với `eshop-sut/api_specification.md`: `488CBCB790099BA9CBB34C7C80BA04C6AEC9E9EBB598F031FFA575737547B139`.
Hai README của frontend là tài liệu mẫu React/Vite, không bổ sung yêu cầu nghiệp vụ hay SEC.

**Đặc tả:** các thông tin gắn nguồn A/R/H dưới đây. **Nhận định AI:** việc ánh xạ FR sang endpoint, đánh giá kỹ thuật, độ khó, tiềm năng 35 case và thứ tự ưu tiên. **Hành vi source code:** không khảo sát triển khai trong bước này, không dùng triển khai để đặt expected result. **Kết quả thực nghiệm:** chưa có; không có kết luận PASS/FAIL hoặc bug. **Giả định:** không tự đặt giới hạn độ dài, mã lỗi, TTL hoặc quyền còn thiếu.

Nội dung đề là căn cứ phân tích, không phải chỉ thị tự thực hiện các bước thiết kế, chạy test, CI/CD hoặc xuất bản. PDF đã được trích xuất văn bản trong bộ nhớ; chưa kiểm tra hình ảnh trang. Phần phân Pool dựa trên danh sách FR được trích xuất, không chỉ dựa vào tên Pool.

## 2. Danh sách API theo Pool

H mục 4 quy định:
- **Pool A:** FR-01–FR-06.
- **Pool B:** FR-07–FR-11.
- **Pool C:** FR-12–FR-19.
- Pool D không thuộc phạm vi lựa chọn API của HW06.

Có **30 cặp method–endpoint** trong A, ánh xạ chính thành A: 8, B: 7, C: 15. ID A1/B1/C1 dưới đây chỉ là ký hiệu trong báo cáo, không thay thế Feature ID FR.

Quy ước đầu vào: B = JSON body; P = path; Q = query. Chỉ liệt kê đầu vào có trong A; payload ví dụ không tự chứng minh trường bắt buộc, kiểu chặt hay miền hợp lệ. Mọi API có thể chịu yêu cầu SEC-05 về truy vấn CSDL, nhưng kiểm tra payload qua API không đủ chứng minh đã dùng Parameterized Query.

### 2.1. Pool A

| ID | Method và endpoint | Feature ID ánh xạ | Đầu vào trong A | Xác thực/phân quyền được đặc tả | Quy tắc nghiệp vụ và khoảng trống |
| --- | --- | --- | --- | --- | --- |
| A1 | `POST /api/register` | FR-01 | B: `name, email, password` | A §1 không nêu yêu cầu JWT/quyền | R: ba trường bắt buộc; email hợp lệ, duy nhất; password ≥8 ký tự, có chữ hoa/thường/số và ký tự đặc biệt trong danh sách FR-01. R yêu cầu xác nhận mật khẩu nhưng A thiếu tên trường tương ứng. Chuyển trang đăng nhập là yêu cầu UI. |
| A2 | `POST /api/login` | FR-02 | B: `email, password` | A §1 không nêu JWT đầu vào; thành công trả JWT | R: mỗi lần sai tăng bộ đếm đúng 1; từ 3 lần sai liên tiếp khóa 30 giây; thông báo lỗi phù hợp, không lộ chi tiết nguyên nhân. HTML5 email là UI. Không có quy tắc cụ thể về reset bộ đếm sau thành công. Đã được bạn cùng nhóm chọn. |
| A3 | `POST /api/forgot-password` | FR-03, bước 1 | B: `email` | Không nêu JWT/quyền trong A §1 | R: email đã đăng ký; OTP 6 chữ số ngẫu nhiên, gửi email hoặc hiển thị trong demo; SEC-07 có hạn và vô hiệu sau dùng. Không có TTL cụ thể, quy tắc gửi lại hoặc rate limit. |
| A4 | `POST /api/reset-password` | FR-03, bước 2 | B: `email, resetToken, newPassword` | A không nêu JWT; OTP gắn với email là điều kiện nghiệp vụ | R: password mới theo FR-01; xác nhận phải khớp; OTP không dùng cho email khác. SEC-07: thời hạn, dùng một lần. A thiếu trường xác nhận, TTL và response. |
| A5 | `GET /api/users/me` | FR-04 | Không nêu P/Q/B; header Bearer | A §2 yêu cầu JWT; lấy hồ sơ cá nhân | R mô tả quản lý thông tin bản thân; A chưa mô tả response hoặc danh sách trường được trả. Không suy ra chính sách đọc hồ sơ người khác từ route này. |
| A6 | `PUT /api/users/me` | FR-04 | B: `name, shipping_address, phone`; header Bearer | A §2 và R: đã đăng nhập, chỉ sửa hồ sơ mình | R: phone bắt đầu 0, dài 10–11 chữ số; không tự đổi role (SEC-06). Email không được đổi **qua giao diện**; chưa đủ căn cứ kết luận API bắt buộc từ chối email. A chỉ cho cập nhật thông tin cá nhân cơ bản; không nêu PUT toàn phần hay cập nhật từng phần. |
| A7 | `GET /api/products` | FR-05; phục vụ việc xem sản phẩm FR-15 | Q tùy chọn: `search` | A §3.1 không nêu JWT/quyền | Tìm theo tên; R có hiển thị an toàn từ khóa trên UI, loading/empty state. Không đặc tả phân trang, thứ tự, tìm hoa/thường, chuỗi rỗng, giới hạn search. |
| A8 | `GET /api/products/:id` | FR-06; phục vụ việc xem sản phẩm FR-15 | P: `id` | A §3.2 không nêu JWT/quyền | R mô tả hiển thị ảnh/tên/giá/mô tả/danh mục; ô số lượng nguyên dương ≥1 là UI để thêm giỏ, không phải tham số GET. Chưa có schema JSON và hành vi id không tồn tại. |

### 2.2. Pool B

| ID | Method và endpoint | Feature ID ánh xạ | Đầu vào trong A | Xác thực/phân quyền được đặc tả | Quy tắc nghiệp vụ và khoảng trống |
| --- | --- | --- | --- | --- | --- |
| B1 | `GET /api/cart` | FR-07 | Header Bearer; không nêu P/Q/B | A §4 yêu cầu JWT | R mô tả sản phẩm, đơn giá, số lượng, thành tiền; phần lớn là UI. A không có schema hoặc mô tả rõ cấu trúc lưu giỏ theo user. |
| B2 | `POST /api/cart` | FR-07; liên quan FR-06 | B: `id, name, price, quantity`; Bearer | A §4 yêu cầu JWT | R: thêm cùng sản phẩm tăng quantity, không sinh dòng mới. Số lượng nguyên dương ≥1 được nêu ở ô nhập FR-06; áp dụng như ràng buộc API cần làm rõ. Chưa nêu giá chuẩn lấy từ đâu, giới hạn quantity, xử lý sản phẩm không tồn tại. |
| B3 | `POST /api/checkout` | FR-08; liên quan FR-10 | B: `total_amount, shipping_address`; Bearer | A §4 và R: đã đăng nhập | Backend phải tự tính tổng từ giỏ, không chấp nhận tổng client quyết định; thanh toán thành công xóa giỏ. A vẫn đưa total_amount trong payload: không coi payload mẫu là quyền sửa tổng. Trạng thái tạo mới không được A quy định rõ. Đã được bạn cùng nhóm chọn. |
| B4 | `GET /api/orders/my-orders` | FR-11 | Header Bearer; không nêu P/Q/B | A §4 yêu cầu JWT; R chỉ xem đơn của mình | R: mã đơn, ngày đặt, tổng tiền, trạng thái; dịch/màu là UI. Chưa có schema, phân trang, thứ tự. |
| B5 | `GET /api/orders/:id` | FR-11 (ánh xạ việc xem đơn) | P: `id`; Bearer | A §4 yêu cầu JWT; R chỉ xem đơn của mình | Không trả đơn người khác cho user (căn cứ FR-11). Quyền admin qua route này và mã lỗi cụ thể chưa nêu. |
| B6 | `PUT /api/orders/:id/cancel` | FR-10; liên quan FR-20 | P: `id`; Bearer; không nêu body | A §4 JWT; R FR-10 phân biệt user/admin | A nói chỉ hủy khi chưa giao. R chi tiết: user hủy pending/confirmed; không tự hủy shipping; delivered/canceled là kết thúc. R nói shipping chỉ admin có thể thao tác, nhưng sơ đồ không có cạnh shipping→canceled: không tự chốt cạnh này hay route admin sử dụng. Quyền sở hữu khi hủy cần đối chiếu thêm, vì FR-11 nêu quyền xem chứ không mô tả rõ quyền hủy. |
| B7 | `POST /api/apply-coupon` | FR-09 | B: `code, total_amount, user_id` | R C4 yêu cầu JWT hợp lệ; A §5.1 không nêu header — khoảng trống mô tả | R: mã tồn tại và active; hiện tại trước expired_at; total ≥ min_order_amount; đã đăng nhập; số lượt user < max_uses_per_user. Percent/fixed có công thức cụ thể. Chưa mô tả lúc nào tăng lượt dùng, cách xác định user từ token so với user_id, làm tròn và chặn final_amount âm. |

### 2.3. Pool C

Các API `/api/admin/*` đều cần JWT hợp lệ và role admin theo A §6, R FR-12, SEC-02/03. Các thao tác sửa dữ liệu sản phẩm/danh mục/coupon cũng cần JWT và admin theo FR-12.

| ID | Method và endpoint | Feature ID ánh xạ | Đầu vào trong A | Xác thực/phân quyền được đặc tả | Quy tắc nghiệp vụ và khoảng trống |
| --- | --- | --- | --- | --- | --- |
| C1 | `POST /api/products` | FR-15, FR-12 | B: `name, price, description, imageUrl, category_id`; Bearer | Admin | R: name bắt buộc, ≤255 ký tự; price bắt buộc, số >0; danh mục bắt buộc, có sẵn. Không có giới hạn description, định dạng imageUrl hoặc quy tắc trùng tên. |
| C2 | `PUT /api/products/:id` | FR-15, FR-12 | P: id; B như C1; Bearer | Admin | Các ràng buộc FR-15; chỉ sản phẩm mục tiêu thay đổi. Chưa nêu partial update hay bắt buộc gửi lại toàn bộ trường, id không tồn tại. |
| C3 | `DELETE /api/products/:id` | FR-15, FR-12 | P: id; Bearer; không nêu body | Admin | Được xóa sản phẩm; chưa nêu soft/hard delete, quan hệ với giỏ/đơn cũ, xóa lại hoặc id không tồn tại. |
| C4 | `GET /api/categories` | FR-14 | Không nêu P/Q/B | A §3.4 không nêu JWT; FR-12 chỉ bắt buộc admin cho các method thay đổi dữ liệu, không đủ suy ra GET bắt buộc admin | Lấy danh sách; không có schema, thứ tự, phân trang. Pool C theo FR-14 dù tên Pool A có chữ Categories. |
| C5 | `POST /api/categories` | FR-14, FR-12 | B: `name`; Bearer theo R | Admin | Tên bắt buộc, không rỗng. Chưa có độ dài tối đa, tính duy nhất hoặc quy tắc trim. |
| C6 | `PUT /api/categories/:id` | FR-14 (CRUD theo H), FR-12 | P: id; A liệt kê endpoint nhưng **không có body update** | Admin | R FR-14 chỉ mô tả Thêm/Xem/Xóa và name bắt buộc, không mô tả riêng sửa. Không mặc định body PUT giống POST; cần xác nhận hợp đồng update. |
| C7 | `DELETE /api/categories/:id` | FR-14, FR-12 | P: id; Bearer theo R | Admin | Được xóa danh mục; chưa nêu xử lý danh mục đang có sản phẩm, cascade hoặc id không tồn tại. |
| C8 | `GET /api/coupons` | FR-17, FR-12 | Header Bearer | A §5.2 ghi dành cho Admin và có Bearer | Danh sách coupon; chưa có schema, lọc hoặc phân trang. |
| C9 | `GET /api/admin/users` | FR-19, FR-12 | Bearer; không nêu P/Q/B | Admin | Xem toàn bộ người dùng, không lộ mật khẩu. Chưa có danh sách trường hoặc schema đầy đủ. |
| C10 | `DELETE /api/admin/users/:id` | FR-19, FR-12 | P: id; Bearer | Admin | Không được xóa chính tài khoản đang đăng nhập. Chưa quy định quan hệ dữ liệu hoặc xóa admin khác. |
| C11 | `GET /api/admin/orders` | FR-18, FR-12 | Bearer; không nêu P/Q/B | Admin | Xem mọi đơn của mọi user; shipping_address hiển thị an toàn trên UI. Chưa có schema, sort/filter/pagination. |
| C12 | `PUT /api/admin/orders/:id/status` | FR-18, FR-10, FR-12 | P: id; B: `status`; Bearer | Admin | A liệt kê pending/confirmed/shipping/delivered/canceled; R yêu cầu theo state machine và cấm rời final state. Chưa chốt self-transition; cạnh admin hủy shipping còn mơ hồ. Đã được bạn cùng nhóm chọn. |
| C13 | `POST /api/admin/import-products` | FR-16, liên quan FR-15/12 | B: `products[]` chứa `name, price, description, imageUrl, category_id`; Bearer | Admin | R: CSV đuôi .csv, header chuẩn, hỗ trợ dấu phẩy trong nháy kép; name không rỗng, price >0; một dòng lỗi rollback toàn bộ; báo số thành công/lỗi và lý do. A nhận JSON array trong object: yêu cầu CSV parsing không thể mặc nhiên kiểm thử trực tiếp tại endpoint JSON. |
| C14 | `POST /api/admin/coupons` | FR-17, FR-12 | B: `code, type, discount_value, min_order_amount, expired_at, max_uses_per_user`; Bearer | Admin | R: mọi trường trên bắt buộc; code duy nhất; type percent/fixed; discount_value >0; min_order_amount ≥0; max_uses_per_user ≥1. Không nêu discount percent ≤100, max_uses phải nguyên, định dạng ngày bắt buộc hay ngày tạo phải trong tương lai. |
| C15 | `DELETE /api/admin/coupons/:id` | FR-17, FR-12 | P: id; Bearer | Admin | Được xóa coupon; chưa quy định code đã dùng, dữ liệu lịch sử, xóa lại và id không tồn tại. |

**Feature không có endpoint riêng trong A:** FR-12 là yêu cầu xuyên suốt; FR-13 mô tả dashboard (doanh thu chỉ tính delivered và tổng số đơn), nhưng không có endpoint dashboard được liệt kê. Không tự đặt `GET /api/admin/dashboard`. FR-07 có UI xóa/chỉnh giỏ nhưng A không liệt kê endpoint DELETE/PUT cart; không tự thêm vào danh sách. Các thao tác xem sản phẩm phục vụ admin dùng chung endpoint A7/A8; không đếm thêm một cặp method–endpoint.

## 3. Khả năng áp dụng kỹ thuật và đạt ít nhất 35 case

**Toàn bộ phần này là nhận định AI, chưa có test case hoặc số lượng đã chứng minh.**

DP = Domain Partitioning; ST = State Transition; SV = Schema Validation. “Hạn chế” nghĩa thiếu miền/trạng thái/schema đủ rõ, không có nghĩa API chắc chắn không kiểm thử được. Phân hoạch dữ liệu tồn tại/không tồn tại là hướng khảo sát; mã lỗi cho miền không được đặc tả phải để mở. Không ghép lặp payload vô nghĩa chỉ để đạt 35.

SV có thể kiểm tra phần hợp đồng đã nêu. A không cung cấp JSON Schema/OpenAPI hoặc quy tắc additionalProperties; ví dụ response không đủ để khẳng định tập khóa phải khớp tuyệt đối, mọi kiểu/nullability và toàn bộ error schema. R mô tả trường trên UI không tự trở thành schema JSON.

### 3.1. Pool A

| API | DP | ST | Security | SV theo tài liệu hiện có | Tiềm năng ≥35 case/API |
| --- | --- | --- | --- | --- | --- |
| A1 register | Cao: trường bắt buộc, email hợp lệ/duy nhất, độ dài và nhóm ký tự password | Vừa: tài khoản chưa tồn tại→được tạo; đăng nhập là bước hỗ trợ | SEC-01/05; role khi đăng ký chưa có chính sách riêng | A có mẫu 200: message và id; thiếu schema lỗi | Khá cao nhờ nhiều ràng buộc độc lập; cần làm rõ trường xác nhận, không tính UI thành case API |
| A2 login | Vừa: email/password, danh tính hợp lệ/sai | Cao: chuỗi sai, khóa ≥3, chờ 30 giây | SEC-02/05; lỗi không lộ nguyên nhân | 200 có token và user nhưng thiếu cấu trúc user | Khá cao, tốn reset bộ đếm và đồng bộ thời gian; trùng API nhóm đã chọn |
| A3 forgot | Vừa: email đã đăng ký và các miền đầu vào; phản hồi email lạ chưa chốt | Vừa: yêu cầu mã→có mã; hiệu lực cần bước reset | SEC-07/05, SEC-01 chỉ liên quan quy trình đổi mật khẩu | Mẫu 200 có message/resetToken; OTP là chuỗi sáu số trong ví dụ | Có điều kiện; một tham số nên 35 case độc lập khó hơn A4; không tự đặt rate limit/TTL |
| A4 reset | Cao: email, token, độ phức tạp password mới, ràng buộc chéo email/OTP | Cao: OTP hợp lệ/hết hạn/đã dùng và mật khẩu được thay đổi | SEC-07/01/05 | Chưa có response mẫu/schema | Khá cao nếu xác định được TTL và hợp đồng confirmation; cần API forgot và login hỗ trợ |
| A5 GET me | Thấp: chủ yếu header/token và các user | Thấp: đọc hồ sơ trước/sau thay đổi, không có state machine riêng | SEC-02; cô lập danh tính | Chưa có schema response | Chưa có căn cứ bảo đảm 35 case có ý nghĩa từ tài liệu hiện có |
| A6 PUT me | Cao: phone 0 đầu, 10–11 chữ số; trường cơ bản, role bị cấm | Vừa: hồ sơ trước/sau cập nhật; không phải state machine FR-10 | SEC-02/06/05; cô lập hai user | Chưa có response schema; kiểu/required name/address còn thiếu | Khá cao nếu kết hợp miền phone, role và bất biến hồ sơ khác; cần review chồng lặp, partial update |
| A7 products list | Vừa: search tùy chọn, có/không khớp tên | Thấp: thay dữ liệu rồi đọc; không có chuyển trạng thái đặc tả | SEC-05; SEC-04 chỉ xác minh được khi render UI | Chưa có response schema | Khó bảo đảm 35; thiếu search semantics và các tham số khác |
| A8 product detail | Thấp–vừa: id và dữ liệu sản phẩm | Thấp: tồn tại/xóa là vòng đời dữ liệu, không phải FR-10 | SEC-05; không tự gán JWT khi A không yêu cầu | R chỉ mô tả thông tin hiển thị; thiếu schema API | Khó bảo đảm 35 nếu không tự đặt hành vi id và schema |

### 3.2. Pool B

| API | DP | ST | Security | SV theo tài liệu hiện có | Tiềm năng ≥35 case/API |
| --- | --- | --- | --- | --- | --- |
| B1 GET cart | Thấp: token, giỏ trống/có dữ liệu | Vừa: giỏ trước/sau thêm hoặc checkout; API khác tạo trạng thái | SEC-02; cô lập giỏ là hướng cần làm rõ đặc tả | Chưa có response schema | Có điều kiện, khó đủ 35 độc lập chỉ cho GET |
| B2 POST cart | Vừa–cao: nhiều trường, quantity và cùng/khác sản phẩm; nhiều miền chưa có oracle | Vừa: giỏ trống→có dòng; cùng sản phẩm→tăng số lượng | SEC-02/05; giá giả và user isolation là hướng khảo sát, không tự thêm quy tắc giá | Chưa có response schema | Có tiềm năng nhưng đặc tả validation còn yếu; chưa bảo đảm 35 |
| B3 checkout | Cao: tổng client so với giỏ, địa chỉ và dữ liệu giỏ | Cao: đặt hàng/xóa giỏ; trạng thái đầu đơn còn thiếu | SEC-02/05, tính toàn vẹn giá FR-08 | Chưa có response schema | Khá cao; chuẩn bị/khôi phục giỏ và đơn tốn công; trùng API nhóm đã chọn |
| B4 my-orders | Thấp: token và các tập đơn | Thấp–vừa: đọc theo trạng thái đơn do API khác tạo | SEC-02; dữ liệu đơn phải đúng chủ FR-11 | Chưa có response schema | Khó bảo đảm 35; không tự thêm pagination/filter |
| B5 order detail | Vừa: id, chủ sở hữu, trạng thái dữ liệu | Thấp–vừa: quan sát đơn trước/sau chuyển trạng thái | SEC-02/05; IDOR có căn cứ FR-11 | Chưa có response schema | Có điều kiện; phụ thuộc nhiều dữ liệu, thiếu oracle lỗi và schema |
| B6 cancel order | Vừa: id, token, vai trò và trạng thái hiện tại | Cao: pending/confirmed→canceled; chặn user ở shipping và final states | SEC-02/05; quyền admin ở route này, quyền hủy đơn người khác chưa đầy đủ | Chưa có response schema | Khá cao nhờ kết hợp state và actor; cần dữ liệu độc lập, làm rõ cạnh mơ hồ |
| B7 apply coupon | Cao: năm điều kiện, các ngưỡng, percent/fixed, công thức | Vừa: thời gian/lượt dùng; chưa đặc tả thao tác nào tiêu thụ lượt | SEC-02 theo C4; SEC-05; user_id/token cần làm rõ ràng buộc | Có discount_amount/final_amount; thiếu exact schema/kiểu/lỗi | Cao về tiềm năng nhờ decision conditions và biên; chưa tuyên bố đã đủ 35 |

### 3.3. Pool C

Mọi API ghi rõ Admin ở mục 2 có thể khảo sát không token/token không hợp lệ/user thường/admin theo SEC-02/03; việc mã lỗi là 401 hay 403 chưa được tài liệu ấn định.

| API | DP | ST | Security | SV theo tài liệu hiện có | Tiềm năng ≥35 case/API |
| --- | --- | --- | --- | --- | --- |
| C1 POST products | Cao: name bắt buộc/255; price >0; category bắt buộc/có sẵn | Vừa: chưa có→được tạo; không có state machine FR-10 | SEC-02/03/05; SEC-04 cần UI | Chưa có response schema | Khá cao; oracle đầu vào rõ và chuẩn bị category đơn giản |
| C2 PUT product | Cao: như C1, thêm id | Vừa: trước/sau; sản phẩm khác giữ nguyên | SEC-02/03/05; SEC-04 cần UI | Chưa có response schema | Khá cao; mạnh ở bất biến, nhưng cần làm rõ partial/full update |
| C3 DELETE product | Vừa: id, vai trò, quan hệ dữ liệu còn thiếu quy tắc | Vừa: tồn tại→xóa; lặp xóa chưa chốt | SEC-02/03/05 | Chưa có response schema | Khó bảo đảm 35, dễ lặp lại miền id/token |
| C4 GET categories | Thấp: không có tham số nghiệp vụ được nêu | Thấp: tập rỗng/có dữ liệu, thao tác hỗ trợ | SEC-05; chưa có căn cứ bắt buộc admin cho GET | Chưa có response schema | Thấp, thiếu tham số và quy tắc độc lập |
| C5 POST category | Vừa: name bắt buộc/không rỗng; không tự đặt max/unique | Vừa: tạo rồi đọc | SEC-02/03/05; SEC-04 cần UI | Chưa có response schema | Có điều kiện; một trường và ít ràng buộc nên 35 khá khó |
| C6 PUT category | Chưa đủ hợp đồng body; id và quyền vẫn khảo sát được | Vừa: sửa rồi đọc, quy tắc sửa chưa rõ | SEC-02/03/05 | Chưa có response schema | Chưa đủ cơ sở do thiếu mô tả body/update |
| C7 DELETE category | Vừa: id và quyền; quan hệ product chưa đặc tả | Vừa: tồn tại→xóa | SEC-02/03/05 | Chưa có response schema | Khó bảo đảm 35, chưa có chính sách danh mục đang dùng |
| C8 GET coupons | Thấp: header và tập dữ liệu | Thấp: quan sát trước/sau CRUD | SEC-02/03 | Chưa có response schema | Khó bảo đảm 35; không tự thêm lọc/tham số |
| C9 GET admin users | Thấp–vừa: header, tập user và dữ liệu nhạy cảm | Thấp: đọc danh sách, không có state machine | SEC-02/03; FR-19 không lộ password; không suy ra SEC-01 từ response | Có bất biến không lộ password, chưa có schema đầy đủ | Có điều kiện; khó đạt 35 độc lập với ít tham số |
| C10 DELETE user | Vừa: id, tự xóa/người khác, vai trò | Vừa: tồn tại→xóa; tác động token/đơn sau xóa chưa đặc tả | SEC-02/03/05; cấm tự xóa FR-19 | Chưa có response schema | Có điều kiện; có quy tắc tự xóa nhưng dữ liệu phá hủy tốn công |
| C11 GET admin orders | Thấp–vừa: header, nhiều user/trạng thái đơn | Thấp–vừa: đọc sau chuyển trạng thái | SEC-02/03; SEC-04 cần UI hiển thị địa chỉ | Chưa có response schema | Có điều kiện, nhiều fixture nhưng ít miền input |
| C12 PUT order status | Cao: id, enum status, role và current state | Cao: các cạnh FR-10, final states | SEC-02/03/05 | Enum đầu vào đã nêu, response chưa có schema | Khá cao; chuẩn bị nhiều đơn/trạng thái; trùng API nhóm đã chọn |
| C13 import products | Cao: mảng/bản ghi/name/price và tổ hợp đúng–sai; CSV cần lớp xử lý riêng | Cao về giao dịch: trước→thành công hoặc rollback nguyên tử; không phải order state machine | SEC-02/03/05; dữ liệu CSV/XSS cần đúng lớp kiểm tra | A có request example; response chỉ yêu cầu báo cáo nghiệp vụ, thiếu schema | Khá cao cho JSON validation/rollback; công sức cao, phải làm rõ CSV→JSON |
| C14 POST coupon | Cao: sáu trường bắt buộc, unique code, enum và ba ngưỡng số | Vừa: tạo/trùng code; hiệu lực sử dụng cần B7 hỗ trợ | SEC-02/03/05 | Chưa có response schema; input date chỉ là ví dụ | Khá cao; nhiều quy tắc rõ, cần cô lập code và ngày |
| C15 DELETE coupon | Vừa: id và quyền | Vừa: có→xóa; ảnh hưởng lịch sử chưa đặc tả | SEC-02/03/05 | Chưa có response schema | Khó bảo đảm 35 do ít đầu vào và quy tắc vòng đời |

**Lưu ý về ST:** thao tác tạo/sửa/xóa dữ liệu có thể kiểm tra chuỗi và hậu điều kiện, nhưng không nên gọi mọi chuỗi CRUD là state machine FR-10. A4 kiểm tra vòng đời OTP và B6 kiểm tra chuyển trạng thái đơn là hai trường hợp ST có căn cứ mạnh. Không ép cả bốn kỹ thuật vào mọi endpoint nếu không có yêu cầu tương ứng.

## 4. SEC-01 đến SEC-07 đã tìm thấy

Tất cả nằm ở **R mục 9, dòng 278–284**. Tiêu đề của R ghi “Yêu cầu Bảo mật (Security Requirements — Tham khảo)”; H yêu cầu xem xét SEC-01–07 trong bộ kiểm thử. A không liệt kê các mã này; không kết luận thiếu SEC chỉ vì tìm riêng A.

| ID | Nội dung được đặc tả trong R | Liên quan API và giới hạn kiểm chứng (nhận định AI) |
| --- | --- | --- |
| SEC-01 | Mật khẩu không được lưu plaintext | A1/A4 và lưu trữ tài khoản. Chỉ đăng nhập thành công hay response không chứa password chưa chứng minh lưu trữ an toàn; cần bằng chứng lưu trữ hoặc khảo sát triển khai khi được yêu cầu. |
| SEC-02 | API có tính bảo mật phải yêu cầu JWT hợp lệ | Users, cart/orders, coupon áp dụng theo C4 và các thao tác admin. Danh sách cụ thể kết hợp A và FR, không suy ra mọi API đều cần JWT. |
| SEC-03 | Admin API phải kiểm tra role admin trong token, không chỉ có token | Các route admin và thao tác quản trị theo FR-12. Payload có role admin không tự trở thành quyền hợp lệ. |
| SEC-04 | Dữ liệu user khi hiển thị UI phải escape, không dùng innerHTML trực tiếp | Search, profile, product, địa chỉ đơn… Phản hồi JSON chứa chuỗi HTML chưa đủ kết luận XSS; cần ngữ cảnh render UI. Không bắt API từ chối mọi ký tự HTML nếu không có quy tắc đó. |
| SEC-05 | Truy vấn dùng Parameterized Query, không nối chuỗi trực tiếp | Các trường đi vào truy vấn. Thử injection qua API chỉ kiểm tra một số biểu hiện; để chứng minh cấu trúc truy vấn cần bằng chứng code/query. Chưa khảo sát code hoặc chạy injection. |
| SEC-06 | API cập nhật hồ sơ không cho client thay đổi role | A6; phải quan sát cả quyền/trạng thái tài khoản, không chỉ message trả về. |
| SEC-07 | OTP đủ entropy, tối thiểu 6 chữ số, có thời hạn, vô hiệu sau dùng | A3/A4; FR-03 nói 6 chữ số ngẫu nhiên. Chưa có TTL, số lần thử, giới hạn gửi lại. Một vài mẫu mã khác nhau không chứng minh entropy đạt yêu cầu. |

Không có mã SEC nào bị thiếu trong R. Chưa xác nhận SUT tuân thủ các mã SEC.

## 5. So sánh độ khó, khả năng kiểm thử và dữ liệu

Đánh giá dưới đây là tương đối của AI, không phải số giờ đo thực nghiệm. “Khả năng kiểm thử” xét oracle được đặc tả, cách tạo trạng thái, khả năng quan sát hậu điều kiện và khả năng lặp lại; không dựa vào giả định API đang chạy đúng.

| Nhóm API | Độ khó phân tích/kiểm thử | Dữ liệu cần chuẩn bị sau khi được duyệt | Khả năng kiểm thử và công sức |
| --- | --- | --- | --- |
| A1 register | Trung bình | Email duy nhất/trùng; tài khoản tạo mới | Miền password rõ; dễ tạo nhiều dữ liệu nhưng phát sinh tài khoản; thiếu confirmation/schema |
| A2 login | Trung bình–cao | User kiểm soát được bộ đếm, trạng thái khóa | ST rõ nhưng chờ 30 giây và khôi phục bộ đếm gây nhiễu; trùng API nhóm |
| A3/A4 forgot/reset | Cao | Hai email, OTP đúng/sai/đã dùng/hết hạn; tài khoản có thể đổi password | A4 giàu ST/SEC; phụ thuộc nhiều bước và chưa biết TTL; A3 đơn lẻ yếu hơn về 35 case |
| A5/A6 profile | Thấp–trung bình | Hai user độc lập; lưu hồ sơ trước thay đổi | A6 có biên phone và SEC-06 rõ; dễ quan sát bằng GET me. A5 ít tham số; không tự đặt quy tắc name/address |
| A7/A8 đọc sản phẩm | Thấp | Sản phẩm tên khác nhau, category và id đã biết | Ít thay đổi dữ liệu; dễ chạy lại, nhưng search/schema chưa rõ và khó có 35 case độc lập |
| B1/B2 cart | Trung bình | Hai user, nhiều sản phẩm, giỏ sạch và giỏ có dòng | Kiểm tra tăng quantity có oracle; thiếu reset/remove giỏ trong A khiến dọn dữ liệu chưa rõ |
| B3 checkout | Cao | Giỏ và đơn mới mỗi lần, thông tin giao hàng | Oracle tổng server và xóa giỏ rõ; tiêu thụ dữ liệu, cần nhiều bước; trùng API nhóm |
| B4/B5 đọc đơn | Trung bình | Nhiều đơn, nhiều chủ sở hữu/trạng thái | B5 có IDOR rõ theo FR-11; ít input, tạo đơn/trạng thái tốn công hơn GET |
| B6 cancel | Cao | Đơn độc lập ở pending/confirmed/shipping/delivered/canceled; user/admin | ST mạnh; trạng thái kết thúc không tái dùng để kiểm tra cạnh khác; cạnh admin shipping cần làm rõ |
| B7 coupon | Trung bình–cao | Mã active/inactive, hết/còn hạn, percent/fixed, các ngưỡng và lượt dùng từng user | Năm điều kiện và công thức rõ; dữ liệu thời gian/lượt dùng khó hơn profile; API tạo coupon chưa nêu is_active và cơ chế chỉnh usage |
| C1/C2 product create/update | Trung bình | Admin/user; category tồn tại/không tồn tại; sản phẩm mục tiêu và đối chứng | Nhiều ràng buộc rõ; C1 dễ chuẩn bị hơn C2; C2 có oracle “chỉ sản phẩm mục tiêu đổi” |
| C3/C5/C6/C7/C10/C15 xóa hoặc category CRUD | Trung bình | Bản ghi dùng riêng; quan hệ dữ liệu và actor tự xóa | Ít ràng buộc nên khó đạt 35; thao tác xóa tiêu thụ dữ liệu; C6 thiếu body update |
| C4/C8/C9/C11 danh sách quản trị/danh mục | Thấp–trung bình | Dữ liệu nhiều chủ sở hữu, dữ liệu nhạy cảm cần bảo vệ | Dễ lặp GET, nhưng ít tham số và thiếu schema. C9 có yêu cầu không lộ password riêng; C4 chưa nêu bắt buộc admin |
| C12 order status | Cao | Nhiều đơn độc lập cho từng trạng thái/actor | Giàu ST; tạo trạng thái tốn công, final states không chuyển ngược; trùng API nhóm |
| C13 import | Cao | Category, batch đúng/sai và snapshot sản phẩm trước import | Rollback quan sát được qua danh sách; nhiều nhánh, nhưng ranh giới CSV/JSON và report cần xác nhận |
| C14 coupon create | Trung bình | Admin/user; code duy nhất/trùng; ngày và giá trị ngưỡng | Nhiều miền rõ và dễ cô lập hơn usage B7; thiếu date format, response schema và cleanup policy |

E từng ghi Newman/HTML reporter chưa có và dữ liệu SQLite chưa được kiểm tra. Đây là thông tin cũ, không phải kết quả kiểm tra môi trường ở bước phân tích này. Không chạy initializer hay cài dependency để chuẩn bị dữ liệu trong phạm vi hiện tại.

## 6. Ưu tiên để sinh viên cân nhắc, chưa lựa chọn chính thức

| Pool | API ưu tiên xem xét | Lý do (nhận định AI) | Điểm cần chấp nhận/làm rõ |
| --- | --- | --- | --- |
| A | A6 `PUT /api/users/me` | Khác ba API nhóm; biên phone cụ thể, quyền cá nhân và SEC-06; chuẩn bị nhẹ | Không có order state machine, schema/partial update chưa rõ; phải chứng minh đủ 35 case khi thiết kế |
| A | A4 `POST /api/reset-password` | OTP/email/password cho DP, ST và SEC-07 mạnh | TTL, confirmation và response còn thiếu; cần A3/login hỗ trợ, công sức cao hơn A6 |
| B | B7 `POST /api/apply-coupon` | Năm điều kiện và công thức tạo nhiều tình huống có ý nghĩa; không trùng nhóm | Lượt dùng, thời gian, active và user_id/token cần làm rõ; chưa có ST đơn hàng |
| B | B6 `PUT /api/orders/:id/cancel` | Có ST FR-10 trực tiếp; không trùng nhóm | Fixture nhiều trạng thái; admin hủy shipping và quyền sở hữu khi hủy chưa đủ rõ |
| C | C1 `POST /api/products` | Ràng buộc rõ, dữ liệu category dễ chuẩn bị; không trùng nhóm | Chưa có response schema; vòng đời tạo mới không thay thế FR-10 |
| C | C14 `POST /api/admin/coupons` | Sáu trường bắt buộc và các ngưỡng; không trùng nhóm | Thiếu format ngày, quy tắc làm tròn/kiểu số nguyên và response schema |
| C | C13 `POST /api/admin/import-products` | Có nguyên tử/rollback và dữ liệu batch phong phú | Công sức cao, phải tách CSV parsing khỏi JSON endpoint; không chọn chỉ vì nhiều nhánh |

A2/B3/C12 vẫn được phân tích để so sánh nhưng hạ ưu tiên theo yêu cầu sinh viên. H §5 cấm hai thành viên chọn cùng **bộ ba** API; yêu cầu hiện tại ưu tiên tránh từng API đã nêu chặt hơn và được áp dụng trong bảng trên.

Chưa chốt một tổ hợp. Nếu muốn phủ ST đơn hàng rõ ràng, B6 có lợi thế hơn B7; nếu muốn tập trung điều kiện nghiệp vụ và tính toán, B7 có lợi thế. Nếu chọn API không có FR-10, cần sinh viên review cách giải thích phạm vi State Transition của bộ ba đối với mục 6 đề HW06, không tự bỏ yêu cầu đó.

## 7. Khoảng trống cần review trước khi thiết kế

1. Schema response/error của phần lớn endpoint; chính sách additionalProperties, required, kiểu, nullability và mã HTTP chưa đủ để khẳng định “exact match”. A chỉ nêu 200 và ví dụ thành công cho register/login/forgot; apply coupon chỉ nêu hai trường tính toán.
2. Trường xác nhận mật khẩu ở register/reset thiếu trong API contract; phân biệt validation UI với API, không tự đặt tên tham số.
3. OTP TTL và cơ chế tạo dữ liệu hết hạn; vòng đời dùng/gửi lại chưa đầy đủ. Không tự chọn TTL để làm expected result.
4. Quan hệ user_id với JWT, tiêu thụ lượt coupon, active flag, thời điểm so sánh hết hạn, timezone, làm tròn và final_amount âm chưa được chốt.
5. A nói đơn chưa giao có thể hủy nhưng R cấm user hủy shipping; cần dùng quy tắc FR chi tiết để phân tích, đồng thời ghi nhận câu chữ chưa đồng nhất. Đường admin xử lý shipping và self-transition chưa rõ.
6. R mô tả UI email không đổi; không tự mở rộng thành cấm đổi email ở API. R FR-06 mô tả ô quantity; không mặc nhiên coi mọi validation UI là API contract.
7. PUT category chưa có body; PUT profile/product chưa mô tả partial/full; delete chưa nêu cascade, soft delete hoặc idempotency.
8. FR-16 CSV và A JSON cần tách lớp; không gọi JSON endpoint bằng CSV rồi mặc định lỗi là bug.
9. SEC-01/04/05/07 có phần cần bằng chứng ngoài response API; thiếu bằng chứng không đồng nghĩa bug hay tuân thủ.
10. Tiềm năng ≥35 là đánh giá định tính. Chưa tạo danh sách case nên chưa có số lượng case hợp lệ, coverage hoặc kết quả thực thi. Các vấn đề thiếu đặc tả phải được giữ mở, không bịa oracle.

**Điểm dừng:** chỉ tài liệu phân tích này và bản ghi audit của tương tác; chờ sinh viên review trước mọi bước lựa chọn/thiết kế tiếp theo.


## 8. Quyết định lựa chọn chính thức của sinh viên

**Cập nhật ngày 27/11/2026 (Asia/Saigon), theo yêu cầu trực tiếp của sinh viên trong hội thoại.** Sinh viên cho biết đã review bản phân tích và quyết định chọn chính thức ba API dưới đây. AI chỉ ghi nhận quyết định này; không tự xác nhận sinh viên đã phê duyệt phần cập nhật mới hoặc các bước thiết kế/kiểm thử tiếp theo.

Các mục 1–7 được giữ nguyên như bản phân tích trước quyết định. Những câu “chưa chọn chính thức”, “chưa chốt một tổ hợp” và đề xuất ở mục 6 phản ánh thời điểm lập bản phân tích ban đầu; **trạng thái lựa chọn hiện tại được xác định bởi mục 8 này**. Các hạn chế và khoảng trống đặc tả ở bản phân tích cũ vẫn còn hiệu lực, chưa được quyết định lựa chọn giải quyết.

### 8.1. Danh sách chính thức

| Mã API chính thức | Pool | Feature ID chính | Method và endpoint | Đối chiếu mục 2 |
| --- | --- | --- | --- | --- |
| API 01 | A | FR-04 | `PUT /api/users/me` | A6 |
| API 02 | B | FR-10 | `PUT /api/orders/:id/cancel` | B6 |
| API 03 | C | FR-15 | `POST /api/products` | C1 |

Bộ ba có một API thuộc mỗi Pool A/B/C và khác cả ba API bạn cùng nhóm đã chọn: `POST /api/login`, `POST /api/checkout`, `PUT /api/admin/orders/:id/status`. Các API hỗ trợ đọc dữ liệu hoặc chuẩn bị trạng thái không được tính thành API lựa chọn thứ tư.

### 8.2. Lý do lựa chọn

**Căn cứ phân tích do AI tổng hợp từ các mục trước, không phải lời khai bổ sung về động cơ cá nhân của sinh viên:**

- **API 01:** FR-04 có miền số điện thoại rõ (bắt đầu bằng 0, dài 10–11 chữ số), giới hạn cập nhật hồ sơ chính mình và quy tắc cấm đổi role theo SEC-06. Có thể quan sát hồ sơ bằng API đọc tương ứng; công sức dữ liệu tương đối nhẹ. Phù hợp xem xét Domain Partitioning và Security.
- **API 02:** FR-10 cung cấp trạng thái và các chuyển đổi hủy đơn, điều kiện không cho user hủy khi shipping và ràng buộc trạng thái kết thúc. Bổ sung trọng tâm State Transition trực tiếp cho bộ ba. Đổi lại, cần nhiều đơn độc lập ở các trạng thái và phải giữ mở các điểm mơ hồ về quyền hủy.
- **API 03:** FR-15 có các ràng buộc đầu vào name/price/category rõ; FR-12 cho căn cứ kiểm tra quyền admin dù endpoint không có tiền tố admin. Dữ liệu category tương đối dễ chuẩn bị và không gặp ranh giới CSV/JSON của chức năng import. Phù hợp xem xét Domain Partitioning và Security.
- **Toàn bộ bộ ba:** bao quát hồ sơ cá nhân, nghiệp vụ trạng thái đơn và thao tác quản trị sản phẩm; có tiềm năng thiết kế nhiều tình huống độc lập. Đây vẫn là đánh giá định tính, không xác nhận đã đủ 35 case/API. Schema Validation còn bị giới hạn bởi hợp đồng response chưa đầy đủ; ST của hồ sơ/tạo sản phẩm không tự tương đương state machine FR-10.

### 8.3. Yêu cầu FR/SEC liên quan

Nguồn đặc tả: A và R được định nghĩa ở mục 1. Việc liên kết yêu cầu với từng API bên dưới là ánh xạ phân tích của AI dựa trên các nguồn đó.

| API | FR chính và liên quan | SEC liên quan trực tiếp | Yêu cầu có điều kiện hoặc giới hạn áp dụng |
| --- | --- | --- | --- |
| API 01 | **FR-04:** cập nhật name/phone/shipping address của chính mình; phone bắt đầu 0, 10–11 chữ số; không tự đổi role. A §2.2 nêu body và Bearer token. | **SEC-02:** JWT hợp lệ. **SEC-06:** client không được đổi role qua API hồ sơ. **SEC-05:** truy vấn dùng Parameterized Query. | **SEC-04** liên quan khi dữ liệu hồ sơ được hiển thị trên UI, không phải mặc định cấm ký tự HTML trong JSON. Không áp SEC-03 để bắt user thường phải có quyền admin khi sửa hồ sơ mình. |
| API 02 | **FR-10:** hủy pending/confirmed sang canceled; user không tự hủy shipping; delivered/canceled là trạng thái kết thúc; chuyển đổi không hợp lệ phải báo lỗi phù hợp. **FR-20** nhắc lại hủy chỉ ở pending/confirmed trong tính năng Mobile, làm nguồn đối chiếu, không mở rộng bài sang Pool D. **FR-11** chỉ quy định xem đơn của mình, chưa đủ để chốt quyền hủy đơn người khác. A §4.6 nêu endpoint/hủy trước khi giao; §4 yêu cầu Bearer token. | **SEC-02:** JWT hợp lệ. **SEC-05:** truy vấn dùng Parameterized Query. | **SEC-03** chỉ liên quan nếu khảo sát nhánh thao tác quản trị đã được xác định; không tự biến route cancel thành admin-only. FR-18 liên quan bối cảnh quản trị trạng thái, không đồng nghĩa sinh viên chọn thêm API admin status. |
| API 03 | **FR-15:** admin tạo sản phẩm; name bắt buộc, tối đa 255 ký tự; price bắt buộc, số >0; category bắt buộc, có sẵn. **FR-12:** thao tác ghi sản phẩm cần JWT hợp lệ và role admin. **FR-14** liên quan dữ liệu category hỗ trợ. A §3.3 nêu body name/price/description/imageUrl/category_id. | **SEC-02:** JWT hợp lệ. **SEC-03:** kiểm tra role admin trong token, không chỉ sự tồn tại của token. **SEC-05:** truy vấn dùng Parameterized Query. | **SEC-04** liên quan khi nội dung sản phẩm được render trên UI. Quy tắc FR-15 “chỉ sản phẩm mục tiêu thay đổi khi sửa” dành cho update, không chuyển nguyên xi thành yêu cầu riêng của POST. |

**SEC-01 và SEC-07** không có chức năng trực tiếp tương ứng trong ba endpoint đã chọn: bộ ba không đăng ký/đặt lại mật khẩu hoặc xử lý OTP. Chúng vẫn là yêu cầu của SUT ở mục 4; không tuyên bố đã được bao phủ hay kiểm chứng bởi bộ ba. SEC-04 cần ngữ cảnh UI, SEC-05 cần bằng chứng bổ sung để chứng minh cách tạo truy vấn; chưa có bằng chứng thực thi trong bước này.

### 8.4. Hạn chế tiếp tục giữ mở và điểm dừng

- Cả ba endpoint chưa có schema response/error đầy đủ, quy tắc exact match hoặc mã HTTP cụ thể cho mọi nhánh; không tự đặt expected result.
- API 01: chưa chốt partial/full update, miền name/address và chính sách email ở API. Quy tắc email không đổi qua giao diện không tự trở thành yêu cầu API.
- API 02: chưa chốt quyền hủy đơn người khác, quyền admin qua route cancel, cạnh shipping→canceled cho admin và self-transition/lặp hủy. Phải phân biệt câu chữ “chưa giao” trong A với ràng buộc chi tiết FR-10 trong R.
- API 03: chưa nêu giới hạn description, validation imageUrl, quy tắc trùng tên hoặc chi tiết ép kiểu. Không tự suy diễn từ payload ví dụ.
- Quyết định lựa chọn không phải phê duyệt test case, không xác nhận coverage ≥35 case/API và không xác nhận SUT tuân thủ FR/SEC.
- Chỉ ghi nhận quyết định và cập nhật audit ở bước này. Chưa sinh test case, chưa chuẩn bị/chạy dữ liệu, chưa sửa source SUT, chưa staging/commit/push. Dừng chờ sinh viên review phần cập nhật.
