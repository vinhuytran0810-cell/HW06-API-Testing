# API 01 — Extend

API: `PUT /api/users/me` — FR-04

## TC-API01-051 — Sai authentication scheme

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-051 |
| Requirement / Technique | API Specification §2; SEC-02; Security Testing |
| Mục tiêu | Kiểm tra API có yêu cầu đúng Bearer scheme hay chỉ kiểm tra JWT. |
| Tiền điều kiện | U1 có JWT hợp lệ; GET bằng Bearer hoạt động; snapshot U1 khác B0. |
| Test Data | B0; `Authorization: Basic {{token_U1}}`; Content-Type application/json. |
| Các bước | 1. GET hồ sơ U1 với Bearer hợp lệ. 2. PUT B0 với scheme Basic thay cho Bearer. 3. GET lại bằng Bearer hợp lệ. 4. Khôi phục fixture nếu cần. |
| Expected Result | Request sai scheme bị từ chối theo hợp đồng Bearer; hồ sơ và role U1 không đổi. Không bắt buộc mã lỗi cụ thể. |
| Why AI missed | V2 tập trung thiếu token, JWT sai cấu trúc và sai chữ ký (003–005); chưa thử JWT hợp lệ nhưng sai scheme. |

## TC-API01-052 — JWT hết hạn

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-052 |
| Requirement / Technique | SEC-02; Security Testing; JWT expiration |
| Mục tiêu | Kiểm tra JWT có chữ ký đúng nhưng đã hết hạn không được dùng để cập nhật. |
| Tiền điều kiện | Có fixture JWT thử nghiệm của U1 được ký hợp lệ cho SUT, với exp đã qua; có token còn hiệu lực cùng U1 để đối chứng; snapshot khác B0. Nếu chưa tạo được fixture thì BLOCKED. |
| Test Data | B0; `Authorization: Bearer {{expired_token_U1}}`; Content-Type application/json. |
| Các bước | 1. GET bằng token còn hiệu lực, lưu snapshot. 2. PUT bằng token hết hạn. 3. GET bằng token còn hiệu lực và đối chiếu. 4. Khôi phục fixture nếu cần. |
| Expected Result | JWT có exp trong quá khứ bị từ chối; dữ liệu và role không đổi. Không đặt yêu cầu thời lượng TTL hoặc kết luận token không có exp là bug chỉ từ case này. |
| Why AI missed | Các case 003–005 chỉ kiểm tra sự tồn tại, cấu trúc và chữ ký. V2 chưa có case kiểm tra thời hạn của JWT. |

## TC-API01-053 — Không được đổi mật khẩu qua API hồ sơ

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-053 |
| Requirement / Technique | FR-04; API Specification §2.2 (chỉ thông tin cơ bản); Mass Assignment |
| Mục tiêu | Kiểm tra không thể thay đổi thông tin xác thực bằng trường password ngoài phạm vi PUT hồ sơ. |
| Tiền điều kiện | U1 là tài khoản test, biết mật khẩu cũ; xác nhận login thành công; mật khẩu thử mới khác mật khẩu cũ; snapshot U1 khác B0. |
| Test Data | B0 thêm `password: {{new_test_password}}`; Bearer U1; Content-Type application/json. |
| Các bước | 1. Login bằng mật khẩu cũ và GET snapshot. 2. PUT với body trên. 3. Login lại bằng mật khẩu cũ; GET hồ sơ, so role. 4. Khôi phục dữ liệu cơ bản nếu cần; nếu mật khẩu cũ không còn dùng được, dừng và xác minh nguyên nhân bằng fixture được phép. |
| Expected Result | Mật khẩu cũ vẫn đăng nhập được; role không đổi. PUT có thể từ chối thuộc tính dư hoặc bỏ qua password, không quy định mã lỗi hay bắt buộc cập nhật B0 khi có field dư. Nếu login cũ thất bại, kiểm tra nguyên nhân trước khi kết luận lỗi. |
| Why AI missed | Case 029 chỉ dùng extra chung; case 009/045 kiểm tra role. Chưa có oracle riêng về thông tin xác thực qua login sau PUT. |

## TC-API01-054 — Cập nhật hợp lệ, không hợp lệ, rồi hợp lệ

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-054 |
| Requirement / Technique | FR-04; State/Data Testing; BVA |
| Mục tiêu | Kiểm tra tính hợp lệ của phone xuyên suốt chuỗi cập nhật và khả năng cập nhật lại sau dữ liệu sai. |
| Tiền điều kiện | JWT U1 hợp lệ; phone cũ hợp lệ và khác phone B0; U2 có snapshot riêng. |
| Test Data | A = B0; B = B0 thay phone thành `091234567` (9 chữ số); C = B0 thay phone thành `09123456789` (11 chữ số). Cả ba dùng Bearer U1, Content-Type application/json. |
| Các bước | 1. GET snapshot. 2. PUT A, GET kiểm tra. 3. PUT B, GET kiểm tra. 4. PUT C, GET kiểm tra. 5. GET U2, so snapshot; cleanup. |
| Expected Result | Sau A, ba trường đúng A. Sau B, phone không được lưu dưới dạng vi phạm FR-04; không áp đặt rollback toàn bộ hoặc cách chuẩn hóa chưa được quy định. Sau C, ba trường đúng C. Role và hồ sơ U2 không đổi. |
| Why AI missed | Case 010 chỉ gồm hai cập nhật hợp lệ, case 011 kiểm tra biên sai riêng lẻ. Chưa kết hợp một lần cập nhật sai ở giữa và kiểm tra khả năng phục hồi. |

## TC-API01-055 — Hai người dùng cập nhật xen kẽ

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-055 |
| Requirement / Technique | FR-04; SEC-02; State/Data Testing; Isolation |
| Mục tiêu | Kiểm tra mỗi PUT luôn sử dụng đúng danh tính JWT khi đổi người dùng giữa các request liên tiếp. |
| Tiền điều kiện | U1/U2 có token và ID riêng; snapshot của cả hai khác dữ liệu đích; dữ liệu A/B/C phân biệt; không có request khác cập nhật đồng thời. |
| Test Data | A = B0; B = {"name":"Tran Van B","shipping_address":"45 Nguyen Trai, Q5","phone":"0987654321"}; C = B0 thay name thành `Nguyen Van C`, phone thành `09123456789`. Bearer lần lượt U1, U2, U1; Content-Type application/json. |
| Các bước | 1. GET snapshot cả hai. 2. U1 PUT A; GET cả hai. 3. U2 PUT B; GET cả hai. 4. U1 PUT C; GET cả hai. 5. Cleanup từng tài khoản. |
| Expected Result | Sau lần 1 U1=A, U2 giữ snapshot. Sau lần 2 U1=A, U2=B. Sau lần 3 U1=C, U2=B. Mỗi lần so cả ba trường và role của từng user; không dùng token của user này cho GET user kia. |
| Why AI missed | Case 006 kiểm tra một lần cập nhật U2; case 010 kiểm tra nhiều lần nhưng cùng U1. Chưa thử chuỗi chuyển danh tính U1 → U2 → U1 và kiểm tra cả hai sau mỗi lần. |
