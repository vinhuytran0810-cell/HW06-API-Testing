# Human Audit – API 01: PUT /api/users/me

## 1. Cách đánh giá
- VALID: Case phù hợp yêu cầu, có kết quả mong đợi kiểm chứng được.
- INVALID: Case sai yêu cầu hoặc sai logic.
- INCOMPLETE: Mục tiêu phù hợp nhưng còn thiếu thông tin hoặc kết quả mong đợi.

Quy ước khi sửa:
- B0 là body hợp lệ trong bản V2; U1 và U2 là hai tài khoản kiểm thử độc lập. Dùng GET `/api/users/me` để so sánh dữ liệu trước/sau, không chỉ dựa vào thông báo PUT. Reset dữ liệu giữa các hàng DDT. Mọi request API mang `X-Student-Id: 23120274`.
- Theo `backend/server.js:100–135`, response tham chiếu từ code là HTTP 200 `{"message":"Profile updated"}` khi thành công, 401 `{"error":"Unauthorized"}` khi thiếu token và 403 `{"error":"Forbidden"}` khi JWT không hợp lệ. GET trả thông tin user ở root. Đây là baseline từ source, không phải response schema chính thức trong API Specification. Không lưu password/token vào báo cáo.
- Ký hiệu **[Giả định]**: kết quả mong đợi do người kiểm thử đề xuất khi đề không quy định chi tiết. Với các nhánh từ chối input, mong đợi 4xx và dữ liệu không đổi là giả định robustness. Nếu chỉ vi phạm giả định hoặc khác baseline schema thì ghi nhận để xem xét, không tự kết luận bug FR/SEC. Luôn kiểm tra role và hồ sơ người khác không bị thay đổi.

## 2. Kết quả review và hiệu chỉnh

| Test Case ID | Verdict | Reason | Correction |
| --- | --- | --- | --- |
| TC-API01-001 | INCOMPLETE | Expected Result chưa nêu rõ giá trị tên và địa chỉ sau cập nhật. | Đặt dữ liệu cũ khác B0. Sau PUT, GET phải trả đúng cả name, phone và shipping_address trong B0; role và U2 không đổi. |
| TC-API01-002 | VALID | Phone 11 chữ số bắt đầu bằng 0, đúng biên trên FR-04. | Không cần sửa. |
| TC-API01-003 | INCOMPLETE | Nếu dữ liệu gửi trùng dữ liệu cũ thì có thể không phát hiện cập nhật trái phép. | Dùng snapshot U1/U2 khác B0, reset từng hàng DDT; thiếu token phải bị chặn, không đổi hồ sơ. Baseline 401 khi bỏ header, header rỗng hoặc chỉ Bearer. |
| TC-API01-004 | INCOMPLETE | Chưa bảo đảm dữ liệu phân biệt để phát hiện cập nhật trái phép. | Dùng snapshot khác B0. JWT sai định dạng phải bị chặn, U1/U2 không đổi; baseline 403. |
| TC-API01-005 | INCOMPLETE | Chưa mô tả rõ cách tạo JWT sai chữ ký. | Dùng JWT hợp lệ của tài khoản test, thay phần chữ ký bằng chữ ký không hợp lệ nhưng giữ cấu trúc JWT; kiểm tra token gốc hoạt động. Snapshot khác B0; token lỗi phải bị chặn, dữ liệu không đổi; baseline 403. |
| TC-API01-006 | INCOMPLETE | Chỉ kiểm tra U1 không đổi, chưa xác minh U2 cập nhật thành công. | Dùng JWT U2; snapshot U2 khác B0. GET U2 phải trả đủ ba trường B0, U1 và role không đổi. |
| TC-API01-007 | INCOMPLETE | IDOR có thể bị bỏ sót nếu dữ liệu U2 trùng B0. | Dùng ID thật của U2 và snapshot U2 khác B0. JWT U1 gửi id U2 trong body; U2 không được đổi. Nếu chấp nhận cập nhật thì chỉ U1 nhận B0. |
| TC-API01-008 | INCOMPLETE | Thiếu điều kiện phân biệt dữ liệu U2. | Dùng snapshot U2 khác B0, JWT U1 và user_id của U2 ở query. U2 không đổi; nếu cập nhật thì chỉ U1 nhận B0. |
| TC-API01-009 | VALID | Kiểm tra đúng SEC-06: client không được nâng role. | Không cần sửa logic; dùng GET để kiểm tra role thực tế. |
| TC-API01-010 | VALID | Kiểm tra hai lần cập nhật liên tiếp, có oracle sau từng lần. | Không cần sửa. |
| TC-API01-011 | VALID | Phone 9 chữ số nằm dưới biên dưới FR-04. | Không cần sửa. |
| TC-API01-012 | VALID | Phone 12 chữ số vượt biên trên FR-04. | Không cần sửa. |
| TC-API01-013 | VALID | Kiểm tra điều kiện phone phải bắt đầu bằng 0. | Không cần sửa. |
| TC-API01-014 | VALID | Kiểm tra phone chứa ký tự không phải chữ số. | Không cần sửa. |
| TC-API01-015 | INCOMPLETE | Đề không nói name có bắt buộc trong PUT hay không. | [Giả định] Bỏ name: từ chối hoặc giữ tên cũ và cập nhật đúng địa chỉ, phone; không làm mất tên cũ. |
| TC-API01-016 | INCOMPLETE | Chưa có quy tắc name nhận null. | [Giả định] Gửi name=null: từ chối hoặc bỏ qua name, giữ tên cũ; nếu bỏ qua thì hai trường còn lại cập nhật đúng. |
| TC-API01-017 | INCOMPLETE | Chưa có expected result cho tên rỗng hoặc toàn khoảng trắng. | [Giả định] Với từng hàng DDT, từ chối hoặc giữ tên cũ; nếu bỏ qua name thì cập nhật đúng hai trường còn lại. |
| TC-API01-018 | INCOMPLETE | Chưa rõ cách xử lý name sai kiểu. | [Giả định] Từ chối hoặc bỏ qua giá trị sai kiểu, không ghi đè tên bằng số, boolean, array hoặc object; nếu bỏ qua thì hai trường còn lại cập nhật đúng. |
| TC-API01-019 | INCOMPLETE | Chưa xác định cách xử lý chữ số Unicode. | [Giả định] Giữ phone cũ nếu từ chối/bỏ qua, hoặc chuẩn hóa đúng thành 0912345678; không lưu số sai định dạng đã chọn (ASCII). |
| TC-API01-020 | INCOMPLETE | Chưa xác định kết quả chuẩn hóa phone. | [Giả định] Với từng hàng DDT, giữ phone cũ nếu từ chối/bỏ qua hoặc chuẩn hóa đúng số điện thoại tương ứng; không tự đổi thành số khác. Kiểm tra kết quả theo FR-04. |
| TC-API01-021 | INCOMPLETE | Chưa rõ cách xử lý request không body. | [Giả định] Gửi request thật sự không có body; từ chối hoặc không cập nhật, dữ liệu hồ sơ giữ nguyên. |
| TC-API01-022 | INCOMPLETE | Chưa có expected result cho object rỗng. | [Giả định] Gửi {}; từ chối hoặc không cập nhật, cả ba trường giữ nguyên. |
| TC-API01-023 | INCOMPLETE | Chưa rõ cách xử lý body không phải JSON object. | [Giả định] Giữ raw JSON từng hàng DDT; từ chối hoặc không cập nhật, hồ sơ giữ nguyên. |
| TC-API01-024 | VALID | JSON sai cú pháp không cung cấp body hợp lệ để cập nhật. | Không cần sửa; chỉ kiểm tra dữ liệu hồ sơ không đổi, không áp schema lỗi auth. |
| TC-API01-025 | INCOMPLETE | Đề không quy định cách xử lý Content-Type thiếu hoặc sai. | [Giả định] Kiểm tra header thực gửi. Nếu body được đọc thì lưu đúng B0; nếu không đọc được thì từ chối hoặc không cập nhật, không xóa dữ liệu. |
| TC-API01-026 | INCOMPLETE | Chưa nêu rõ expected result của tên tiếng Việt. | [Giả định] GET trả đúng tên tiếng Việt trong Test Data (cho phép biểu diễn Unicode tương đương), không mất dấu; phone và địa chỉ đúng B0. |
| TC-API01-027 | INCOMPLETE | Chưa có quy tắc xử lý key JSON trùng. | [Giả định] Gửi raw JSON giữ cả hai key name. Từ chối hoặc lưu một trong hai tên đã gửi; nếu cập nhật thì phone và địa chỉ đúng B0. |
| TC-API01-028 | INCOMPLETE | Quy định cấm đổi email trên UI chưa đủ để kết luận API. | [Giả định] Gửi email mới cùng B0; email cũ giữ nguyên vì ngoài phạm vi cập nhật mô tả ở mục 2.2. Có thể từ chối hoặc cập nhật đúng B0 và bỏ qua email. |
| TC-API01-029 | INCOMPLETE | Chưa rõ cách xử lý thuộc tính dư. | [Giả định] Gửi B0 kèm extra; từ chối hoặc bỏ qua extra và lưu đúng B0. Các thuộc tính ngoài phạm vi cập nhật không đổi. |
| TC-API01-030 | VALID | Kiểm tra gửi lại cùng body không làm sai dữ liệu hồ sơ. | Không cần sửa. |
| TC-API01-031 | VALID | Có oracle black-box kiểm tra dữ liệu và quyền khi nhập chuỗi SQL. | Không cần sửa; không kết luận đã chứng minh SEC-05 chỉ từ API. |
| TC-API01-032 | INCOMPLETE | Response JSON không chứng minh dữ liệu được escape khi hiển thị. | Sau PUT, GET kiểm tra marker; nếu lưu được, mở lại trang Profile và kiểm tra marker chỉ là text/value, không tạo HTML từ dữ liệu. Nếu không quan sát được render thì đánh dấu checkpoint SEC-04 bị BLOCKED. |
| TC-API01-033 | INCOMPLETE | Chưa rõ địa chỉ có bắt buộc phải gửi. | [Giả định] Bỏ shipping_address: từ chối hoặc giữ địa chỉ cũ và cập nhật đúng name/phone; không làm mất địa chỉ. |
| TC-API01-034 | INCOMPLETE | Quy tắc định dạng phone không nói phone bắt buộc phải gửi. | [Giả định] Bỏ phone: từ chối hoặc giữ phone cũ và cập nhật đúng name/địa chỉ. |
| TC-API01-035 | INCOMPLETE | Chưa rõ địa chỉ có thể nhận null. | [Giả định] Từ chối hoặc bỏ qua null, giữ địa chỉ cũ; nếu bỏ qua thì cập nhật đúng name/phone. |
| TC-API01-036 | INCOMPLETE | Chưa rõ có được xóa phone bằng null. | [Giả định] Từ chối hoặc bỏ qua null, giữ phone cũ; nếu bỏ qua thì cập nhật đúng name/địa chỉ. |
| TC-API01-037 | INCOMPLETE | Chưa có quy tắc cho địa chỉ rỗng hoặc toàn khoảng trắng. | [Giả định] Cho phép lưu chuỗi đã gửi hoặc chuỗi đã trim, hoặc từ chối giữ dữ liệu cũ. Nếu cập nhật thì name/phone đúng B0. |
| TC-API01-038 | INCOMPLETE | Chưa rõ có được xóa phone bằng chuỗi rỗng. | [Giả định] Từ chối hoặc bỏ qua phone rỗng/toàn khoảng trắng, giữ phone cũ; nếu bỏ qua thì cập nhật đúng name/địa chỉ. |
| TC-API01-039 | INCOMPLETE | Chưa rõ cách xử lý địa chỉ sai kiểu. | [Giả định] Từ chối hoặc bỏ qua giá trị sai kiểu, giữ địa chỉ cũ; nếu bỏ qua thì cập nhật đúng name/phone. |
| TC-API01-040 | INCOMPLETE | Chưa rõ cách xử lý phone sai kiểu. | [Giả định] Từ chối hoặc bỏ qua phone sai kiểu, giữ phone cũ; nếu bỏ qua thì cập nhật đúng name/địa chỉ. Không lưu số vi phạm FR-04. |
| TC-API01-041 | INCOMPLETE | Chưa nêu rõ expected result của địa chỉ tiếng Việt. | [Giả định] GET trả đúng địa chỉ tiếng Việt trong Test Data (cho phép Unicode tương đương), không mất dấu; name/phone đúng B0. |
| TC-API01-042 | INCOMPLETE | Chưa có quy tắc trim name. | [Giả định] Chấp nhận tên giữ nguyên hoặc bỏ khoảng trắng đầu/cuối; không mất nội dung tên; địa chỉ/phone đúng B0. |
| TC-API01-043 | INCOMPLETE | Chưa có quy tắc trim địa chỉ. | [Giả định] Chấp nhận địa chỉ giữ nguyên hoặc bỏ khoảng trắng đầu/cuối; không mất nội dung địa chỉ; name/phone đúng B0. |
| TC-API01-044 | VALID | Kiểm tra chuỗi SQL ở trường địa chỉ với oracle về dữ liệu và quyền. | Không cần sửa; giữ giới hạn black-box của SEC-05. |
| TC-API01-045 | VALID | Kiểm tra role không bị thay đổi bằng các giá trị khác kiểu. | Không cần sửa logic; hàng role=user chỉ là đối chứng, không chứng minh chặn thay đổi role. |
| TC-API01-046 | INCOMPLETE | Dữ liệu U2 có thể trùng B0, làm sai kết quả kiểm tra IDOR. | Dùng user_id thật của U2 trong body, snapshot U2 khác B0 và JWT U1. U2 không đổi; nếu cập nhật thì chỉ U1 nhận B0. |
| TC-API01-047 | INCOMPLETE | Chưa rõ cách xử lý query dư. | [Giả định] So với request B0 không có query dư; từ chối hoặc bỏ qua query và lưu đúng B0, dữ liệu ngoài phạm vi không đổi. |
| TC-API01-048 | INCOMPLETE | Chưa rõ cách xử lý header dư. | [Giả định] So với request B0 không có X-Extra; từ chối hoặc bỏ qua header dư và lưu đúng B0. Giữ X-Student-Id trong cả hai request. |
| TC-API01-049 | VALID | Kiểm tra đổi tên và giữ nguyên phone, địa chỉ với body đầy đủ. | Không cần sửa. |
| TC-API01-050 | VALID | Kiểm tra đổi địa chỉ và giữ nguyên name, phone với body đầy đủ. | Không cần sửa. |

## 3. Tổng kết

| Kết quả review ban đầu | Số lượng |
| --- | ---: |
| VALID | 14 |
| INVALID | 0 |
| INCOMPLETE | 36 |
| Tổng | 50 |