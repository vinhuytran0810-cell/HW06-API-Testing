# API 01 — Bước 6: Bản test case AI-generated gốc

- **API:** `PUT /api/users/me` — FR-04 — Pool A; MSSV 23120274.
- **Skill:** [api-test-generator](../../.agents/skills/api-test-generator/SKILL.md), mục 4, Bước 6.
- **Trạng thái bản gốc:** AI-generated, chưa Human Audit, chưa Extend, chưa Execute. Không có nhãn VALID/INVALID/INCOMPLETE của con người, kết quả PASS/FAIL hoặc phê duyệt test case.
- **Căn cứ:** sử dụng bước 1–5 theo yêu cầu sinh viên cho biết đã chấp nhận; các mục TBD của những bước đó không tự trở thành yêu cầu đã xác định.
- Chỉ sinh bản nháp ở bước 6 và thống kê theo yêu cầu; **chưa thực hiện bước 7** hoặc phân tích implementation.

## 1. Nguồn và cách truy vết

| Ký hiệu | Nguồn |
| --- | --- |
| A | [Đặc tả API](../../specs/api_specification.md), §2–2.2; §1.2 cho login hỗ trợ |
| R | [Yêu cầu SUT](../../eshop-sut/README.md), FR-04 và SEC-01–SEC-07 |
| C | [01-contract-analysis.md](01-contract-analysis.md) |
| D | [02-domain-analysis.md](02-domain-analysis.md) |
| S | [03-state-analysis.md](03-state-analysis.md) |
| Q | [04-security-analysis.md](04-security-analysis.md) |
| Z | [05-schema-analysis.md](05-schema-analysis.md) |
| G | [AGENTS.md](../../AGENTS.md) |

Mỗi case có đủ bảy trường theo Skill: Test Case ID, Requirement / Technique, Mục tiêu, Tiền điều kiện, Test Data, Các bước, Expected Result; thêm nhãn mức độ oracle để phân biệt.

### Phân loại oracle

- **XĐ:** oracle **chính về nghiệp vụ/quyền** có căn cứ và có thể phân định nếu fixture/nguồn quan sát được xác nhận. Không đồng nghĩa toàn bộ response contract đã biết hoặc case sẵn sàng chạy.
- **TBD:** oracle chính còn thiếu policy/ánh xạ dữ liệu hoặc bằng chứng bổ sung. Đây là case nháp chờ làm rõ, không được tính là case đủ oracle/sẵn sàng thực thi. Oracle phụ có căn cứ không thay thế phần chính đang thiếu.
- **Mọi case:** HTTP status chính xác, success/error response schema đều **TBD**. Không tự đặt code, exact keys, nullable/type của response, error message hoặc latency.
- **BLOCKED khi thực thi sau này:** nếu không tạo được fixture, chưa có cách quan sát dữ liệu/role đủ tin cậy hoặc primary oracle còn TBD. Không tự đánh PASS vì không quan sát được thay đổi. Hiện tại chưa chạy nên không gán trạng thái thực thi cho case nào.

## 2. Quy ước dữ liệu và request dùng chung

### 2.1. Request mục tiêu

- Method/path mặc định: `PUT {{baseUrl}}/api/users/me`; base URL tài liệu là `http://localhost:3000`, chưa kiểm tra server.
- `H(U1)`: **X-Student-Id: 23120274**, `Authorization: Bearer {{token_U1}}`, `Content-Type: application/json`.
- `H(U2)`: tương tự H(U1), thay token bằng `{{token_U2}}`.
- `Content-Type: application/json` là cách đóng gói dự kiến cho body JSON, **không phải khẳng định SUT bắt buộc header này**. Case thay media type ghi rõ ngoại lệ.
- Case bỏ/sửa Authorization chỉ thay header đó; **không bao giờ bỏ X-Student-Id**.
- Không có path parameter; query mặc định không gửi, trừ case ghi rõ.

Body nền `B0` lấy từ ví dụ A §2.2, không phải schema:

```json
{
  "name": "Nguyen Van A",
  "shipping_address": "123 Le Loi, Q1, TP.HCM",
  "phone": "0912345678"
}
```

“B0 thay field” nghĩa clone B0 rồi thay đúng field; “bỏ field” là xóa key khỏi body, khác `null`, `""` và `"null"`. Field ngoài mẫu vẫn chỉ là dữ liệu khảo sát, không được coi là tham số SUT hỗ trợ. Raw JSON có khóa lặp/JSON hỏng phải giữ nguyên bytes minh họa, không serialize qua object làm mất mục tiêu.

### 2.2. Fixture và API hỗ trợ

- Hai user thử nghiệm U1/U2, token và ID riêng phải được xác nhận; U1 là user thường với role đã biết. Không dùng credential thật hoặc in token/password trong tài liệu.
- `{{token_U1}}`, `{{token_U2}}`, `<ID_U2>` và token sai chữ ký là tham chiếu fixture, chưa tạo và không phải dữ liệu đã thực nghiệm.
- Hồ sơ trước request phải biết; với cập nhật dự kiến thành công, chọn fixture có giá trị mục tiêu khác B0 để tránh che khuất việc không cập nhật. Dữ liệu thử nghiệm cô lập, không có cập nhật cạnh tranh.
- **GET /api/users/me** bằng token U1/U2 có thể hỗ trợ snapshot. GET cũng phải có **X-Student-Id: 23120274** và Bearer của đúng user. Chưa có GET schema nên không tự đoán JSONPath; thiếu mapping thì BLOCKED.
- Nếu cần lấy phiên: **POST /api/login** với email/password của tài khoản thử nghiệm đã được cấp, body theo A §1.2; header **X-Student-Id: 23120274**, đóng gói JSON. Đây chỉ là request hỗ trợ dự kiến; chưa thực hiện, không tính vào số case PUT.
- Role/quyền thực tế cần nguồn quan sát đáng tin cậy đã được phép. Echo trong PUT response hoặc token cũ không đủ; không tự thêm admin API/DB/code để xác minh.
- Khôi phục bằng PUT hồ sơ chỉ khi policy/fixture cho phép và chỉ cho dữ liệu cơ bản. **Mọi PUT khôi phục cũng có X-Student-Id: 23120274**, Bearer đúng chủ thể, JSON body phù hợp. Không ghi role để cleanup. Nếu phát hiện đổi quyền hoặc không thể phục hồi an toàn, dừng sử dụng fixture và báo sinh viên, không tự sửa DB/source.
- Không tự tạo user hoặc cài môi trường để hiện thực tiền điều kiện trong bước sinh case này.

### 2.3. Quy trình P được tham chiếu trong từng case

1. **P1 — Setup/quan sát:** xác nhận các fixture và oracle cần dùng; đọc snapshot U1/U2 bằng GET có header sinh viên, xác nhận nguồn role nếu case cần. Chưa làm rõ thì ghi chờ/BLOCKED trong giai đoạn thực thi, không thay oracle bằng hành vi hiện tại.
2. **P2 — Request mục tiêu:** gửi PUT theo Test Data của case, giữ header sinh viên cho mọi lần gửi. Chỉ gửi theo thiết kế khi giai đoạn Execute được yêu cầu; hiện tại chỉ là bước dự kiến.
3. **P3 — Verify:** ghi nhận response phục vụ CP-OBS-01–03 của Z, che thông tin xác thực; đọc lại snapshot bằng request hỗ trợ có header sinh viên; so oracle chính và các checkpoint liên quan. Không suy role lưu trữ từ echo hoặc tự gán response contract.
4. **P4 — Cleanup:** khôi phục/giải phóng fixture theo §2.2 khi khả thi; ghi vấn đề nếu không thể. Không tự sửa source/DB hoặc dùng quyền mới phát sinh do bug để cleanup.

DDT trong một case là một nhóm đại diện của cùng mục tiêu. Mỗi hàng DDT dùng baseline/snapshot riêng hoặc reset giữa các hàng, xét kết quả riêng; **không tăng số case theo số hàng, request hỗ trợ hoặc assertion**. Không giả định mọi hàng trong nhóm có cùng phản hồi khi policy chưa rõ.

## 3. Danh sách case gốc

### TC-API01-001 — Cập nhật hồ sơ theo mẫu, phone tại biên 10 chữ số

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-001 |
| Requirement / Technique | FR-04; SEC-02/06; D DP-NAME-01, DP-ADDR-01, DP-PHONE-01, BVA-PHONE-02; S ST-DATA-01, POST-01; Q SA-AUTH-01; Z SC-FIELD-01/02/03, CP-DATA-01 |
| Mục tiêu | Cập nhật hồ sơ theo mẫu, phone tại biên 10 chữ số. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. B0; H(U1); không query. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Phone mẫu thỏa FR-04; tác vụ được phép là cập nhật chính U1 và role không đổi. Oracle cập nhật thành công/giá trị canonical còn thiếu ở GAP-02/07/08: chưa chốt phép so sánh chính xác từng field, cách nhận biết thành công hoặc thời điểm đọc lại. Không PASS chỉ vì response trông thành công. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-002 — Phone tại biên trên 11 chữ số

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-002 |
| Requirement / Technique | FR-04; D DP-PHONE-02, BVA-PHONE-03; S INV-04, POST-01; Z SC-FIELD-03, CP-PHONE-01 |
| Mục tiêu | Phone tại biên trên 11 chữ số. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. B0 thay phone bằng chuỗi "09123456789"; H(U1). |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | 11 chữ số đầu 0 thỏa FR-04, không được tự coi không hợp lệ vì đầu số nhà mạng. Hậu điều kiện cập nhật/normalization và response vẫn TBD; cần xác nhận oracle lưu/đọc trước khi đưa case vào nhóm đủ oracle. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-003 — Không cung cấp thông tin xác thực

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-003 |
| Requirement / Technique | SEC-02; FR-04; D DP-AUTH-02/03; S ST-DATA-04, INV-03; Q SA-AUTH-02; Z CP-AUTH-01, SC-ERR-01 |
| Mục tiêu | Không cung cấp thông tin xác thực. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. B0. DDT: (a) bỏ Authorization; (b) Authorization là chuỗi rỗng; (c) Authorization: Bearer không có token. Giữ Content-Type và X-Student-Id. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Không request nào được cập nhật hồ sơ bằng quyền không xác thực. So snapshot các user thử nghiệm liên quan, không chỉ response. Đánh giá từng hàng DDT; một hàng cập nhật trái phép là vi phạm oracle. Status/message/schema riêng TBD. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **XĐ — oracle chính về quyền đã xác định; status/schema và điều kiện quan sát còn thiếu.** |

### TC-API01-004 — Token không có cấu trúc JWT hợp lệ

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-004 |
| Requirement / Technique | FR-04 (API mục tiêu); SEC-02; D DP-AUTH-04; S ST-DATA-04, INV-03; Q SA-AUTH-03; Z CP-AUTH-01 |
| Mục tiêu | Token không có cấu trúc JWT hợp lệ. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. B0; Authorization: Bearer not-a-jwt; các header còn lại theo H(U1). |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Không thực hiện cập nhật trái phép; dữ liệu hồ sơ thử nghiệm đối chiếu không đổi do request này. Status/error schema TBD. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **XĐ — oracle chính về quyền đã xác định; status/schema và điều kiện quan sát còn thiếu.** |

### TC-API01-005 — Token có chữ ký đã xác định không hợp lệ

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-005 |
| Requirement / Technique | FR-04 (API mục tiêu); SEC-02; D DP-AUTH-05; S ST-DATA-04, INV-03; Q SA-AUTH-04; Z CP-AUTH-01 |
| Mục tiêu | Token có chữ ký đã xác định không hợp lệ. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Cần fixture token có tình trạng chữ ký không hợp lệ được xác nhận độc lập. Không tự đoán thuật toán/claims; chưa có fixture thì BLOCKED, không tự coi placeholder là token đã kiểm tra. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. B0; Authorization: Bearer <JWT_SAI_CHỮ_KÝ_ĐÃ_XÁC_ĐỊNH>; các header còn lại theo H(U1). |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Không chấp nhận danh tính từ token không hợp lệ để cập nhật hồ sơ. Không có cập nhật trái phép; response TBD. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **XĐ — oracle chính về quyền đã xác định; status/schema và điều kiện quan sát còn thiếu.** |

### TC-API01-006 — Danh tính U2 phải tương ứng hồ sơ U2

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-006 |
| Requirement / Technique | FR-04; SEC-02; D DP-AUTH-08; S ST-DATA-11, INV-01; Q SA-IDOR-03; Z CP-OWNER-01 |
| Mục tiêu | Danh tính U2 phải tương ứng hồ sơ U2. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U2); B0. Snapshot U1 là đối chứng. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Request có danh tính U2 không được làm thay đổi hồ sơ U1. Không coi token U2 là sai chỉ vì baseline đang dùng U1; nếu cập nhật được chấp nhận thì đối tượng phải là U2. Oracle chính là cô lập U1, không dùng từ chối mọi request làm bằng chứng tính đúng của cập nhật U2. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **XĐ — oracle chính về quyền đã xác định; status/schema và điều kiện quan sát còn thiếu.** |

### TC-API01-007 — Không đổi chủ thể bằng định danh trong body

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-007 |
| Requirement / Technique | FR-04; D DP-ID-01; S ST-DATA-02, INV-01; Q SA-IDOR-01; Z SC-FIELD-06, CP-OWNER-01 |
| Mục tiêu | Không đổi chủ thể bằng định danh trong body. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); DDT: B0 thêm id=<ID_U2>; B0 thêm user_id=<ID_U2>, từng hàng chỉ một tên field. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | P_U2_sau = P_U2_trước đối với request xác thực là U1. U1 được cập nhật hay toàn request bị từ chối/field dư bị bỏ qua đều TBD; không yêu cầu một status cụ thể. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **XĐ — oracle chính về quyền đã xác định; status/schema và điều kiện quan sát còn thiếu.** |

### TC-API01-008 — Không đổi chủ thể bằng query ngoài khai báo

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-008 |
| Requirement / Technique | FR-04; D DP-QUERY-02; S INV-01; Q SA-IDOR-02; Z SC-REQ-02, CP-OWNER-01 |
| Mục tiêu | Không đổi chủ thể bằng query ngoài khai báo. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); B0; query user_id=<ID_U2>. Không tạo path /users/:id. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Không sửa U2 bằng quyền U1. Parse/ignore/reject query dư và tác động lên U1 chưa được đặc tả, không lấy echo ID làm oracle. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **XĐ — oracle chính về quyền đã xác định; status/schema và điều kiện quan sát còn thiếu.** |

### TC-API01-009 — Role không bị thay đổi bởi Mass Assignment

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-009 |
| Requirement / Technique | FR-04; SEC-06; D DP-ROLE-02/03/04; S ST-DATA-03/12, INV-02; Q SA-ROLE-01/02; Z SC-FIELD-04, CP-ROLE-01 |
| Mục tiêu | Role không bị thay đổi bởi Mass Assignment. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Cần nguồn quan sát role/quyền thực tế đáng tin cậy, chưa xác nhận GET trả role. Nếu chỉ có echo response/token cũ thì BLOCKED kết luận oracle; không tự mở rộng sang thực thi admin API. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1), U1 role=user đã biết; B0 thêm role. DDT: "admin", "user", null, 123, [], {}. Mỗi hàng chỉ thêm một giá trị role. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Role thực tế của U1 không đổi qua request, kể cả khi field cơ bản thay đổi. Không yêu cầu reject toàn request hoặc rollback field cơ bản. Nhãn Role Escalation/Mass Assignment chỉ gắn cùng một case; status/schema TBD. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **XĐ — oracle chính về quyền đã xác định; status/schema và điều kiện quan sát còn thiếu.** |

### TC-API01-010 — Hai cập nhật liên tiếp và dữ liệu lần sau

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-010 |
| Requirement / Technique | FR-04; S ST-DATA-10, POST-01; C GAP-01/02/08; Z CP-DATA-01 |
| Mục tiêu | Hai cập nhật liên tiếp và dữ liệu lần sau. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); PUT thứ nhất B0; PUT thứ hai B0 thay phone="09123456789". Cả hai request có X-Student-Id: 23120274. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có. Gửi hai PUT theo thứ tự, quan sát sau từng PUT theo P; không chạy song song, không dùng kết quả request đầu làm expected result cho request sau. 3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Nếu từng cập nhật được chấp nhận thì field được chấp nhận phản ánh cập nhật tương ứng. Chưa có cách nhận diện thành công, canonical mapping/thời điểm đọc, nên oracle chuỗi còn TBD; không chốt cơ chế merge hoặc rollback. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-011 — Phone ngay dưới biên dưới: 9 chữ số

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-011 |
| Requirement / Technique | FR-04; D DP-PHONE-03, BVA-PHONE-01; S ST-DATA-05, INV-04; C GAP-03/06; Z SC-FIELD-03, SC-ERR-04 |
| Mục tiêu | Phone ngay dưới biên dưới: 9 chữ số. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); B0 thay phone="091234567". |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Không đủ tối thiểu 10 chữ số theo FR-04 đối với giá trị nguyên dạng. Chưa đặc tả reject/normalize, hiệu ứng các field khác hoặc error contract. Không tự chốt toàn request thất bại/rollback; chờ policy để hoàn thiện oracle. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-012 — Phone ngay trên biên trên: 12 chữ số

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-012 |
| Requirement / Technique | FR-04; D DP-PHONE-04, BVA-PHONE-04; S ST-DATA-05, INV-04; C GAP-03/06; Z SC-FIELD-03, SC-ERR-04 |
| Mục tiêu | Phone ngay trên biên trên: 12 chữ số. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); B0 thay phone="091234567890". |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Vượt tối đa 11 chữ số theo FR-04 đối với giá trị nguyên dạng. Chưa đặc tả reject/normalize, hiệu ứng các field khác hoặc error contract. Không tự chốt toàn request thất bại/rollback; chờ policy để hoàn thiện oracle. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-013 — Phone 10 chữ số không bắt đầu 0

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-013 |
| Requirement / Technique | FR-04; D DP-PHONE-05; S ST-DATA-05, INV-04; C GAP-03/06; Z SC-FIELD-03, SC-ERR-04 |
| Mục tiêu | Phone 10 chữ số không bắt đầu 0. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); B0 thay phone="1912345678". |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Vi phạm ký tự đầu 0 theo FR-04 đối với giá trị nguyên dạng. Chưa đặc tả reject/normalize, hiệu ứng các field khác hoặc error contract. Không tự chốt toàn request thất bại/rollback; chờ policy để hoàn thiện oracle. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-014 — Phone chứa chữ cái trong chuỗi dài 10

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-014 |
| Requirement / Technique | FR-04; D DP-PHONE-06; S ST-DATA-05, INV-04; C GAP-03/06; Z SC-FIELD-03, SC-ERR-04 |
| Mục tiêu | Phone chứa chữ cái trong chuỗi dài 10. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); B0 thay phone="09123A5678". |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Không phải chuỗi toàn chữ số theo FR-04 đối với giá trị nguyên dạng. Chưa đặc tả reject/normalize, hiệu ứng các field khác hoặc error contract. Không tự chốt toàn request thất bại/rollback; chờ policy để hoàn thiện oracle. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-015 — Bỏ sót từng field khai báo trong PUT

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-015 |
| Requirement / Technique | FR-04; D DP-NAME-02, DP-ADDR-02, DP-PHONE-08, DP-BODY-05; S ST-DATA-06; Z SC-REQ-06 |
| Mục tiêu | Bỏ sót từng field khai báo trong PUT. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); DDT từ B0: bỏ name; bỏ shipping_address; bỏ phone, từng hàng bỏ đúng một field. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Oracle TBD: chưa rõ required/optional, giữ giá trị cũ, xóa hay từ chối. Ghi chính xác field vắng, không thay bằng null. Không áp required của FR-01. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-016 — Null cho từng field khai báo

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-016 |
| Requirement / Technique | FR-04; D DP-NAME-03, DP-ADDR-03, DP-PHONE-09; S ST-DATA-07; Z SC-FIELD-01/02/03 |
| Mục tiêu | Null cho từng field khai báo. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); DDT B0: một trong name/shipping_address/phone nhận null; các field khác giữ B0. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Nullable/xóa dữ liệu/ép kiểu/reject còn TBD cho từng field. Không tự khẳng định null bị cấm hoặc phone bắt buộc trong request. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-017 — Chuỗi rỗng và chỉ khoảng trắng

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-017 |
| Requirement / Technique | FR-04; D DP-NAME-03, DP-ADDR-03, DP-PHONE-09; S ST-DATA-07; Z SC-FIELD-01/02/03 |
| Mục tiêu | Chuỗi rỗng và chỉ khoảng trắng. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); DDT từng field name/shipping_address/phone với "" hoặc "   "; mỗi hàng chỉ đổi một field. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Chưa biết cho phép bỏ trống/trim/xóa/giữ cũ/từ chối. Chuỗi rỗng và khoảng trắng ghi riêng trong DDT; không giả định chúng cùng phản hồi hoặc cùng hậu điều kiện. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-018 — Kiểu JSON khác chuỗi của mẫu

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-018 |
| Requirement / Technique | FR-04; D DP-NAME-04, DP-ADDR-04, DP-PHONE-10; S ST-DATA-07; Z SC-FIELD-01/02/03 |
| Mục tiêu | Kiểu JSON khác chuỗi của mẫu. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); DDT một field mỗi hàng: name=123/true/[]/{}; shipping_address=123/false/[]/{}; phone=912345678/true/[]/{}. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Kiểu chặt/ép kiểu chưa được đặc tả; expected accept/reject và dạng lưu là TBD. Number 912345678 không được gọi là phone có số 0 đầu; không dùng JSON number có leading zero. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-019 — Phone có chữ số Unicode

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-019 |
| Requirement / Technique | FR-04; D DP-PHONE-11; C GAP-03; Z SC-FIELD-03 |
| Mục tiêu | Phone có chữ số Unicode. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); B0 thay phone="０９１２３４５６７８". |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Chưa biết bộ chữ số/normalization; không tự chốt tương đương ASCII, hợp lệ hay bị từ chối. Cần oracle kiểu/chuẩn hóa trước thực thi có verdict. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-020 — Chuẩn hóa phone có khoảng trắng, dấu phân cách hoặc mã quốc tế

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-020 |
| Requirement / Technique | FR-04; D DP-PHONE-07; C GAP-03; Z SC-FIELD-03 |
| Mục tiêu | Chuẩn hóa phone có khoảng trắng, dấu phân cách hoặc mã quốc tế. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); DDT phone: "091 2345678", "091-2345678", " 0912345678 ", "+84912345678"; field khác B0. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Chuỗi nguyên dạng không đáp ứng nguyên xi định dạng FR-04; policy normalize trước validation còn TBD. Không đặt oracle reject mọi giá trị hoặc tự quy đổi +84 sang 0. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-021 — Request hoàn toàn không có body

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-021 |
| Requirement / Technique | FR-04; D DP-BODY-02; S ST-DATA-06; Z SC-REQ-06, SC-ERR-05 |
| Mục tiêu | Request hoàn toàn không có body. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); không gửi byte body; không gửi chuỗi null hoặc object rỗng. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Body required/no-op/reject và mọi ảnh hưởng hồ sơ còn TBD. Đây là body vắng, khác case object rỗng. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-022 — Body là object JSON rỗng

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-022 |
| Requirement / Technique | FR-04; D DP-BODY-02; S ST-DATA-06; Z SC-REQ-05/06 |
| Mục tiêu | Body là object JSON rỗng. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); body {}. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Chưa có minProperties/required hoặc partial/full policy; không tự coi request cập nhật thành hồ sơ rỗng, no-op hay lỗi. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-023 — Top-level JSON khác object trong mẫu

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-023 |
| Requirement / Technique | FR-04; D DP-BODY-03; Z SC-REQ-05, SC-ERR-05 |
| Mục tiêu | Top-level JSON khác object trong mẫu. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); DDT body nguyên khối: null, [], "abc", 123, true; mỗi lần một giá trị JSON hợp lệ cú pháp. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Mẫu object không phải schema đầy đủ; accept/reject và error contract TBD. Giữ tách biệt JSON hợp lệ khác hình dạng với JSON hỏng ở case sau. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-024 — Body không có cú pháp JSON hợp lệ

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-024 |
| Requirement / Technique | FR-04 (API mục tiêu); A §2.2; D DP-BODY-04; Z SC-REQ-04, SC-ERR-06 |
| Mục tiêu | Body không có cú pháp JSON hợp lệ. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); raw body đúng văn bản {"name":}; không tự serialize thành JSON hợp lệ. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Biết body vi phạm định dạng JSON được A nêu, nhưng chưa có parser/error status/schema hoặc hậu điều kiện xác định. Không dùng mặc định framework làm expected result; case còn TBD. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-025 — Thiếu hoặc khác Content-Type của request JSON

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-025 |
| Requirement / Technique | FR-04 (API mục tiêu); A §2.2; D DP-HDR-02; Z SC-REQ-07, SC-ERR-06 |
| Mục tiêu | Thiếu hoặc khác Content-Type của request JSON. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. B0, JWT_U1; DDT: (a) không gửi Content-Type và không cho client tự thêm; (b) Content-Type: text/plain. Mỗi hàng vẫn có X-Student-Id: 23120274. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Chưa có policy media type bắt buộc hoặc parse/error; không tự đặt mã HTTP cho trường hợp này. Nếu công cụ tự thêm header, dữ liệu case không đúng thiết kế. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-026 — Unicode và chuẩn hóa khoảng trắng của tên/địa chỉ

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-026 |
| Requirement / Technique | FR-04; D DP-NAME-05, DP-ADDR-05; C GAP-02; Z SC-FIELD-01/02 |
| Mục tiêu | Unicode và chuẩn hóa khoảng trắng của tên/địa chỉ. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); DDT: name="Nguyễn Văn An"; name=" An "; shipping_address="12 Lê Lợi, TP.HCM"; shipping_address=" 12 Le Loi "; mỗi hàng đổi một field. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Chấp nhận/trim/normalization/round-trip chính xác đều TBD. Không tự cấm tiếng Việt hoặc chốt giữ nguyên văn. Mục tiêu là policy text, không nhân bản mọi chuỗi trong cùng miền. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-027 — Khóa JSON lặp trong body

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-027 |
| Requirement / Technique | FR-04 (API mục tiêu); A §2.2; D DP-BODY-06; C GAP-06; Z SC-REQ-08 |
| Mục tiêu | Khóa JSON lặp trong body. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); raw JSON {"name":"Nguyen Van A","name":"An","shipping_address":"123 Le Loi, Q1, TP.HCM","phone":"0912345678"}. Không để object serializer xóa key lặp. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Chưa có duplicate-key policy/ưu tiên key; oracle TBD. Không tự assert lấy key đầu/cuối hoặc reject, không suy từ parser implementation. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-028 — Email ngoài mẫu body

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-028 |
| Requirement / Technique | FR-04 (phạm vi UI); D DP-EMAIL-01; S ST-DATA-08; Q SA-MASS-01; Z SC-FIELD-05 |
| Mục tiêu | Email ngoài mẫu body. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); B0 thêm email="new@example.invalid". |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | FR-04 cấm đổi email qua UI, chưa định nghĩa policy API. Không tự coi việc đổi email qua PUT là bug dựa riêng câu UI, cũng không xác nhận đó là hành vi đúng; oracle API còn TBD. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-029 — Thuộc tính dư không có policy

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-029 |
| Requirement / Technique | FR-04 (API mục tiêu); A §2.2; D DP-EXTRA-01, DP-HDR-03, DP-QUERY-02; Q SA-MASS-01; Z SC-REQ-02/08 |
| Mục tiêu | Thuộc tính dư không có policy. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1), B0; DDT từng kênh riêng: body thêm extra="demo"; query extra=demo; header X-Extra: demo. Không trộn các kênh trong một request. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Ignore/reject/khả năng lưu field dư chưa đặc tả. Không đặt additionalProperties=false hoặc header/query whitelist. Quyền chủ thể/role vẫn có hiệu lực; primary oracle cho policy dư còn TBD. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-030 — Gửi lại cùng PUT sau cập nhật

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-030 |
| Requirement / Technique | FR-04; S ST-DATA-09; C GAP-08; Z SC-SUC-08, CP-DATA-01 |
| Mục tiêu | Gửi lại cùng PUT sau cập nhật. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Từng biến thể được reset độc lập; snapshot có trước mọi PUT. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); hai lần PUT cùng B0, từng request có X-Student-Id: 23120274; có snapshot giữa hai lần. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có. Quan sát sau lần thứ nhất và lần lặp; không coi hai request là hai case, không lấy response lần đầu làm schema chuẩn. 3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Chưa đặc tả no-op/response lặp/timestamp/version/side effect hoặc normalization; không suy ra idempotency chi tiết từ method PUT. Oracle cho hành vi lặp TBD. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-031 — Chuỗi dấu nháy và biểu thức SQL trong field văn bản

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-031 |
| Requirement / Technique | SEC-05; FR-04; D DP-TEXT-01; S INV-01/02; Q SA-SQL-01/02; Z CP-OWNER-01, CP-ROLE-01 |
| Mục tiêu | Chuỗi dấu nháy và biểu thức SQL trong field văn bản. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Cần snapshot U1/U2 và nguồn role. Bằng chứng query/bind còn thiếu; không đọc code/DB hoặc thêm truy vấn kiểm chứng trong phạm vi hiện tại. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); DDT name hoặc shipping_address, một field/hàng: "O'An"; "An' OR '1'='1". Phone B0. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | Không sửa U2 hoặc đổi role vì dữ liệu client (oracle phụ xác định). Oracle chính SEC-05 yêu cầu Parameterized Query: API không chứng minh được cấu trúc query. Accept/reject text và lưu nguyên văn còn TBD; không có lỗi không phải bằng chứng SEC-05 PASS. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

### TC-API01-032 — Marker markup và giới hạn kiểm chứng qua API

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-032 |
| Requirement / Technique | FR-04 (API mục tiêu); SEC-04; D DP-TEXT-01; Q SA-XSS-01; C GAP-09; Z SC-SUC-08 |
| Mục tiêu | Marker markup và giới hạn kiểm chứng qua API. |
| Tiền điều kiện | Fixture chung §2.2, dữ liệu cô lập và phương tiện quan sát phù hợp. Chỉ thiết kế phần request/quan sát API; kiểm chứng UI/render cần bằng chứng bổ sung ngoài bước này. Không thêm bước tự chạy UI. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có nêu bên dưới); **X-Student-Id: 23120274** áp dụng cho mọi request mục tiêu/hỗ trợ/khôi phục. H(U1); B0 thay name bằng "<b>HW06_MARKER</b>"; address/phone giữ B0. |
| Các bước | 1. P1 theo tiền điều kiện case. 2. P2 dùng chính Test Data, từng hàng DDT độc lập nếu có.  3. P3 so Expected Result và thu response như bằng chứng; không tự bật schema assertion TBD. 4. P4 cleanup theo giới hạn §2.2. |
| Expected Result | API chỉ cho biết marker có được lưu/trả không; JSON chứa HTML không tự là XSS. SEC-04 yêu cầu escape khi render UI và không dùng innerHTML trực tiếp; chưa có bằng chứng UI/render nên oracle chính chưa hoàn chỉnh. Không coi response encode/không encode là PASS/FAIL SEC-04. **HTTP status và success/error response schema: TBD.** Không có verdict thực thi ở bản sinh này. |
| Mức độ oracle | **TBD — còn thiếu oracle chính, chưa sẵn sàng thực thi.** |

## 4. Checkpoint và phạm vi bao phủ của bản sinh

Đây là ghi nhận phạm vi khi sinh, không phải kết quả bước 7, Human Audit hoặc báo cáo coverage đã kiểm chứng.

- **Domain Partitioning:** name/address/phone, xác thực, body, header, query và field ngoài mẫu có đại diện theo D. Các miền chưa đặc tả vẫn là TBD; không thêm giới hạn name/address.
- **BVA:** bốn độ dài phone 9/10/11/12 ở TC-API01-011/001/002/012. Không nhân đôi 10/11 theo hai biên hoặc coi phone là miền số để cộng/trừ.
- **State/Data Analysis:** snapshot và bất biến tại P1/P3; chuỗi cập nhật và request lặp tại TC-API01-010/030. FR-04 không có State Machine chính thức; không tự tạo trạng thái hoặc tuyên bố coverage FR-10.
- **Security:** TC-API01-003–009 bao phủ oracle chính xác thực/chủ sở hữu/role; TC-API01-031/032 là nháp SQLi/markup với bằng chứng còn thiếu. Role Escalation và Mass Assignment dùng chung TC-API01-009, không đếm hai lần.
- **Schema:** CP-OBS-01–03 được ghép vào P3 của mọi case để thu thập evidence sau này. CP-SCHEMA-01/02 và success/error schema ở Z còn TBD nên chưa có case exact-match có căn cứ. Không thêm một case chỉ để ghi lại cùng response của case khác.
- **SEC-03:** không áp điều kiện admin-only cho PUT FR-04; quyền admin chỉ có liên quan gián tiếp trong phân tích role. **SEC-01/07:** ngoài chức năng trực tiếp, không tạo password/OTP case để tăng số lượng.
- **SEC-04:** JSON markup chưa chứng minh XSS; case 032 còn cần bằng chứng UI/render. **SEC-05:** case 031 không chứng minh parameterization chỉ qua API.
- Các miền token lifecycle/parser ngoài hợp đồng, độ dài name/address và schema response chưa đủ căn cứ để tạo thêm case có oracle mới. Không tự thêm TTL, ID biên, latency hoặc API khác.

## 5. Thống kê bản sinh và phần còn thiếu

| Chỉ tiêu | Số lượng/ghi chú |
| --- | --- |
| Case nháp AI-generated gốc | **32** |
| Case có oracle chính nghiệp vụ/quyền xác định (XĐ) | **7** — TC-API01-003–009 |
| Case còn thiếu oracle chính (TBD) | **25** — TC-API01-001/002 và TC-API01-010–032 |
| Case còn thiếu status/response schema chính xác | **32/32**, gồm cả 7 case XĐ; không cộng nhóm này với 25 thành số case mới |
| Case được xác nhận sẵn sàng Execute | **0** — chưa xác nhận fixture/GET mapping/nguồn role, chưa Human Audit; đây không phải kết quả test |
| Đã thực thi / PASS / FAIL | **0 / chưa có kết quả / chưa có kết quả** |
| Thiếu so với mục tiêu 35 bản case nháp | **3** |
| Khoảng cách từ 7 oracle chính xác định đến 35 | **28**; không đồng nghĩa chỉ cần thêm 28 case vì 25 case hiện có có thể hoàn thiện sau làm rõ |

**Chưa đạt mục tiêu ít nhất 35 test case có ý nghĩa với oracle đầy đủ.** Có 32 nháp, nhưng 25 còn thiếu oracle chính; không dùng các nháp TBD làm bằng chứng đã đạt mục tiêu. Không tạo thêm case trùng lặp hoặc chỉ có checkpoint thu thập response để lấp 3 chỗ thiếu.

Nguyên nhân:
1. A §2.2 không có success/error response, status/schema; không có exact-match oracle cho mục tiêu Schema của HW06.
2. Required/optional, kiểu chặt, null/rỗng, partial/full và normalization không được định nghĩa đầy đủ. Phone có quy tắc nghiệp vụ nhưng cách xử lý request sai và canonical value còn thiếu.
3. Bất biến role/chủ thể rõ, nhưng nguồn quan sát role/GET mapping và fixture phải được xác nhận trước thực thi. Role reject/ignore và atomicity không được tự đặt.
4. State Machine FR-10 không thuộc hồ sơ; không thêm cạnh giả. Các yêu cầu SEC ngoài API cần evidence bổ sung, không tự tuyên bố đã bao phủ qua PUT.
5. Đã gom các hình thức cùng mục tiêu vào DDT thay vì tách mỗi kiểu, field dư, marker hoặc status/schema assertion thành case độc lập để tăng số lượng.

Những nội dung cần làm rõ trước khi hoàn thiện các nháp: policy field/type/normalization/partial update; success/error contract; nguồn quan sát dữ liệu/quyền và cleanup; bằng chứng UI/parameterized query khi công việc riêng được yêu cầu. Chưa thực hiện các công việc đó ở bước này.

**Điểm dừng:** giữ bản AI-generated này để sinh viên review. Chưa bước 7, Human Audit, Extend, Execute, phân tích implementation, staging/commit/push. Ghi nối tiếp AI Audit theo AGENTS.md; không tự đánh dấu sinh viên đã phê duyệt bản test case.

