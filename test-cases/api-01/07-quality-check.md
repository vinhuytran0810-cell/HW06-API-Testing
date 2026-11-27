# API 01 — Bước 7: Quality Check và bàn giao

- **API:** `PUT /api/users/me` — FR-04 — Pool A; MSSV 23120274.
- **Skill:** [api-test-generator](../../.agents/skills/api-test-generator/SKILL.md), mục 4, Bước 7.
- **Đối tượng kiểm tra chính:** [bộ AI-generated v2](06-ai-generated-test-cases-v2.md); [bản gốc](06-ai-generated-test-cases.md) được dùng đối chiếu lịch sử.
- **Phạm vi:** kiểm tra tài liệu, cấu trúc, số lượng, truy vết, coverage thiết kế, trùng lặp và vấn đề mở. Không sửa case, không Human Audit, không gán nhãn VALID/INVALID/INCOMPLETE thay sinh viên, không thực thi API hoặc phân tích implementation.
- Đây là nhận xét chất lượng **của AI**, chưa phải phê duyệt của sinh viên hoặc bằng chứng thực thi.

## 1. Kết luận bàn giao

V2 có **50 case**, đủ cấu trúc bảy trường theo Skill và giữ ID 001–032, bổ sung 033–050. Nhãn trong v2 gồm **22 oracle chính XĐ**, **28 oracle chính TBD**. Tất cả còn thiếu HTTP status/response schema cụ thể; điều này không làm mất các oracle nghiệp vụ đã xác định.

Có thể bàn giao bộ thiết kế và danh sách vấn đề để sinh viên đánh giá độc lập. **Chưa xác nhận đủ điều kiện Execute hoặc coverage hoàn chỉnh**: còn 28 mục tiêu thiếu policy/bằng chứng, thiếu phương tiện quan sát/fixture đã xác nhận và chưa có schema response làm chuẩn.

50 bản thiết kế vượt mốc 35 về số lượng; **không đồng nghĩa đã có 35 case có oracle chính xác định**. Với nhãn v2 hiện tại, còn cách mốc đó 13 case; không tự thêm quy tắc hoặc case trùng để lấp số lượng.

## 2. Nguồn và phương pháp kiểm tra

| Nguồn | Vai trò |
| --- | --- |
| [AGENTS.md](../../AGENTS.md) | Phạm vi, bảo toàn kết quả, review, audit và Git |
| [Đặc tả API](../../specs/api_specification.md), §2–2.2 | Bearer, operation, request sample; không có response PUT |
| [Yêu cầu SUT](../../eshop-sut/README.md), FR-04, SEC-01–07 | Quyền cập nhật, phone, role và bảo mật |
| [Bước 1](01-contract-analysis.md) | Hợp đồng và GAP-01–09 |
| [Bước 2](02-domain-analysis.md) | Domain/BVA |
| [Bước 3](03-state-analysis.md) | Snapshot, hậu điều kiện và bất biến |
| [Bước 4](04-security-analysis.md) | Security oracle và giới hạn evidence |
| [Bước 5](05-schema-analysis.md) | Schema/checkpoint và TBD |
| Bản gốc và v2 ở đầu tài liệu | Lịch sử ID, thống kê, DDT và Expected Result |

Đã đọc tài liệu và kiểm tra cấu trúc bằng việc trích các block case/bảng Markdown trong bộ nhớ; không tạo script phụ. Đếm case theo đề mục và field Test Case ID, không theo request/assertion/hàng DDT. Kiểm tra tham chiếu bằng ID đầy đủ và link file, kết hợp đối chiếu nội dung nghiệp vụ. Tồn tại ID tham chiếu chỉ chứng minh liên kết có nguồn, không tự chứng minh mọi oracle đã đúng.

Hash SHA-256 của hai bản AI-generated được ghi nhận để đối chiếu bảo toàn:

| File | SHA-256 |
| --- | --- |
| 06-ai-generated-test-cases.md | `FC97D6FE7F65142B62E2516EFF623515D35483C36702AB53DEE471A3F51C3BD5` |
| 06-ai-generated-test-cases-v2.md | `994041FD97026DD7D08C8C92E76FEB87BD5CD910F12CF066397080B256246041` |

## 3. Cấu trúc, số lượng và truy vết

| Nội dung kiểm tra | Kết quả đọc tài liệu | Ý nghĩa/giới hạn |
| --- | --- | --- |
| Đề mục và ID | 50, liên tục TC-API01-001–050; không thiếu/dư hoặc ID trùng | Không đổi ID của case cũ |
| Bảy trường bắt buộc | 350/350 ô trường có nội dung; không thiếu trường | Test Case ID, Requirement / Technique, Mục tiêu, Tiền điều kiện, Test Data, Các bước, Expected Result |
| Nhãn oracle | 22 XĐ + 28 TBD = 50 | Đúng số v2 công bố; không phải Human Audit |
| Header sinh viên trong Test Data | 50/50 ghi X-Student-Id: 23120274 | Quy ước chung còn áp cho login/GET/cleanup; chưa có evidence request thật |
| Truy vết FR-04 | 50/50 có trong Requirement / Technique | Mã FR chung không thay thế truy vết chi tiết |
| ID phân tích đầy đủ trong Requirement / Technique | 97 ID khác nhau; không tìm thấy ID đầy đủ bị đứt so với bước 1–5 | Bao gồm DP/BVA/ST/INV/POST/SA/SC/CP/GAP. Dạng viết tắt bằng dấu / hoặc khoảng ID vẫn phải đọc theo nguồn; chưa là traceability tự động hoàn chỉnh |
| Link tài liệu Markdown | 10 đích khác nhau, đều tồn tại | Không xác nhận nội dung mọi phiên bản đã được con người phê duyệt |
| Test Data trùng nguyên văn | 0 nhóm | Không đủ để kết luận không có trùng ý nghĩa |
| Tiêu đề trùng nguyên văn | 0 nhóm | Cần xem mục 6 về chồng lấn mục tiêu |
| Case có DDT trong Test Data | 13 | Các hàng DDT không được cộng thêm vào số 50 |

**DDT:** 003, 017, 018, 020, 023, 025, 031, 037, 038, 039, 040, 044, 045. Có quy ước reset/đối chiếu từng hàng độc lập; chưa có bảng dữ liệu thực thi chuẩn hóa cho mỗi hàng.

**XĐ theo v2:** 001–014, 024, 030, 031, 044, 045, 046, 049, 050.

**TBD theo v2:** 015–023, 025–029, 032–043, 047–048.

Không phát hiện thiếu hình thức một trong bảy trường. Tuy nhiên tham chiếu quy trình P và fixture chung chỉ là thiết kế; chưa thay thế việc xác định JSONPath/nguồn role, dữ liệu thật và cleanup khả thi.

## 4. Coverage thiết kế và khoảng trống

### 4.1. Tham số, Domain Partitioning và BVA

Các ID trong bảng đều có tiền tố TC-API01-. “Đã có thiết kế” không có nghĩa đã chạy hoặc oracle đã hoàn chỉnh.

| Đầu vào/quy tắc | Case liên quan | Kết quả coverage thiết kế và giới hạn |
| --- | --- | --- |
| name | 001, 015–018, 026, 031, 042, 049 | Có mẫu, thiếu/null/trống/sai kiểu, Unicode, trim, text SQL và cập nhật riêng. Phần nullable/type/Unicode/trim còn TBD; không có max length có căn cứ |
| shipping_address | 001, 033, 035, 037, 039, 041, 043, 044, 050 | Có nhóm tương ứng và cập nhật riêng; địa chỉ nhiều dòng ở phân tích chưa có đại diện rõ riêng trong v2 |
| phone | 001/002, 011–014, 019/020, 034/036/038/040 | Có biên, đầu 0, chữ cái, Unicode, format/normalization, thiếu/null/trống/kiểu; nhiều policy còn TBD |
| Authorization | 003–005, đối chứng 001/006 | Thiếu/rỗng/token không JWT/chữ ký sai và đúng danh tính. Parser/scheme/header lặp, lifecycle/expiry còn thiếu policy và chưa có case riêng |
| Body | 021–024, 027; case thiếu từng field | Có absent, object rỗng, top-level khác mẫu, JSON hỏng, duplicate key. Không tự coi mẫu object là formal schema |
| Content-Type | 025, header nền | Thiếu/khác media type là DDT khảo sát, chưa có expected policy |
| Field quyền/định danh | 007/008/009, 045/046 | Body id/user_id, query user_id, nâng role và role khác kiểu. Field ngoài mẫu không tự là tham số được hỗ trợ |
| Field dư khác | 028/029, 047/048 | Email/body/query/header dư có thiết kế; policy chính vẫn TBD |
| Path | Không có parameter được A khai báo | Không thiếu case id trên path vì operation không có tham số đó; không tự thêm route |

**BVA độ dài phone:** 9/10/11/12 chữ số tương ứng 011/001/002/012. Có đủ **bốn đại diện duy nhất** cho hai biên nguyên được nêu; chưa có dữ liệu thực thi. Oracle của 011/012 là không làm phone hợp lệ thành giá trị sai, không chứng minh mọi nhánh reject/normalize đúng.

Các đại diện còn thiếu/đáng cân nhắc sau review:
- D DP-PHONE-12 có `0000000000`, chưa có case trong v2. Đây vẫn thuộc miền 10 chữ số đầu 0, **không tự coi là coverage mới độc lập hoặc bắt buộc thêm case** chỉ để tăng số.
- D DP-ID-02 có field định danh ngoài mẫu null/không tồn tại/sai kiểu, chưa có đại diện riêng. Policy chưa rõ; chỉ có bất biến chủ thể chắc chắn.
- D DP-ROLE-04 có chuỗi rỗng; case 045 hiện có cùng role/null/số/array/object, chưa có `""`. Có thể bổ sung hàng DDT sau quyết định sinh viên, không tự tăng một case chỉ vì thêm đại diện.
- D DP-ADDR-05 có nhiều dòng; v2 mới thể hiện Unicode/trim. Chưa có căn cứ quy định accept/reject nhiều dòng.
- Không có giới hạn name/address/token hoặc TTL cụ thể để tạo BVA mới; không xem đó là lỗi thiếu test cho một ràng buộc đã biết.

### 4.2. State/Data Analysis

- S và R FR-04 không có State Machine chính thức; không tạo trạng thái “profile hoàn tất/khóa”, không dùng trạng thái đơn hàng FR-10.
- Snapshot P1/P3 và INV-01–04/POST-01 được đưa vào các oracle phù hợp.
- 010 kiểm tra giá trị sau hai cập nhật đầy đủ khác nhau; 030 kiểm tra dữ liệu sau request đầy đủ lặp; 049/050 kiểm tra đúng field và field đối chứng.
- Các case partial/null/thiếu giữ TBD, không tự gán rollback hoặc merge.
- Không có mẫu số cạnh trạng thái được đặc tả để tuyên bố coverage phần trăm State Transition.

### 4.3. SEC và Schema

| Yêu cầu/kỹ thuật | Case/phạm vi | Tình trạng còn lại |
| --- | --- | --- |
| SEC-01 | Ngoài chức năng trực tiếp của PUT hồ sơ | Không có bằng chứng lưu mật khẩu; không tuyên bố đã bao phủ hoặc PASS |
| SEC-02 | 003–005 và đối chứng cập nhật đúng user | Chưa xác nhận fixture/token/nguồn quan sát; lifetime policy còn thiếu |
| SEC-03 | Không yêu cầu admin-only cho FR-04 | Hệ quả nâng quyền liên quan gián tiếp; không tự thêm admin API vào thực thi |
| SEC-04 | 032 marker markup | API không đủ chứng minh escape/không innerHTML; cần UI/render evidence riêng, case chính TBD |
| SEC-05 | 031/044 qua hai field text | Oracle black-box về dữ liệu/quyền có nguồn; chưa chứng minh cấu trúc Parameterized Query |
| SEC-06 | 009/045 | Bất biến role rõ; chưa có nguồn quan sát role thực tế đã xác nhận |
| IDOR/ownership FR-04 | 006/007/008/046 | Có kiểm tra chủ thể và kênh định danh; phạm vi dữ liệu quan sát còn phụ thuộc fixture |
| Request schema | Dữ liệu thiếu/null/kiểu/top-level/JSON hỏng | Phần lớn policy còn thiếu, không dựng formal schema từ mẫu |
| Success/error response schema | CP-OBS-01–03 trong P3; CP-SCHEMA-01/02 chờ làm rõ | **0 case có exact response schema đầy đủ làm oracle**. 50/50 còn thiếu status/schema riêng; đây là khoảng trống chưa giải quyết của mục tiêu Schema |

Ghi nhận response không đồng nghĩa schema validation có chuẩn. Không đánh PASS chỉ vì parse JSON thành công hoặc không có query error; không suy password hash/XSS an toàn từ JSON.

## 5. Chất lượng oracle, tiền điều kiện và bằng chứng

| Vấn đề | Case/phạm vi | Nhận xét của AI và đề xuất, chưa sửa case |
| --- | --- | --- |
| QC-01 — thiếu oracle chính | 28 case TBD | Cần làm rõ policy tương ứng. Giữ các nháp để sinh viên quyết định; không dùng bất biến phụ để giả thành đủ oracle chính |
| QC-02 — thiếu status/schema | 50/50 | Tách checkpoint HTTP/schema khỏi oracle nghiệp vụ. Chưa có căn cứ cho exact response match hoặc error envelope; không thay bằng schema cho phép mọi thứ |
| QC-03 — khả năng quan sát | Snapshot/role của nhiều case, đặc biệt 005/009/031/044/045 | GET không có schema; role có thể không có trong response. Cần nguồn quan sát đáng tin cậy, không chỉ echo/token cũ; chưa có xác nhận sẵn sàng |
| QC-04 — fixture/cleanup | Toàn bộ bộ case | User/ID/token, snapshot khác baseline, chữ ký sai đã xác định và khôi phục chưa được hiện thực. Không kết luận precondition bất khả thi, nhưng chưa chứng minh có thể tạo/khôi phục |
| QC-05 — oracle cập nhật hợp lệ | 001/002/010/030/049/050 | FR-04 hỗ trợ kiểm tra dữ liệu sau cập nhật; giữ tách mapping khỏi oracle. Trước Execute cần định nghĩa cách so giá trị biểu diễn, thời điểm quan sát và dữ liệu baseline, không tự đặt JSONPath hoặc latency |
| QC-06 — phone sai | 011–014 | Oracle bất biến không ghi giá trị sai có căn cứ. Giới hạn: chưa phân định mọi phép normalize/reject hoặc ảnh hưởng field khác; không coi “kết quả hợp lệ” là bằng chứng toàn bộ validation đúng |
| QC-07 — JSON hỏng | 024 | Không cập nhật từ JSON không giải mã được là diễn giải từ hợp đồng JSON, chưa có câu rollback nguyên văn trong A/R. Sinh viên cần review phạm vi diễn giải này; không mở rộng sang mọi request lỗi hoặc tự gán mã lỗi |
| QC-08 — DDT chưa thành dữ liệu chạy | 13 case | Có đại diện và quy tắc tách/reset, nhưng chưa có Row ID/fixture riêng từng hàng hoặc serialization thực thi. Cần bảo toàn thiếu/null, raw duplicate key và JSON hỏng khi triển khai sau này |
| QC-09 — giới hạn quan sát security | 003–009/031/044/046 | Hai user thử nghiệm và role đủ phục vụ mục tiêu có điều kiện, chưa chứng minh không tác động mọi user ngoài tập quan sát. Cần phạm vi dữ liệu cô lập và tránh kết luận an toàn toàn hệ thống |
| QC-10 — evidence ngoài API | 032, SEC-05/01/07 | Chưa có UI/query/storage/OTP evidence. Không bổ sung implementation review hoặc thao tác UI trong bước QC này |

Đây là nhận xét về thiết kế, **không phải bug SUT** và không phải nhãn Human Audit cho từng case. Những diễn giải cần sinh viên review không tự bị đổi thành nhãn TBD/XĐ trong file v2.

## 6. Trùng lặp và chồng lấn

Kết quả kiểm tra nguyên văn: **0 ID trùng, 0 tiêu đề trùng, 0 nhóm Test Data trùng chính xác**. Đối chiếu mục tiêu/miền/actor/hậu điều kiện chưa tìm thấy một cặp đủ căn cứ để **đề nghị loại ngay**. Số case trùng đề nghị loại hiện tại: **0**; không khẳng định đã chứng minh mọi case độc lập tuyệt đối.

| Nhóm cần chú ý | Phần dùng chung | Khác biệt giúp giữ lại ở thời điểm QC |
| --- | --- | --- |
| 001/002 với 010 | Dữ liệu phone tại hai biên | Case biên đơn so với kiểm tra cập nhật lần sau không dùng dữ liệu cũ; không cộng các request trong 010 thành case mới |
| 001 với 049/050 | Cập nhật thông tin cơ bản | 049/050 chỉ đổi một field, gửi lại field đối chứng trong body đầy đủ. Phải hiện thực fixture đúng để không vô tình trùng baseline001 |
| 001 với 030 | Request B0 | 030 có checkpoint sau lần lặp, chỉ xét dữ liệu/quyền; không đòi toàn bộ side effect bất biến |
| 007/046/008 | INV-01 | id body, user_id body và user_id query là ba bề mặt đầu vào; không chạy thêm cùng payload ở case cha |
| 009/045 | INV-02 | Nâng thành admin khác rủi ro làm hỏng role bằng null/kiểu khác. Cùng-role trong DDT045 là đối chứng, không tách thành một case khác |
| 031/044 | Chuỗi text, INV-01/02 | Hai field khác nhau; chỉ gọi là hai bề mặt khảo sát, chưa biết chúng đi qua query sink khác nhau |
| 015–018 và 033–043 | Cùng nhóm thiếu/null/trống/kiểu/text | Tách policy từng field có thể hợp lý; oracle vẫn TBD. Không coi thêm giá trị trong cùng policy là coverage mới |
| 029/047/048 | Field dư | Body/query/header là các lớp khác nhau. Việc tách chỉ tăng thiết kế, không tạo thêm oracle đã xác định |

Đề xuất cho sinh viên: khi review có thể gộp các nhóm nếu cùng policy và cùng khả năng quan sát; trước đó cần giữ truy vết ID/lịch sử. **Chưa gộp, xóa, đổi ID hoặc sửa Expected Result** trong bất kỳ bản AI-generated nào.

## 7. Thống kê bàn giao theo Skill

| Chỉ tiêu | Kết quả |
| --- | --- |
| Case AI sinh trong bản gốc | 32 |
| Case trong bộ bàn giao v2 | **50**; không cộng bản gốc để thành 82 |
| Case có oracle chính XĐ theo v2 | **22** |
| Case còn TBD chính theo v2 | **28** |
| Case trùng đề nghị loại ngay | **0**; có nhóm chồng lấn cần sinh viên cân nhắc ở mục 6 |
| Case có oracle nghiệp vụ để chuẩn bị thiết kế thực thi | **22 có điều kiện**, chưa xác nhận fixture/quan sát |
| Case xác nhận đủ điều kiện thực thi ngay | **0 được xác nhận**; không đồng nghĩa 50 đều thiếu oracle nghiệp vụ |
| Case đã thực thi | **0**; không có PASS/FAIL hoặc bug đã chứng minh |
| Coverage schema response có chuẩn đầy đủ | **Chưa có** |
| So mục tiêu ≥35 case | 50 bản thiết kế; chỉ 22 oracle chính XĐ, chưa có 35 case đủ oracle chính |

22 XĐ và 28 TBD là thống kê nhãn thiết kế hiện hữu, không phải kết quả Human Audit. Không tạo bảng VALID/INVALID/INCOMPLETE hoặc tự xác nhận sinh viên đã review từng case.

## 8. Bàn giao và điểm dừng

Bộ bàn giao gồm bản gốc để giữ lịch sử, v2 để sinh viên xem xét cùng phân tích bước 1–5, và tài liệu Quality Check này. Những phần cần ưu tiên giải quyết khi sinh viên yêu cầu tiếp: response contract; policy đầu vào của 28 case TBD; phương tiện quan sát/fixture/cleanup; các diễn giải oracle và nhóm chồng lấn ở mục 5–6.

Không tự sửa bản test case, sinh thêm case, Human Audit, Extend, Execute, phân tích implementation hoặc thao tác Git ghi dữ liệu. Ghi nối tiếp tương tác vào AI Audit Report và **dừng để sinh viên review**.

