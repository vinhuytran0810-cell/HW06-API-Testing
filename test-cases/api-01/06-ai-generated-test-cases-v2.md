# API 01 — Bước 6: Bản AI-generated sau hiệu chỉnh v2

- **API:** `PUT /api/users/me` — FR-04 — Pool A; MSSV 23120274.
- **Skill:** [api-test-generator](../../.agents/skills/api-test-generator/SKILL.md), Bước 6, hiệu chỉnh theo yêu cầu sinh viên.
- **Bản gốc được giữ nguyên:** [06-ai-generated-test-cases.md](06-ai-generated-test-cases.md), SHA-256 trước hiệu chỉnh: `FC97D6FE7F65142B62E2516EFF623515D35483C36702AB53DEE471A3F51C3BD5`.
- **Bản v2 vẫn là AI-generated**, chưa Human Audit, chưa Extend, chưa Execute; không có verdict VALID/INVALID/INCOMPLETE của sinh viên hoặc PASS/FAIL.
- Không phân tích implementation, không sửa kết quả bước 1–5, không thực hiện bước 7 hoặc staging/commit/push. Việc xem lại oracle/DDT/coverage trong tài liệu này là phạm vi hiệu chỉnh bước 6 được sinh viên yêu cầu.
- **ID:** giữ TC-API01-001–032; cấp mới TC-API01-033–050. Cách gọi TC-001 trong yêu cầu được đối chiếu với TC-API01-001, không đổi mã gốc.

## 1. Căn cứ và nguyên tắc hiệu chỉnh oracle

| Ký hiệu | Nguồn |
| --- | --- |
| A | [Đặc tả API](../../specs/api_specification.md), §2–2.2 |
| R | [Yêu cầu SUT](../../eshop-sut/README.md), FR-04, SEC-01–SEC-07 |
| C | [Bước 1](01-contract-analysis.md) |
| D | [Bước 2](02-domain-analysis.md) |
| S | [Bước 3](03-state-analysis.md) |
| Q | [Bước 4](04-security-analysis.md) |
| Z | [Bước 5](05-schema-analysis.md) |
| G | [AGENTS.md](../../AGENTS.md) |

**Điểm cần hiệu chỉnh ở bản gốc:** đã gộp thiếu mã HTTP/schema và thiếu phương tiện quan sát vào việc thiếu oracle nghiệp vụ ở một số case. Trong v2, oracle xác định bởi hậu điều kiện/bất biến có nguồn; cách đọc snapshot/role là điều kiện thực thi phải được xác nhận, không làm mất yêu cầu nghiệp vụ đó.

### 1.1. Ba lớp cần phân biệt

1. **Oracle nghiệp vụ/black-box chính:** cập nhật đúng hồ sơ và giá trị hợp lệ; không thay user khác; không đổi role; không cập nhật từ request thiếu xác thực hoặc JSON không thể giải mã. Có thể xác định ngay từ hợp đồng mà chưa biết HTTP status.
2. **Chi tiết còn TBD:** HTTP status, response schema, error message, reject/ignore field dư, nullable/required, type coercion, trim/Unicode hoặc normalization chưa được quy định. Chỉ đánh TBD cho phần đó; nếu đó là mục tiêu chính thì case giữ TBD.
3. **Điều kiện quan sát/fixture:** danh tính, dữ liệu cũ, GET mapping, nguồn role, cách khôi phục phải được xác nhận trước Execute. Thiếu phương tiện quan sát thì kết luận thực thi bị chặn; không tự PASS hoặc lấy hành vi implementation để làm chuẩn.

- **XĐ:** có oracle chính nghiệp vụ/black-box đủ để phân định phạm vi mục tiêu sau khi fixture/quan sát được xác nhận; vẫn có checkpoint HTTP/schema hoặc phần ngoài mục tiêu chưa rõ.
- **TBD:** mục tiêu chính còn thiếu policy hoặc bằng chứng cần thiết. Bất biến phụ có căn cứ được giữ riêng; không dùng chúng để giả vờ mục tiêu chính đã đủ oracle.
- **Mọi case:** status cụ thể và success/error response schema vẫn TBD; không assert một mã, tập khóa, JSONPath hoặc kiểu response tự đặt. Không đặt latency/SLA.
- Không có case đã thực thi hoặc được xác nhận sẵn sàng Execute trong bước này; XĐ là mức độ oracle, không phải kết quả test.

### 1.2. Căn cứ cho các oracle được sửa

- **001/002/010:** FR-04 cho phép user đã đăng nhập cập nhật thông tin cơ bản của chính mình; mẫu A có name/address và phone; phone 10/11 chữ số đầu 0 đáp ứng ràng buộc. Có căn cứ kiểm tra cập nhật được lưu và tác động lần cập nhật sau, không cần trước tiên biết một status cụ thể. Chỉ dùng giá trị cơ bản có căn cứ, không áp sang mọi Unicode/nullable/partial request.
- **011–014:** từ ràng buộc phone FR-04 và INV-04, với phone cũ đã hợp lệ, request không được biến dữ liệu thành phone vi phạm điều kiện đã nêu. Có thể kiểm chứng bất biến đó dù chưa chốt reject/normalize. Không kết luận mọi phép chuẩn hóa đều đúng, không đòi rollback field khác.
- **024:** từ hợp đồng body JSON của A §2.2, JSON không thể giải mã không phải dữ liệu cập nhật hợp lệ. Oracle tối thiểu: không ghi hồ sơ từ body hỏng. Đây là diễn giải từ định dạng request, không phải suy từ parser code hoặc một mã lỗi mặc định.
- **026:** đã xem lại; vẫn **TBD cho mục tiêu Unicode/biểu diễn** vì A/R không nêu repertoire hoặc normalization, khác việc thiếu status/schema. Bất biến quyền có sẵn vẫn áp dụng.
- **030:** oracle dữ liệu của request đầy đủ lặp lại: giá trị cơ bản không bị làm sai, quyền/chủ thể không đổi. Không yêu cầu response giống nhau hoặc mọi timestamp/version/side effect bất biến.
- **031/044:** đặt oracle **black-box** vào không sửa user khác/role bằng dữ liệu giống SQL theo FR-04/SEC-06; yêu cầu chứng minh **SEC-05 Parameterized Query** tách riêng, cần evidence query/bind. Không thấy tác động trong một lần thử không chứng minh SEC-05 đã được đáp ứng.

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


### 2.4. Bổ sung cho v2

- **X-Student-Id: 23120274** áp dụng mọi PUT mục tiêu, GET quan sát, login hỗ trợ và PUT cleanup, kể cả request có Authorization/body/Content-Type không hợp lệ.
- Chỉ với case kiểm tra cập nhật hợp lệ, fixture cần dữ liệu đích cũ khác dữ liệu mới; body đủ field, tránh phụ thuộc partial-update policy chưa biết. Với phone sai, phone cũ phải hợp lệ để quan sát việc làm hỏng giá trị.
- Không yêu cầu role/JSONPath xuất hiện ở vị trí tự đặt trong GET. Xác nhận nguồn quan sát trước khi Execute; thiếu thì báo chặn, không đổi expected result.
- Không dùng điều kiện “nếu implementation chấp nhận thì…” để miễn kiểm tra khả năng cập nhật đối với dữ liệu đã có căn cứ hợp lệ; đồng thời không áp điều này sang input đang thiếu policy.
- Case đã tách khỏi DDT **không còn chạy trong DDT của case cha**. DDT còn lại chỉ chứa các đại diện của cùng mục tiêu, xét từng hàng độc lập; không tăng số case theo số hàng.

## 3. Danh sách test case v2

### TC-API01-001 — Cập nhật hồ sơ theo mẫu, phone tại biên 10 chữ số

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-001 |
| Requirement / Technique | FR-04; SEC-02/06; D DP-NAME-01, DP-ADDR-01, DP-PHONE-01, BVA-PHONE-02; S ST-DATA-01, POST-01; Q SA-AUTH-01; Z SC-FIELD-01/02/03, CP-DATA-01 |
| Mục tiêu | Cập nhật hồ sơ theo mẫu, phone tại biên 10 chữ số. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. U1 có hồ sơ hợp lệ, dữ liệu mục tiêu khác B0; name/address lấy đúng mẫu A, không có trường dư. Snapshot/nguồn đọc lại phải xác định trước Execute; thiếu thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. B0; H(U1); không query. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Với user đăng nhập, dữ liệu cơ bản đã có căn cứ hợp lệ và không có cập nhật cạnh tranh, tác vụ phải cập nhật thông tin của chính user đó theo FR-04, không bị từ chối chỉ vì user không là admin. Xác minh dữ liệu lưu/đọc lại, không chỉ message; role và hồ sơ user khác không đổi. Thiếu JSONPath/fixture là thiếu phương tiện quan sát, không phải thiếu yêu cầu nghiệp vụ. Không chốt biến đổi Unicode/trim ngoài mục tiêu case. Phone sau cập nhật phải biểu diễn số 0912345678 (10 chữ số đầu 0); không được chỉ echo mà không lưu. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **XĐ — oracle chính nghiệp vụ/black-box xác định; chưa xác nhận fixture sẵn sàng Execute.** |

### TC-API01-002 — Phone tại biên trên 11 chữ số

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-002 |
| Requirement / Technique | FR-04; D DP-PHONE-02, BVA-PHONE-03; S INV-04, POST-01; Z SC-FIELD-03, CP-PHONE-01 |
| Mục tiêu | Phone tại biên trên 11 chữ số. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Các field ngoài phone dùng đúng mẫu A; phone cũ hợp lệ khác 09123456789. Chỉ kiểm tra chấp nhận biên trên có căn cứ, không kiểm tra normalization. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. B0 thay phone bằng chuỗi "09123456789"; H(U1). |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Với user đăng nhập, dữ liệu cơ bản đã có căn cứ hợp lệ và không có cập nhật cạnh tranh, tác vụ phải cập nhật thông tin của chính user đó theo FR-04, không bị từ chối chỉ vì user không là admin. Xác minh dữ liệu lưu/đọc lại, không chỉ message; role và hồ sơ user khác không đổi. Thiếu JSONPath/fixture là thiếu phương tiện quan sát, không phải thiếu yêu cầu nghiệp vụ. Không chốt biến đổi Unicode/trim ngoài mục tiêu case. Phone sau cập nhật phải biểu diễn 09123456789 (11 chữ số đầu 0); không tự bác 11 chữ số theo hiểu biết nhà mạng. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **XĐ — oracle chính nghiệp vụ/black-box xác định; chưa xác nhận fixture sẵn sàng Execute.** |

### TC-API01-003 — Không cung cấp thông tin xác thực

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-003 |
| Requirement / Technique | SEC-02; FR-04; D DP-AUTH-02/03; S ST-DATA-04, INV-03; Q SA-AUTH-02; Z CP-AUTH-01, SC-ERR-01 |
| Mục tiêu | Không cung cấp thông tin xác thực. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. B0. DDT: (a) bỏ Authorization; (b) Authorization là chuỗi rỗng; (c) Authorization: Bearer không có token. Giữ Content-Type và X-Student-Id. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Không request nào được cập nhật hồ sơ bằng quyền không xác thực. So snapshot các user thử nghiệm liên quan, không chỉ response. Đánh giá từng hàng DDT; một hàng cập nhật trái phép là vi phạm oracle. Status/message/schema riêng TBD. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **XĐ — oracle chính nghiệp vụ/black-box xác định; chưa xác nhận fixture sẵn sàng Execute.** |

### TC-API01-004 — Token không có cấu trúc JWT hợp lệ

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-004 |
| Requirement / Technique | FR-04 (API mục tiêu); SEC-02; D DP-AUTH-04; S ST-DATA-04, INV-03; Q SA-AUTH-03; Z CP-AUTH-01 |
| Mục tiêu | Token không có cấu trúc JWT hợp lệ. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. B0; Authorization: Bearer not-a-jwt; các header còn lại theo H(U1). |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Không thực hiện cập nhật trái phép; dữ liệu hồ sơ thử nghiệm đối chiếu không đổi do request này. Status/error schema TBD. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **XĐ — oracle chính nghiệp vụ/black-box xác định; chưa xác nhận fixture sẵn sàng Execute.** |

### TC-API01-005 — Token có chữ ký đã xác định không hợp lệ

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-005 |
| Requirement / Technique | FR-04 (API mục tiêu); SEC-02; D DP-AUTH-05; S ST-DATA-04, INV-03; Q SA-AUTH-04; Z CP-AUTH-01 |
| Mục tiêu | Token có chữ ký đã xác định không hợp lệ. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Cần fixture token có tình trạng chữ ký không hợp lệ được xác nhận độc lập. Không tự đoán thuật toán/claims; chưa có fixture thì BLOCKED, không tự coi placeholder là token đã kiểm tra. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. B0; Authorization: Bearer <JWT_SAI_CHỮ_KÝ_ĐÃ_XÁC_ĐỊNH>; các header còn lại theo H(U1). |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Không chấp nhận danh tính từ token không hợp lệ để cập nhật hồ sơ. Không có cập nhật trái phép; response TBD. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **XĐ — oracle chính nghiệp vụ/black-box xác định; chưa xác nhận fixture sẵn sàng Execute.** |

### TC-API01-006 — Danh tính U2 phải tương ứng hồ sơ U2

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-006 |
| Requirement / Technique | FR-04; SEC-02; D DP-AUTH-08; S ST-DATA-11, INV-01; Q SA-IDOR-03; Z CP-OWNER-01 |
| Mục tiêu | Danh tính U2 phải tương ứng hồ sơ U2. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U2); B0. Snapshot U1 là đối chứng. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Request có danh tính U2 không được làm thay đổi hồ sơ U1. Không coi token U2 là sai chỉ vì baseline đang dùng U1; nếu cập nhật được chấp nhận thì đối tượng phải là U2. Oracle chính là cô lập U1, không dùng từ chối mọi request làm bằng chứng tính đúng của cập nhật U2. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **XĐ — oracle chính nghiệp vụ/black-box xác định; chưa xác nhận fixture sẵn sàng Execute.** |

### TC-API01-007 — IDOR qua field id trong body

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-007 |
| Requirement / Technique | FR-04; D DP-ID-01; S ST-DATA-02, INV-01; Q SA-IDOR-01; Z CP-OWNER-01 |
| Mục tiêu | IDOR qua field id trong body. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); B0 thêm id=<ID_U2>; không gửi user_id ở body/query. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | P_U2_sau = P_U2_trước đối với request xác thực là U1. U1 được cập nhật hay toàn request bị từ chối/field dư bị bỏ qua đều TBD; không yêu cầu một status cụ thể. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **XĐ — oracle chính nghiệp vụ/black-box xác định; chưa xác nhận fixture sẵn sàng Execute.** |

### TC-API01-008 — Không đổi chủ thể bằng query ngoài khai báo

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-008 |
| Requirement / Technique | FR-04; D DP-QUERY-02; S INV-01; Q SA-IDOR-02; Z SC-REQ-02, CP-OWNER-01 |
| Mục tiêu | Không đổi chủ thể bằng query ngoài khai báo. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); B0; query user_id=<ID_U2>. Không tạo path /users/:id. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Không sửa U2 bằng quyền U1. Parse/ignore/reject query dư và tác động lên U1 chưa được đặc tả, không lấy echo ID làm oracle. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **XĐ — oracle chính nghiệp vụ/black-box xác định; chưa xác nhận fixture sẵn sàng Execute.** |

### TC-API01-009 — Nâng role qua Mass Assignment

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-009 |
| Requirement / Technique | FR-04; SEC-06; D DP-ROLE-02; S ST-DATA-03/12, INV-02; Q SA-ROLE-01; Z CP-ROLE-01 |
| Mục tiêu | Nâng role qua Mass Assignment. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Cần nguồn quan sát role/quyền thực tế đáng tin cậy, chưa xác nhận GET trả role. Nếu chỉ có echo response/token cũ thì BLOCKED kết luận oracle; không tự mở rộng sang thực thi admin API. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1), U1 hiện role=user; B0 thêm role="admin". |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Role thực tế của U1 không đổi qua request, kể cả khi field cơ bản thay đổi. Không yêu cầu reject toàn request hoặc rollback field cơ bản. Nhãn Role Escalation/Mass Assignment chỉ gắn cùng một case; status/schema TBD. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **XĐ — oracle chính nghiệp vụ/black-box xác định; chưa xác nhận fixture sẵn sàng Execute.** |

### TC-API01-010 — Hai cập nhật liên tiếp và dữ liệu lần sau

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-010 |
| Requirement / Technique | FR-04; S ST-DATA-10, POST-01; C GAP-01/02/08; Z CP-DATA-01 |
| Mục tiêu | Hai cập nhật liên tiếp và dữ liệu lần sau. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); PUT thứ nhất B0; PUT thứ hai B0 thay phone="09123456789". Cả hai request có X-Student-Id: 23120274. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có. Gửi hai PUT theo thứ tự, quan sát sau từng PUT theo P; không chạy song song, không dùng kết quả request đầu làm expected result cho request sau. 3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Hai request đầy đủ, hợp lệ phải cập nhật đúng hồ sơ U1: sau lần 1 phone biểu diễn 0912345678; sau lần 2 phone biểu diễn 09123456789. Lần 2 phải có tác dụng, không trả lại/giữ số của lần 1 do dùng dữ liệu cũ. Role và hồ sơ U2 không đổi. So snapshot sau từng request, không dùng schema/status tự đặt. Không quy định timestamp/version hay cập nhật thiếu trường. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **XĐ — oracle chính nghiệp vụ/black-box xác định; chưa xác nhận fixture sẵn sàng Execute.** |

### TC-API01-011 — Phone ngay dưới biên dưới: 9 chữ số

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-011 |
| Requirement / Technique | FR-04; D DP-PHONE-03, BVA-PHONE-01; S ST-DATA-05, INV-04; C GAP-03/06; Z SC-FIELD-03, SC-ERR-04 |
| Mục tiêu | Phone ngay dưới biên dưới: 9 chữ số. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Phone cũ của U1 đã hợp lệ, được xác nhận; snapshot/đọc lại đáng tin cậy, name/address giữ đúng mẫu A. Không có thao tác khác cùng sửa hồ sơ. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); B0 thay phone="091234567". |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Đầu vào nguyên dạng 9 chữ số vi phạm FR-04. Bất biến dữ liệu: request không được làm phone hồ sơ đang hợp lệ trở thành giá trị vi phạm điều kiện đầu 0 và 10–11 chữ số. Không được lưu nguyên dạng giá trị sai làm phone hợp lệ. Nếu không cập nhật thì phone cũ vẫn hợp lệ; nếu hệ thống có chuẩn hóa thì giá trị kết quả phải thỏa FR-04. Không chọn trước reject/normalize, không yêu cầu rollback name/address, không mặc nhiên khẳng định mọi phép chuẩn hóa đều đúng nghiệp vụ. Bất biến này đủ kết luận khi có dữ liệu sai được lưu; policy chuẩn hóa chi tiết vẫn TBD. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **XĐ — oracle chính nghiệp vụ/black-box xác định; chưa xác nhận fixture sẵn sàng Execute.** |

### TC-API01-012 — Phone ngay trên biên trên: 12 chữ số

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-012 |
| Requirement / Technique | FR-04; D DP-PHONE-04, BVA-PHONE-04; S ST-DATA-05, INV-04; C GAP-03/06; Z SC-FIELD-03, SC-ERR-04 |
| Mục tiêu | Phone ngay trên biên trên: 12 chữ số. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Phone cũ của U1 đã hợp lệ, được xác nhận; snapshot/đọc lại đáng tin cậy, name/address giữ đúng mẫu A. Không có thao tác khác cùng sửa hồ sơ. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); B0 thay phone="091234567890". |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Đầu vào nguyên dạng 12 chữ số vi phạm FR-04. Bất biến dữ liệu: request không được làm phone hồ sơ đang hợp lệ trở thành giá trị vi phạm điều kiện đầu 0 và 10–11 chữ số. Không được lưu nguyên dạng giá trị sai làm phone hợp lệ. Nếu không cập nhật thì phone cũ vẫn hợp lệ; nếu hệ thống có chuẩn hóa thì giá trị kết quả phải thỏa FR-04. Không chọn trước reject/normalize, không yêu cầu rollback name/address, không mặc nhiên khẳng định mọi phép chuẩn hóa đều đúng nghiệp vụ. Bất biến này đủ kết luận khi có dữ liệu sai được lưu; policy chuẩn hóa chi tiết vẫn TBD. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **XĐ — oracle chính nghiệp vụ/black-box xác định; chưa xác nhận fixture sẵn sàng Execute.** |

### TC-API01-013 — Phone 10 chữ số không bắt đầu 0

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-013 |
| Requirement / Technique | FR-04; D DP-PHONE-05; S ST-DATA-05, INV-04; C GAP-03/06; Z SC-FIELD-03, SC-ERR-04 |
| Mục tiêu | Phone 10 chữ số không bắt đầu 0. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Phone cũ của U1 đã hợp lệ, được xác nhận; snapshot/đọc lại đáng tin cậy, name/address giữ đúng mẫu A. Không có thao tác khác cùng sửa hồ sơ. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); B0 thay phone="1912345678". |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Đầu vào nguyên dạng không bắt đầu 0 vi phạm FR-04. Bất biến dữ liệu: request không được làm phone hồ sơ đang hợp lệ trở thành giá trị vi phạm điều kiện đầu 0 và 10–11 chữ số. Không được lưu nguyên dạng giá trị sai làm phone hợp lệ. Nếu không cập nhật thì phone cũ vẫn hợp lệ; nếu hệ thống có chuẩn hóa thì giá trị kết quả phải thỏa FR-04. Không chọn trước reject/normalize, không yêu cầu rollback name/address, không mặc nhiên khẳng định mọi phép chuẩn hóa đều đúng nghiệp vụ. Bất biến này đủ kết luận khi có dữ liệu sai được lưu; policy chuẩn hóa chi tiết vẫn TBD. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **XĐ — oracle chính nghiệp vụ/black-box xác định; chưa xác nhận fixture sẵn sàng Execute.** |

### TC-API01-014 — Phone chứa chữ cái trong chuỗi dài 10

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-014 |
| Requirement / Technique | FR-04; D DP-PHONE-06; S ST-DATA-05, INV-04; C GAP-03/06; Z SC-FIELD-03, SC-ERR-04 |
| Mục tiêu | Phone chứa chữ cái trong chuỗi dài 10. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Phone cũ của U1 đã hợp lệ, được xác nhận; snapshot/đọc lại đáng tin cậy, name/address giữ đúng mẫu A. Không có thao tác khác cùng sửa hồ sơ. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); B0 thay phone="09123A5678". |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Đầu vào nguyên dạng chứa chữ cái vi phạm FR-04. Bất biến dữ liệu: request không được làm phone hồ sơ đang hợp lệ trở thành giá trị vi phạm điều kiện đầu 0 và 10–11 chữ số. Không được lưu nguyên dạng giá trị sai làm phone hợp lệ. Nếu không cập nhật thì phone cũ vẫn hợp lệ; nếu hệ thống có chuẩn hóa thì giá trị kết quả phải thỏa FR-04. Không chọn trước reject/normalize, không yêu cầu rollback name/address, không mặc nhiên khẳng định mọi phép chuẩn hóa đều đúng nghiệp vụ. Bất biến này đủ kết luận khi có dữ liệu sai được lưu; policy chuẩn hóa chi tiết vẫn TBD. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **XĐ — oracle chính nghiệp vụ/black-box xác định; chưa xác nhận fixture sẵn sàng Execute.** |

### TC-API01-015 — Bỏ name: required và semantics khi thiếu tên

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-015 |
| Requirement / Technique | FR-04; D DP-NAME-02, DP-BODY-05; S ST-DATA-06; Z SC-REQ-06 |
| Mục tiêu | Bỏ name: required và semantics khi thiếu tên. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); clone B0, bỏ key name; giữ shipping_address/phone. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Required/optional của name và xử lý thiếu key còn TBD. Không tự áp required của đăng ký; không chốt giữ tên cũ/xóa/từ chối. Oracle phụ về chủ thể/role không thay thế oracle chính này. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |

### TC-API01-016 — name nhận null

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-016 |
| Requirement / Technique | FR-04; D DP-NAME-03; S ST-DATA-07; Z SC-FIELD-01 |
| Mục tiêu | name nhận null. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); B0 thay name=null. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Nullable, xóa tên hoặc từ chối còn TBD. Không biến null thành rỗng hay field vắng; chưa đủ căn cứ cho accept/reject name=null. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |

### TC-API01-017 — name rỗng hoặc chỉ khoảng trắng

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-017 |
| Requirement / Technique | FR-04; D DP-NAME-03; S ST-DATA-07; Z SC-FIELD-01 |
| Mục tiêu | name rỗng hoặc chỉ khoảng trắng. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); DDT name="" hoặc "   "; các field khác B0. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Chưa rõ chấp nhận tên rỗng, trim/xóa hoặc từ chối. Hai đại diện cùng mục tiêu policy tên trống, từng hàng đánh giá riêng; không tự coi kết quả giống nhau. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |

### TC-API01-018 — Kiểu JSON của name khác chuỗi mẫu

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-018 |
| Requirement / Technique | FR-04; D DP-NAME-04; S ST-DATA-07; Z SC-FIELD-01 |
| Mục tiêu | Kiểu JSON của name khác chuỗi mẫu. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); DDT name=123, true, [], {}; các field khác B0. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Kiểu chặt và ép kiểu của name còn TBD; không tự kết luận số/bool/array/object phải bị từ chối chỉ từ mẫu string. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |

### TC-API01-019 — Phone có chữ số Unicode

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-019 |
| Requirement / Technique | FR-04; D DP-PHONE-11; C GAP-03; Z SC-FIELD-03 |
| Mục tiêu | Phone có chữ số Unicode. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); B0 thay phone="０９１２３４５６７８". |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Chưa biết bộ chữ số/normalization; không tự chốt tương đương ASCII, hợp lệ hay bị từ chối. Cần oracle kiểu/chuẩn hóa trước thực thi có verdict. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |

### TC-API01-020 — Chuẩn hóa phone có khoảng trắng, dấu phân cách hoặc mã quốc tế

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-020 |
| Requirement / Technique | FR-04; D DP-PHONE-07; C GAP-03; Z SC-FIELD-03 |
| Mục tiêu | Chuẩn hóa phone có khoảng trắng, dấu phân cách hoặc mã quốc tế. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); DDT phone: "091 2345678", "091-2345678", " 0912345678 ", "+84912345678"; field khác B0. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Chuỗi nguyên dạng không đáp ứng nguyên xi định dạng FR-04; policy normalize trước validation còn TBD. Không đặt oracle reject mọi giá trị hoặc tự quy đổi +84 sang 0. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |

### TC-API01-021 — Request hoàn toàn không có body

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-021 |
| Requirement / Technique | FR-04; D DP-BODY-02; S ST-DATA-06; Z SC-REQ-06, SC-ERR-05 |
| Mục tiêu | Request hoàn toàn không có body. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); không gửi byte body; không gửi chuỗi null hoặc object rỗng. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Body required/no-op/reject và mọi ảnh hưởng hồ sơ còn TBD. Đây là body vắng, khác case object rỗng. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |

### TC-API01-022 — Body là object JSON rỗng

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-022 |
| Requirement / Technique | FR-04; D DP-BODY-02; S ST-DATA-06; Z SC-REQ-05/06 |
| Mục tiêu | Body là object JSON rỗng. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); body {}. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Chưa có minProperties/required hoặc partial/full policy; không tự coi request cập nhật thành hồ sơ rỗng, no-op hay lỗi. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |

### TC-API01-023 — Top-level JSON khác object trong mẫu

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-023 |
| Requirement / Technique | FR-04; D DP-BODY-03; Z SC-REQ-05, SC-ERR-05 |
| Mục tiêu | Top-level JSON khác object trong mẫu. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); DDT body nguyên khối: null, [], "abc", 123, true; mỗi lần một giá trị JSON hợp lệ cú pháp. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Mẫu object không phải schema đầy đủ; accept/reject và error contract TBD. Giữ tách biệt JSON hợp lệ khác hình dạng với JSON hỏng ở case sau. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |

### TC-API01-024 — Body không có cú pháp JSON hợp lệ

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-024 |
| Requirement / Technique | FR-04 (API mục tiêu); A §2.2; D DP-BODY-04; Z SC-REQ-04, SC-ERR-06 |
| Mục tiêu | Body không có cú pháp JSON hợp lệ. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Snapshot hồ sơ đã biết; raw body giữ đúng {"name":}; không để client sửa thành JSON hợp lệ. Các yếu tố auth/header ngoài body đều đúng nền. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); raw body đúng văn bản {"name":}; không tự serialize thành JSON hợp lệ. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Body không giải mã được thành JSON nên không cung cấp một cập nhật hồ sơ JSON hợp lệ theo A §2.2. Không được ghi dữ liệu hồ sơ từ phần body hỏng hoặc thực hiện cập nhật một phần dựa trên việc nhặt field từ JSON không hợp lệ; snapshot hồ sơ mục tiêu giữ nguyên đối với request này. Đây là suy luận tối thiểu từ hợp đồng request JSON, không phải giả định rollback cho mọi lỗi validation. Hình thức báo lỗi, HTTP status và error body vẫn TBD. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **XĐ — oracle chính nghiệp vụ/black-box xác định; chưa xác nhận fixture sẵn sàng Execute.** |

### TC-API01-025 — Thiếu hoặc khác Content-Type của request JSON

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-025 |
| Requirement / Technique | FR-04 (API mục tiêu); A §2.2; D DP-HDR-02; Z SC-REQ-07, SC-ERR-06 |
| Mục tiêu | Thiếu hoặc khác Content-Type của request JSON. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. B0, JWT_U1; DDT: (a) không gửi Content-Type và không cho client tự thêm; (b) Content-Type: text/plain. Mỗi hàng vẫn có X-Student-Id: 23120274. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Chưa có policy media type bắt buộc hoặc parse/error; không tự đặt mã HTTP cho trường hợp này. Nếu công cụ tự thêm header, dữ liệu case không đúng thiết kế. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |

### TC-API01-026 — Tên Unicode có dấu: giới hạn oracle chấp nhận và biểu diễn

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-026 |
| Requirement / Technique | FR-04; D DP-NAME-05; C GAP-02; Z SC-FIELD-01 |
| Mục tiêu | Tên Unicode có dấu: giới hạn oracle chấp nhận và biểu diễn. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); B0 thay name="Nguyễn Văn An"; không trộn trim/address trong case này. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Đã xác định bất biến role/chủ thể và khả năng cập nhật name theo FR-04. Tuy nhiên tài liệu chưa quy định repertoire/normalization tên: oracle chính chấp nhận và biểu diễn chính xác chuỗi Unicode này còn TBD. Không tự đặt cấm dấu tiếng Việt, cũng không gán yêu cầu bảo toàn từng code point chưa có nguồn. Thiếu HTTP/schema không phải lý do giữ TBD; lý do là policy giá trị text còn thiếu. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |

### TC-API01-027 — Khóa JSON lặp trong body

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-027 |
| Requirement / Technique | FR-04 (API mục tiêu); A §2.2; D DP-BODY-06; C GAP-06; Z SC-REQ-08 |
| Mục tiêu | Khóa JSON lặp trong body. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); raw JSON {"name":"Nguyen Van A","name":"An","shipping_address":"123 Le Loi, Q1, TP.HCM","phone":"0912345678"}. Không để object serializer xóa key lặp. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Chưa có duplicate-key policy/ưu tiên key; oracle TBD. Không tự assert lấy key đầu/cuối hoặc reject, không suy từ parser implementation. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |

### TC-API01-028 — Email ngoài mẫu body

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-028 |
| Requirement / Technique | FR-04 (phạm vi UI); D DP-EMAIL-01; S ST-DATA-08; Q SA-MASS-01; Z SC-FIELD-05 |
| Mục tiêu | Email ngoài mẫu body. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); B0 thêm email="new@example.invalid". |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | FR-04 cấm đổi email qua UI, chưa định nghĩa policy API. Không tự coi việc đổi email qua PUT là bug dựa riêng câu UI, cũng không xác nhận đó là hành vi đúng; oracle API còn TBD. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |

### TC-API01-029 — Field dư trong body chưa có policy

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-029 |
| Requirement / Technique | FR-04; A §2.2; D DP-EXTRA-01; Q SA-MASS-01; Z SC-REQ-08 |
| Mục tiêu | Field dư trong body chưa có policy. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); B0 thêm extra="demo"; không gửi query/header dư. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Reject/ignore/lưu field extra chưa được đặc tả, oracle chính TBD. Không tự đặt additionalProperties=false; bất biến chủ thể/role vẫn phải giữ. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |

### TC-API01-030 — Gửi lại cùng PUT sau cập nhật

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-030 |
| Requirement / Technique | FR-04; S ST-DATA-09; C GAP-08; Z SC-SUC-08, CP-DATA-01 |
| Mục tiêu | Gửi lại cùng PUT sau cập nhật. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); hai lần PUT cùng B0, từng request có X-Student-Id: 23120274; có snapshot giữa hai lần. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có. Quan sát sau lần thứ nhất và lần lặp; không coi hai request là hai case, không lấy response lần đầu làm schema chuẩn. 3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Lần PUT hợp lệ đầu phải cập nhật dữ liệu cơ bản B0. Gửi lại cùng dữ liệu đầy đủ không được làm sai các giá trị cơ bản đó, đổi role hoặc sửa U2; sau lần lặp, các giá trị mục tiêu vẫn biểu diễn B0. Oracle chỉ xét dữ liệu hồ sơ và quyền, không yêu cầu cùng response, timestamp/version bất biến hoặc không có mọi side effect. Không suy một policy idempotency toàn hệ thống từ method. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **XĐ — oracle chính nghiệp vụ/black-box xác định; chưa xác nhận fixture sẵn sàng Execute.** |

### TC-API01-031 — SQL Injection qua name: oracle black-box về phạm vi dữ liệu và quyền

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-031 |
| Requirement / Technique | SEC-05; FR-04; D DP-TEXT-01; S INV-01/02; Q SA-SQL-01/02; Z CP-OWNER-01, CP-ROLE-01 |
| Mục tiêu | SQL Injection qua name: oracle black-box về phạm vi dữ liệu và quyền. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Hai user có dữ liệu phân biệt và nguồn quan sát role đáng tin cậy; baseline riêng cho mỗi hàng DDT. Không chạy câu SQL/DDL trực tiếp hoặc đọc implementation. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); DDT chỉ ở name: "O'An" làm đối chứng dấu nháy; "An' OR '1'='1" làm chuỗi giống SQL. Address/phone B0; snapshot U2 khác body để phát hiện tác động ngoài U1. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Oracle black-box chính có căn cứ: chuỗi name không được làm đổi hồ sơ U2 hay role U1/U2 hoặc mở quyền cập nhật ngoài chủ thể. So snapshot/quyền thực tế, không suy từ response lỗi. Nhận/lưu literal hay từ chối riêng giá trị text chưa đủ đặc tả; không ép round-trip nguyên văn. Không thấy vi phạm chỉ hỗ trợ kết luận trong phạm vi payload và dữ liệu đã thử. Chứng minh SEC-05 Parameterized Query là yêu cầu khác cần bằng chứng query/bind, vẫn chưa được đáp ứng bằng case API này. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **XĐ — oracle chính nghiệp vụ/black-box xác định; chưa xác nhận fixture sẵn sàng Execute.** |

### TC-API01-032 — Marker markup và giới hạn kiểm chứng qua API

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-032 |
| Requirement / Technique | FR-04 (API mục tiêu); SEC-04; D DP-TEXT-01; Q SA-XSS-01; C GAP-09; Z SC-SUC-08 |
| Mục tiêu | Marker markup và giới hạn kiểm chứng qua API. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Chỉ thiết kế phần request/quan sát API; kiểm chứng UI/render cần bằng chứng bổ sung ngoài bước này. Không thêm bước tự chạy UI. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); B0 thay name bằng "<b>HW06_MARKER</b>"; address/phone giữ B0. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | API chỉ cho biết marker có được lưu/trả không; JSON chứa HTML không tự là XSS. SEC-04 yêu cầu escape khi render UI và không dùng innerHTML trực tiếp; chưa có bằng chứng UI/render nên oracle chính chưa hoàn chỉnh. Không coi response encode/không encode là PASS/FAIL SEC-04. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |

### TC-API01-033 — Bỏ shipping_address trong PUT

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-033 |
| Requirement / Technique | FR-04; D DP-ADDR-02, DP-BODY-05; S ST-DATA-06; Z SC-REQ-06 |
| Mục tiêu | Bỏ shipping_address trong PUT. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); B0 bỏ shipping_address; giữ name/phone. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Required/optional và xử lý field thiếu còn TBD; không chốt giữ cũ, xóa hay từ chối. Gửi thiếu field khác với null. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |
| Thay đổi so với gốc | Tách từ TC-API01-015: required/partial update của địa chỉ là policy độc lập với tên. |

### TC-API01-034 — Bỏ phone trong PUT

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-034 |
| Requirement / Technique | FR-04; D DP-PHONE-08, DP-BODY-05; S ST-DATA-06; Z SC-REQ-06 |
| Mục tiêu | Bỏ phone trong PUT. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); B0 bỏ phone; giữ name/address. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Required/optional và xử lý field thiếu còn TBD; không chốt giữ cũ, xóa hay từ chối. Gửi thiếu field khác với null. Điều kiện phone hợp lệ không tự làm phone thành required. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |
| Thay đổi so với gốc | Tách từ TC-API01-015: omission phone khác policy tên/địa chỉ. |

### TC-API01-035 — shipping_address nhận null

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-035 |
| Requirement / Technique | FR-04; D DP-ADDR-03; S ST-DATA-07; Z SC-FIELD-02 |
| Mục tiêu | shipping_address nhận null. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); B0 thay shipping_address=null. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Cho phép xóa địa chỉ/nullable/ép kiểu hoặc reject chưa được đặc tả, oracle chính TBD. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |
| Thay đổi so với gốc | Tách từ TC-API01-016: nullable địa chỉ độc lập nullable tên. |

### TC-API01-036 — phone nhận null

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-036 |
| Requirement / Technique | FR-04; D DP-PHONE-09; S ST-DATA-07; Z SC-FIELD-03 |
| Mục tiêu | phone nhận null. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); B0 thay phone=null. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Chưa rõ có thể bỏ/xóa phone hay không; không coi null là chuỗi phone hợp lệ, nhưng chưa đủ căn cứ kết luận mọi nullable phone bị cấm. Oracle chính TBD. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |
| Thay đổi so với gốc | Tách từ TC-API01-016: quyền xóa phone khác định dạng một phone được cung cấp. |

### TC-API01-037 — shipping_address rỗng hoặc chỉ khoảng trắng

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-037 |
| Requirement / Technique | FR-04; D DP-ADDR-03; S ST-DATA-07; Z SC-FIELD-02 |
| Mục tiêu | shipping_address rỗng hoặc chỉ khoảng trắng. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); DDT shipping_address="" hoặc "   "; field khác B0. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Chấp nhận/xóa/trim/reject địa chỉ rỗng còn TBD, không áp policy tên sang địa chỉ. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |
| Thay đổi so với gốc | Tách từ TC-API01-017: dữ liệu trống của trường địa chỉ. |

### TC-API01-038 — phone rỗng hoặc chỉ khoảng trắng

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-038 |
| Requirement / Technique | FR-04; D DP-PHONE-09; S ST-DATA-07; Z SC-FIELD-03 |
| Mục tiêu | phone rỗng hoặc chỉ khoảng trắng. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); DDT phone="" hoặc "   "; field khác B0. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Đầu vào không là phone hợp lệ, nhưng chính sách xóa/không cung cấp/trim chưa được đặc tả; oracle chính TBD. Không dùng bất biến valid-phone để tự cấm phone vắng khi required/nullable chưa rõ. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |
| Thay đổi so với gốc | Tách từ TC-API01-017: phân biệt phone rỗng với phone 9/12 chữ số. |

### TC-API01-039 — Kiểu JSON của shipping_address khác chuỗi mẫu

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-039 |
| Requirement / Technique | FR-04; D DP-ADDR-04; S ST-DATA-07; Z SC-FIELD-02 |
| Mục tiêu | Kiểu JSON của shipping_address khác chuỗi mẫu. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); DDT shipping_address=123,false,[],{}; field khác B0. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Kiểu chặt/ép kiểu địa chỉ TBD, không mặc định reject. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |
| Thay đổi so với gốc | Tách từ TC-API01-018: type policy của địa chỉ. |

### TC-API01-040 — Kiểu JSON của phone khác chuỗi mẫu

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-040 |
| Requirement / Technique | FR-04; D DP-PHONE-10; S ST-DATA-07; Z SC-FIELD-03 |
| Mục tiêu | Kiểu JSON của phone khác chuỗi mẫu. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); DDT phone=912345678,true,[],{}; field khác B0. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Kiểu/ép kiểu phone còn TBD; không tự coi number có leading zero hợp lệ. Nếu kết quả được ghi thành phone có giá trị thì cần tuân FR-04, nhưng policy accept/convert vẫn thiếu. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |
| Thay đổi so với gốc | Tách từ TC-API01-018: ép kiểu và giữ leading zero khác policy text. |

### TC-API01-041 — Địa chỉ Unicode có dấu

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-041 |
| Requirement / Technique | FR-04; D DP-ADDR-05; C GAP-02; Z SC-FIELD-02 |
| Mục tiêu | Địa chỉ Unicode có dấu. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); B0 thay shipping_address="12 Lê Lợi, TP.HCM". |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | FR-04 cho cập nhật địa chỉ, bất biến quyền rõ; policy repertoire/normalization/biểu diễn chính xác địa chỉ này còn TBD. Không suy hợp lệ mọi string hoặc cấm tiếng Việt. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |
| Thay đổi so với gốc | Tách từ TC-API01-026: policy địa chỉ riêng, không còn trong DDT tên. |

### TC-API01-042 — Trim của name

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-042 |
| Requirement / Technique | FR-04; D DP-NAME-05; C GAP-02; Z SC-FIELD-01 |
| Mục tiêu | Trim của name. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); B0 thay name=" An ". |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Oracle giữ/cắt khoảng trắng hoặc từ chối còn TBD, không yêu cầu trim theo convention. Khác Unicode: chỉ kiểm tra normalization khoảng trắng. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |
| Thay đổi so với gốc | Tách từ TC-API01-026: trim khác repertoire. |

### TC-API01-043 — Trim của shipping_address

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-043 |
| Requirement / Technique | FR-04; D DP-ADDR-05; C GAP-02; Z SC-FIELD-02 |
| Mục tiêu | Trim của shipping_address. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); B0 thay shipping_address=" 12 Le Loi ". |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Oracle giữ/cắt khoảng trắng hoặc từ chối còn TBD; không áp policy name lên address. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |
| Thay đổi so với gốc | Tách từ TC-API01-026: trim địa chỉ riêng. |

### TC-API01-044 — SQL Injection qua shipping_address: oracle black-box

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-044 |
| Requirement / Technique | FR-04; SEC-05; D DP-TEXT-01; S INV-01/02; Q SA-SQL-01/02; Z CP-OWNER-01, CP-ROLE-01 |
| Mục tiêu | SQL Injection qua shipping_address: oracle black-box. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Fixture U1/U2 phân biệt, có nguồn quan sát role. Không đọc DB/code hoặc thực thi SQL trực tiếp. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); DDT shipping_address="O'An" hoặc "An' OR '1'='1"; name/phone B0. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Đầu vào address không được đổi hồ sơ U2 hay role U1/U2 hoặc quyền cập nhật ngoài chủ thể. Kiểm chứng snapshot và quyền thực tế. Việc xử lý literal/validation text còn TBD; chứng minh Parameterized Query vẫn cần bằng chứng cấu trúc query/bind, không được suy từ case black-box không thấy lỗi. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **XĐ — oracle chính nghiệp vụ/black-box xác định; chưa xác nhận fixture sẵn sàng Execute.** |
| Thay đổi so với gốc | Tách từ TC-API01-031: address là bề mặt đầu vào khác, không gửi đồng thời SQL trong name. |

### TC-API01-045 — Role ngoài kiểu/giá trị nâng quyền rõ ràng

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-045 |
| Requirement / Technique | FR-04; SEC-06; D DP-ROLE-03/04; S INV-02; Q SA-ROLE-02; Z CP-ROLE-01 |
| Mục tiêu | Role ngoài kiểu/giá trị nâng quyền rõ ràng. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Phải có nguồn quan sát role thật; thiếu thì chờ fixture, không coi echo là chứng minh. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1) với role=user; DDT role="user",null,123,[],{}; field nền B0. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Role thực tế U1 phải giữ nguyên. Kiểm tra không bị xóa/hạ thành kiểu sai hay thay quyền do binding dữ liệu, không chỉ ngăn nâng thành admin. Cách ignore/reject và ảnh hưởng field cơ bản còn TBD. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **XĐ — oracle chính nghiệp vụ/black-box xác định; chưa xác nhận fixture sẵn sàng Execute.** |
| Thay đổi so với gốc | Tách từ TC-API01-009: bất biến không làm hỏng role bằng null/kiểu khác, không sao chép case role=admin. |

### TC-API01-046 — IDOR qua field user_id trong body

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-046 |
| Requirement / Technique | FR-04; D DP-ID-01; S ST-DATA-02, INV-01; Q SA-IDOR-01; Z CP-OWNER-01 |
| Mục tiêu | IDOR qua field user_id trong body. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); B0 thêm user_id=<ID_U2>; không gửi id/query định danh. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Không sửa hồ sơ U2 bằng quyền U1. Không coi user_id là field được hỗ trợ; reject/ignore hay cập nhật U1 vẫn TBD. Nguồn quan sát P_U2 riêng bằng danh tính U2. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **XĐ — oracle chính nghiệp vụ/black-box xác định; chưa xác nhận fixture sẵn sàng Execute.** |
| Thay đổi so với gốc | Tách từ TC-API01-007: hai tên field là hai điểm binding có thể khác; mỗi ID mới chỉ giữ một kênh/field. |

### TC-API01-047 — Query dư không liên quan quyền

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-047 |
| Requirement / Technique | FR-04; A §2.2; D DP-QUERY-02; Z SC-REQ-02 |
| Mục tiêu | Query dư không liên quan quyền. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); B0; query extra=demo; không gửi field/header dư. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Chưa có policy query dư, accept/ignore/reject TBD. Không lặp IDOR qua user_id vì mục tiêu ở đây là policy query tổng quát. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |
| Thay đổi so với gốc | Tách từ TC-API01-029: vị trí query, không phải body additionalProperties. |

### TC-API01-048 — Header dư không liên quan quyền

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-048 |
| Requirement / Technique | FR-04; A §2.2; D DP-HDR-03; Z SC-REQ-08 |
| Mục tiêu | Header dư không liên quan quyền. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Reset fixture cho từng hàng DDT; không có cập nhật cạnh tranh. Nếu chưa xác nhận phương tiện quan sát thì chờ fixture, không tự PASS. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); B0; thêm X-Extra: demo; giữ X-Student-Id: 23120274. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Chưa có header-extra policy, oracle chính TBD. Không coi X-Extra là header bắt buộc SUT hoặc bỏ header sinh viên. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **TBD — oracle chính còn thiếu policy/bằng chứng; chờ làm rõ, không coi đủ oracle chỉ nhờ bất biến phụ.** |
| Thay đổi so với gốc | Tách từ TC-API01-029: header khác lớp body/query. |

### TC-API01-049 — Cập nhật riêng name, giữ các giá trị cơ bản khác

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-049 |
| Requirement / Technique | FR-04; D DP-NAME-01; S ST-DATA-01, POST-01; Z CP-DATA-01 |
| Mục tiêu | Cập nhật riêng name, giữ các giá trị cơ bản khác. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Fixture name cũ khác Nguyen Van A; address/phone cũ hợp lệ đã xác nhận. Body ba field đầy đủ lấy giá trị snapshot, không sửa field vắng. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); body đầy đủ: name="Nguyen Van A", phone/address sao chép giá trị fixture hợp lệ trước request. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Tên được cập nhật theo FR-04; phone/address được gửi lại đúng giá trị trước nên không bị thay bởi tác vụ chỉ đổi tên, role và hồ sơ U2 không đổi. Không phải partial update vì body đủ field; không chốt Unicode/trim. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **XĐ — oracle chính nghiệp vụ/black-box xác định; chưa xác nhận fixture sẵn sàng Execute.** |
| Thay đổi so với gốc | Bổ sung hậu điều kiện theo từng field FR-04: baseline001 đổi nhiều field không thay thế việc phát hiện cross-field overwrite. |

### TC-API01-050 — Cập nhật riêng shipping_address, giữ thông tin khác

| Trường | Nội dung |
| --- | --- |
| Test Case ID | TC-API01-050 |
| Requirement / Technique | FR-04; D DP-ADDR-01; S ST-DATA-01, POST-01; Z CP-DATA-01 |
| Mục tiêu | Cập nhật riêng shipping_address, giữ thông tin khác. |
| Tiền điều kiện | Fixture chung §2.2/2.4; dữ liệu cô lập, snapshot và nguồn quan sát phù hợp. Fixture address cũ khác mẫu; name/phone hợp lệ đã xác nhận, body đủ ba field. |
| Test Data | `PUT {{baseUrl}}/api/users/me` (query nếu có ghi rõ); **X-Student-Id: 23120274** cho mọi request mục tiêu, hỗ trợ và khôi phục. H(U1); body đầy đủ: shipping_address="123 Le Loi, Q1, TP.HCM", name/phone sao chép fixture hợp lệ trước request. |
| Các bước | 1. P1 xác nhận tiền điều kiện và snapshot. 2. P2 gửi đúng Test Data, mỗi hàng DDT riêng nếu có.  3. P3 đọc lại dữ liệu/quyền theo mục tiêu, so oracle chính, ghi riêng các checkpoint còn TBD. 4. P4 cleanup theo giới hạn §2.2; chưa thực hiện các bước dự kiến này ở thời điểm sinh. |
| Expected Result | Địa chỉ mặc định được cập nhật theo FR-04; name/phone gửi lại giá trị trước vẫn giữ ý nghĩa dữ liệu đó; role và hồ sơ U2 không đổi. Không suy việc đổi địa chỉ hồ sơ làm đổi đơn cũ; không yêu cầu partial-update semantics. **HTTP status, success/error response schema: TBD riêng**, không làm mất oracle nghiệp vụ đã có. Không có verdict thực thi. |
| Mức độ oracle | **XĐ — oracle chính nghiệp vụ/black-box xác định; chưa xác nhận fixture sẵn sàng Execute.** |
| Thay đổi so với gốc | Bổ sung hậu điều kiện address và bất biến field đối chứng khác case chỉ cập nhật name. |

## 4. Những thay đổi so với bản gốc

### 4.1. Oracle của ID hiện có

| Nhóm/ID | Bản gốc | v2 và lý do |
| --- | --- | --- |
| 001/002 | TBD chính do response/canonical mapping | **XĐ chính** cho cập nhật dữ liệu cơ bản và biên phone hợp lệ theo FR-04; mapping là điều kiện quan sát |
| 010 | TBD chuỗi cập nhật | **XĐ chính** cho dữ liệu sau từng cập nhật đầy đủ hợp lệ; không tự thêm partial-update policy |
| 011–014 | TBD do chưa biết reject/normalize | **XĐ chính** về bất biến không ghi phone vi phạm FR-04; policy phản hồi/chuẩn hóa chi tiết vẫn TBD |
| 024 | TBD do parser/error contract | **XĐ chính** về không cập nhật từ body JSON không thể giải mã; không gán lỗi framework |
| 026 | TBD text Unicode/trim gộp nhiều field | Giữ **TBD chính** cho tên Unicode; tách address và trim. Không giữ TBD chỉ vì thiếu status/schema |
| 030 | TBD do policy lặp tổng quát | **XĐ chính** cho các giá trị cơ bản/quyền sau PUT đầy đủ lặp; không assert idempotency mọi side effect |
| 031 | TBD vì chưa chứng minh Parameterized Query | **XĐ chính** cho black-box không thay user khác/role qua name; chứng minh query/bind vẫn ngoài oracle API |
| 003–009 | XĐ chính | Giữ XĐ; 007 chỉ field id, 009 chỉ nâng role; phần DDT khác chuyển sang ID mới |
| 015–018, 029 | DDT nhiều field/kênh | Thu hẹp mục tiêu ID cũ; chuyển phần tách sang ID mới, vẫn TBD đúng chỗ |
| ID cũ khác | Case nháp | Giữ ID và mục tiêu; tiếp tục TBD nếu policy chính thiếu |

Có **10 ID cũ** đổi nhãn oracle từ TBD sang XĐ: 001, 002, 010, 011, 012, 013, 014, 024, 030, 031. Không sửa bản gốc để hợp thức hóa nhãn mới; diễn giải/giới hạn ở v2 là hiệu chỉnh phân tích của AI để sinh viên review.

### 4.2. ID mới và lý do tách/bổ sung

| ID mới | Nguồn và mục tiêu độc lập | Oracle chính |
| --- | --- | --- |
| TC-API01-033 | Tách từ TC-API01-015: required/partial update của địa chỉ là policy độc lập với tên. | TBD |
| TC-API01-034 | Tách từ TC-API01-015: omission phone khác policy tên/địa chỉ. | TBD |
| TC-API01-035 | Tách từ TC-API01-016: nullable địa chỉ độc lập nullable tên. | TBD |
| TC-API01-036 | Tách từ TC-API01-016: quyền xóa phone khác định dạng một phone được cung cấp. | TBD |
| TC-API01-037 | Tách từ TC-API01-017: dữ liệu trống của trường địa chỉ. | TBD |
| TC-API01-038 | Tách từ TC-API01-017: phân biệt phone rỗng với phone 9/12 chữ số. | TBD |
| TC-API01-039 | Tách từ TC-API01-018: type policy của địa chỉ. | TBD |
| TC-API01-040 | Tách từ TC-API01-018: ép kiểu và giữ leading zero khác policy text. | TBD |
| TC-API01-041 | Tách từ TC-API01-026: policy địa chỉ riêng, không còn trong DDT tên. | TBD |
| TC-API01-042 | Tách từ TC-API01-026: trim khác repertoire. | TBD |
| TC-API01-043 | Tách từ TC-API01-026: trim địa chỉ riêng. | TBD |
| TC-API01-044 | Tách từ TC-API01-031: address là bề mặt đầu vào khác, không gửi đồng thời SQL trong name. | XĐ |
| TC-API01-045 | Tách từ TC-API01-009: bất biến không làm hỏng role bằng null/kiểu khác, không sao chép case role=admin. | XĐ |
| TC-API01-046 | Tách từ TC-API01-007: hai tên field là hai điểm binding có thể khác; mỗi ID mới chỉ giữ một kênh/field. | XĐ |
| TC-API01-047 | Tách từ TC-API01-029: vị trí query, không phải body additionalProperties. | TBD |
| TC-API01-048 | Tách từ TC-API01-029: header khác lớp body/query. | TBD |
| TC-API01-049 | Bổ sung hậu điều kiện theo từng field FR-04: baseline001 đổi nhiều field không thay thế việc phát hiện cross-field overwrite. | XĐ |
| TC-API01-050 | Bổ sung hậu điều kiện address và bất biến field đối chứng khác case chỉ cập nhật name. | XĐ |

- ID 033–048 là phần tách từ DDT gốc theo field, kênh hoặc mục tiêu khác; dữ liệu đó đã được bỏ khỏi case cha ở v2.
- ID 049–050 bổ sung hậu điều kiện cập nhật theo từng field trong **body đầy đủ**, để phân biệt cập nhật đúng field với ghi đè field đối chứng. Không dùng hai case này để giả định partial update.
- Không cấp case mới chỉ vì có thêm status/schema assertion, đổi nhãn Security/Domain hoặc thêm giá trị khác trong cùng miền không có mục tiêu riêng.

## 5. Ghi nhận phạm vi trong lần hiệu chỉnh

Đây là thống kê thiết kế thuộc yêu cầu hiệu chỉnh bước 6, **chưa phải đầu ra bước 7 hoặc Human Audit**.

| Kỹ thuật | ID/phạm vi | Giới hạn |
| --- | --- | --- |
| Domain Partitioning | Tất cả field chính; 015–018 và 033–040 tách thiếu/null/trống/kiểu theo field | Không đặt required/type policy mới; nhiều case chính còn TBD |
| BVA | 011/001/002/012 tương ứng 9/10/11/12 chữ số | Không nhân đôi biên chung hoặc đặt length name/address |
| State/Data Analysis | 010 cập nhật liên tiếp; 030 lặp dữ liệu; 049–050 field đối chứng; snapshot P1/P3 | FR-04 không có State Machine chính thức, không tuyên bố coverage FR-10 |
| Authentication | 003–005; đối chứng cập nhật/danh tính ở 001/006 | Không đặt TTL, thuật toán/claim hoặc status mới |
| Authorization/IDOR | 006/007/008/046 | Hai user có quyền sửa chính mình; không coi JWT_U2 là token sai |
| Role Escalation/Mass Assignment | 009/045; field dư khác ở 028/029 | Không nhân đôi case 009 chỉ vì hai nhãn; reject/ignore và atomicity vẫn TBD |
| SQL Injection black-box | 031 name, 044 shipping_address | Hai bề mặt input riêng; chỉ kết luận tác động quan sát, không chứng minh parameterization |
| Schema | Gắn CP-OBS-01–03 vào P3, giữ CP-SCHEMA-01/02 pending | Không có exact response schema/status có căn cứ, không thêm case “thu response” để tăng số |
| SEC-04 | 032 marker, còn thiếu evidence UI/render | JSON chứa HTML không tự là bug; không tự chạy UI |
| SEC-01/07, SEC-03 | Giữ mức áp dụng theo Q | Không tạo password/OTP hoặc yêu cầu admin-only cho FR-04 |

Phone thiếu/null/rỗng ở 034/036/038 vẫn TBD vì policy không có phone khác với phone có giá trị sai tại 011–014. Điều này tránh biến FR-04 thành required/nullable rule chưa được đặc tả.

## 6. Thống kê v2 và phần chưa đủ căn cứ

| Chỉ tiêu | Bản gốc | v2 |
| --- | --- | --- |
| Tổng case AI-generated | 32 | **50** |
| ID cũ được giữ | 001–032 | **001–032**, nội dung hiệu chỉnh ghi ở mục 4 |
| ID mới | Không có | **033–050: 18** |
| Oracle chính XĐ | 7 | **22** |
| Oracle chính TBD | 25 | **28** |
| Status/response schema còn thiếu | 32/32 | **50/50**, không cộng lại thành case TBD chính |
| Case xác nhận sẵn sàng Execute | Chưa có | Chưa xác nhận fixture/quan sát; không suy từ XĐ thành ready |
| Case đã thực thi | 0 | **0**; không có PASS/FAIL hoặc evidence thực nghiệm |

**22 case XĐ:** 001–014, 024, 030, 031, 044, 045, 046, 049, 050.

**28 case TBD:** 015–023, 025–029, 032–043, 047–048.

Diễn biến số lượng: 7 oracle chính XĐ cũ + 10 oracle được hiệu chỉnh + 5 XĐ mới = 22. TBD còn lại của 32 ID cũ là 15; thêm 13 ID mới TBD = 28. Tổng 50 = 22 + 28.

- V2 có **50 case nháp với mục tiêu được phân biệt**, vượt mốc 35 về số lượng bản thiết kế, nhưng **chưa có 35 case có oracle chính xác định**: còn thiếu 13 để đạt mốc đó.
- Không dùng 28 case TBD để tuyên bố mọi yêu cầu đã kiểm chứng/đủ sẵn sàng thực thi. Case XĐ cũng cần fixture và phương tiện quan sát được xác nhận; schema checkpoint TBD không được biến thành assertion luôn PASS.
- Còn thiếu: required/nullable/type/normalization của một số đầu vào; parser/media-type/field-dư policy cụ thể; success/error contract; phương tiện quan sát role/hồ sơ; bằng chứng UI/Parameterized Query cho kết luận đầy đủ tương ứng.
- Không đặt thêm chính sách để giảm số TBD hoặc tạo case trùng lặp cho đủ 35 oracle. Chưa tự xác nhận sinh viên đã phê duyệt v2.

**Điểm dừng:** chỉ lưu bản AI-generated v2 và ghi nối tiếp AI Audit; giữ nguyên bản gốc. Chưa bước 7, Human Audit, Extend, Execute, phân tích implementation hoặc thao tác Git ghi dữ liệu. Chờ sinh viên review.

