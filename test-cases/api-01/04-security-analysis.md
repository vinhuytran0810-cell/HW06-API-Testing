# API 01 — Bước 4: Security Analysis

- **API mục tiêu:** `PUT /api/users/me` — FR-04 — Pool A; MSSV 23120274.
- **Skill:** [api-test-generator](../../.agents/skills/api-test-generator/SKILL.md), mục 4, Bước 4.
- **Trạng thái:** phân tích của AI, chờ sinh viên review; chỉ xác định tình huống, đại diện dữ liệu và oracle.
- **Giới hạn:** chưa phân tích implementation, chưa sinh test case hoàn chỉnh, chưa thực thi API/UI hoặc chuẩn bị dữ liệu. Không sửa tài liệu bước trước/source; không staging/commit/push.

## 1. Nguồn và quy tắc đánh giá

| Ký hiệu | Nguồn | Nội dung sử dụng |
| --- | --- | --- |
| A | [Đặc tả API](../../specs/api_specification.md), §2–2.2 | PUT hồ sơ, Bearer header, body name/shipping_address/phone; GET hồ sơ hỗ trợ |
| R | [Yêu cầu SUT](../../eshop-sut/README.md), FR-02/04/12 và mục 9 | Xác thực, sở hữu hồ sơ, quyền admin và SEC-01–SEC-07 |
| C | [Bước 1](01-contract-analysis.md), mục 3–7 | Hợp đồng, phạm vi API/UI, GAP-01–GAP-09 |
| D | [Bước 2](02-domain-analysis.md), mục 2–9 | Các phân vùng đầu vào và miền TBD |
| S | [Bước 3](03-state-analysis.md), mục 3–6 | ST-DATA, INV-01–04, POST-01, snapshot/fixture và giới hạn hậu điều kiện |
| G | [AGENTS.md](../../AGENTS.md) | Chỉ phạm vi hiện tại, review, bằng chứng, audit và Git |

Nội dung SEC/FR được gắn nguồn là **đặc tả**. Lựa chọn tình huống/đại diện/cách quan sát là **nhận định thiết kế của AI**. Không có kết luận về hành vi code, bug hoặc kết quả thực nghiệm. Không dùng ví dụ payload làm schema hoặc tự lấp thiếu sót.

- **HTTP status và response schema: TBD cho mọi tình huống** của API mục tiêu. Không lấy message/status đơn lẻ làm bằng chứng quyền hoặc dữ liệu không đổi.
- **Oracle xác định:** hậu điều kiện có nguồn, như không cập nhật trái phép, không sửa user khác hoặc không đổi role.
- **Oracle một phần:** biết bất biến nhưng chưa biết xử lý field dư, response, atomicity hoặc cơ chế quan sát.
- **TBD/khảo sát:** thiếu chính sách; chưa đủ căn cứ gọi chấp nhận/từ chối là bug.
- **Cần bằng chứng ngoài API:** UI runtime/DOM, lưu trữ hoặc cấu trúc truy vấn; chưa thu thập các bằng chứng đó.

SEC-02/06 có thể phát hiện vi phạm qua API nếu quan sát được dữ liệu/quyền đáng tin cậy. Việc một số request không vi phạm không chứng minh an toàn cho toàn SUT.

## 2. Mức độ áp dụng SEC-01 đến SEC-07

Tất cả bảy yêu cầu có trong R mục 9, dòng 278–284; không thiếu mã nào.

| Yêu cầu | Nội dung đặc tả | Mức độ áp dụng với PUT hồ sơ | Có thể kiểm chứng qua API đến đâu? | Bằng chứng bổ sung/giới hạn |
| --- | --- | --- | --- | --- |
| SEC-01 | Mật khẩu không lưu plaintext | **Không trực tiếp:** A §2.2 không nhận/lưu/đổi password | Không thể suy ra cách lưu password từ PUT, từ đăng nhập thành công hoặc response không có password | Cần bằng chứng lưu trữ/cơ chế hash ở phạm vi được phép sau này. Không khảo sát DB/code ở bước này; không đánh dấu yêu cầu đã PASS |
| SEC-02 | API bảo mật phải yêu cầu JWT hợp lệ | **Trực tiếp:** A §2 yêu cầu Bearer; FR-04 yêu cầu đã đăng nhập | Xét thiếu/rỗng/không hợp lệ; quan sát không có cập nhật trái phép. JWT hợp lệ là đối chứng để phân biệt lỗi body/môi trường | Chưa có thuật toán, TTL, claim mapping, revocation; GET chưa có schema đầy đủ; negative response không tự chứng minh dữ liệu bất biến |
| SEC-03 | Admin API kiểm tra role admin trong token, không chỉ có token | **Không phải điều kiện admin trực tiếp của PUT hồ sơ**; liên quan gián tiếp khi đánh giá hệ quả nâng quyền | User thường có quyền sửa mình theo FR-04; không đặt oracle “user thường phải bị cấm PUT”. Quyền quản trị sau thao tác chỉ là bằng chứng hỗ trợ nếu được quan sát trong phạm vi phù hợp | Không tự thêm thao tác admin vào phạm vi thực thi. Bất biến role của API mục tiêu dựa SEC-06; kiểm tra admin resource là kiểm tra phụ riêng, không tính thành case PUT khác |
| SEC-04 | Dữ liệu user khi hiển thị UI phải escape, không dùng innerHTML trực tiếp | **Có điều kiện:** name/address có thể được hiển thị | JSON chứa markup hoặc được đọc lại nguyên văn không đủ kết luận XSS. API chỉ hỗ trợ đưa/quan sát dữ liệu | Cần ngữ cảnh render UI và bằng chứng DOM/runtime. Chứng minh “không dùng innerHTML trực tiếp” còn cần bằng chứng cách render; không đọc code ở bước này |
| SEC-05 | Truy vấn CSDL dùng Parameterized Query, không nối chuỗi trực tiếp | **Áp dụng với đầu vào đi vào truy vấn**; chưa biết đường đi dữ liệu cụ thể | Đại diện dấu nháy/cú pháp SQL có thể bộc lộ lỗi hoặc tác động trái quyền; dùng bất biến FR-04 để kiểm tra tác động. Không có biểu hiện bất thường chưa chứng minh parameterization | Cần review xây dựng truy vấn/bind parameters hoặc bằng chứng query đáng tin cậy sau này. Chưa biết DB/query context; không tự viết payload phụ thuộc implementation |
| SEC-06 | API hồ sơ không cho client đổi role | **Trực tiếp, trọng tâm:** Role Escalation/Mass Assignment | So role/quyền thực tế trước/sau; role không đổi kể cả khi body cố gán role. Không được chỉ tin response echo hoặc token cũ | Chưa nêu reject hay ignore field; không suy ra rollback toàn request. Cần nguồn quan sát role/quyền đáng tin cậy; chưa xác nhận GET trả role |
| SEC-07 | OTP đủ entropy, tối thiểu 6 chữ số, có thời hạn, vô hiệu sau dùng | **Không trực tiếp:** PUT hồ sơ không có OTP/reset password | Không tạo tình huống OTP cho operation này; không tuyên bố bao phủ SEC-07 | Cần quy trình forgot/reset và bằng chứng tương ứng ngoài API mục tiêu; chưa thực hiện hoặc tự đặt TTL |

**Phạm vi Authorization:** quyền cập nhật hồ sơ của chính mình đến từ **FR-04**, không chỉ SEC-03. Đường dẫn `/me` không tự bảo đảm chống IDOR; vẫn cần kiểm tra tác động khi có định danh ngoài hợp đồng.

## 3. Dữ liệu và điều kiện quan sát dự kiến

Đề xuất cho thiết kế sau review, chưa tạo fixture hoặc gửi request:

- Hai user thử nghiệm U1/U2, mỗi user có danh tính, token hợp lệ và hồ sơ riêng; biết role hiện tại của U1. Chỉ dùng dữ liệu SUT được phép kiểm thử.
- `<JWT_U1>`, `<JWT_U2>`, `<ID_U2>` là placeholder điều kiện dữ liệu, không phải credential/ID đã xác minh. Không lưu JWT/password thật vào báo cáo.
- Nền body theo A: name `"Nguyen Van A"`, shipping_address `"123 Le Loi, Q1, TP.HCM"`, phone `"0912345678"`. Đây là mẫu tài liệu, chưa chứng minh baseline chạy thành công.
- Khi khảo sát một field, giữ các yếu tố khác theo nền và đúng danh tính. Không trộn token sai với role/id/phone sai để suy đoán lỗi ưu tiên.
- Cần snapshot hồ sơ và role/quyền thực tế trước/sau, dữ liệu cô lập, không có cập nhật cạnh tranh. Dùng GET hồ sơ với token đúng chủ thể nếu khả thi; chưa biết response có đủ trường.
- Việc khôi phục snapshot phải được review tính khả thi, nhất là null/field vắng/normalization. Không sửa DB/source hoặc tự tạo reset endpoint.

## 4. Tình huống Authentication và Authorization/IDOR

Đây là **tình huống phân tích**, không có đầy đủ setup–steps–cleanup của test case thực thi. Phần “Nguồn yêu cầu” chứa cả FR/SEC và truy vết D/S.

| Security ID | Nguồn yêu cầu | Tình huống | Actor/dữ liệu | Kỳ vọng | Cách xác minh | Giới hạn |
| --- | --- | --- | --- | --- | --- | --- |
| SA-AUTH-01 | A §2; R FR-04/SEC-02; D DP-AUTH-01; S ST-DATA-01, INV-03, POST-01 | Đối chứng xác thực hợp lệ, cập nhật chính mình | U1, Bearer <JWT_U1>, body nền | U1 đủ điều kiện quyền cho FR-04; không cần admin. Nếu dữ liệu được chấp nhận thì cập nhật đúng hồ sơ U1, role không đổi | Đối chiếu hồ sơ U1/U2 và role trước/sau; không chỉ message | Response, chuẩn hóa và baseline chưa kiểm chứng; không bảo đảm thành công cho mọi body |
| SA-AUTH-02 | A §2; SEC-02; D DP-AUTH-02/03; S ST-DATA-04, INV-03 | Không cung cấp token | Thiếu Authorization; hoặc header rỗng/Bearer không có token, xét riêng | Không được cập nhật hồ sơ bằng request không có JWT hợp lệ | So snapshot các hồ sơ thử nghiệm liên quan bằng phiên quan sát hợp lệ riêng | Các đại diện cùng bất biến; không mặc định là ba case hoặc gán status |
| SA-AUTH-03 | SEC-02; D DP-AUTH-04; S ST-DATA-04, INV-03 | Token chắc chắn không phải JWT hợp lệ | Bearer `not-a-jwt`; body nền | Không được thực hiện cập nhật trái phép | So dữ liệu trước/sau và phản hồi, tách lỗi parser khỏi hậu điều kiện | Không suy ra mọi JWT sai bị chặn chỉ từ một đại diện |
| SA-AUTH-04 | SEC-02; D DP-AUTH-05; S ST-DATA-04, INV-03 | Token có chữ ký đã xác định không hợp lệ | Placeholder <JWT_SAI_CHỮ_KÝ_ĐÃ_XÁC_ĐỊNH>, body nền | Không được chấp nhận danh tính không xác thực để sửa hồ sơ | Cần bằng chứng fixture token không hợp lệ và snapshot trước/sau | Chưa tạo/sửa token; không tự đoán tên claim hoặc tự cấp credential hợp lệ |
| SA-AUTH-05 | A §2; D DP-AUTH-06/07; C GAP-05 | Khảo sát parser và vòng đời xác thực | Scheme khác; khoảng trắng/header lặp; token gắn tài khoản khóa/xóa; thời hạn chưa rõ | Chính sách cụ thể TBD; nếu đã xác định không có JWT hợp lệ thì không được cập nhật | Ghi điều kiện parser/lifecycle còn thiếu; chỉ kết luận theo trạng thái token đã có căn cứ | Không đặt TTL hoặc lỗi khi khóa/xóa. Token hết hạn chỉ có oracle cụ thể khi policy/token expiry được xác nhận; không tự chọn thời gian chờ |
| SA-IDOR-01 | R FR-04; D DP-ID-01; S ST-DATA-02, INV-01 | Định danh user khác trong body | U1 xác thực; thêm `id:<ID_U2>` hoặc `user_id:<ID_U2>`, xét riêng, giữ field nền | Không được sửa hồ sơ U2 bằng quyền U1; U1 có đổi hay request bị bỏ qua/từ chối TBD | Đọc U2 bằng phiên U2 và so P_U2 trước/sau; theo dõi hồ sơ U1 để phân biệt tác động | id/user_id là field khảo sát ngoài mẫu, không phải tham số được hỗ trợ; không tạo route /users/:id |
| SA-IDOR-02 | R FR-04; D DP-QUERY-02; S INV-01; C GAP-04 | Định danh user khác trong query ngoài khai báo | U1 xác thực; `?user_id=<ID_U2>`; body nền | Không cập nhật U2 bằng quyền U1; cách xử lý query dư TBD | Snapshot riêng U1/U2, không suy ra quyền từ echo ID | Khác kênh đầu vào SA-IDOR-01, cùng bất biến; không tự mở rộng ID existence/schema |
| SA-IDOR-03 | R FR-04; D DP-AUTH-08; S ST-DATA-11, INV-01 | Đối chứng đổi sang danh tính hợp lệ U2 | JWT hợp lệ của U2, cùng route /me | Đối tượng cập nhật là U2, không phải U1; đây không phải bypass xác thực chỉ vì token khác baseline | So hồ sơ hai user theo danh tính token | Tái sử dụng đối chứng quyền, không đếm lại như lỗi IDOR hoặc token sai |

## 5. Role Escalation và Mass Assignment

Mass Assignment ở đây là hướng khảo sát dữ liệu client ngoài các trường cơ bản có thể chi phối thuộc tính khác. **Không giả định implementation đang bind toàn bộ body vào model.**

| Security ID | Nguồn yêu cầu | Tình huống | Actor/dữ liệu | Kỳ vọng | Cách xác minh | Giới hạn |
| --- | --- | --- | --- | --- | --- | --- |
| SA-ROLE-01 | R FR-04/SEC-06; D DP-ROLE-02; S ST-DATA-03/12, INV-02 | Gán role khác cùng field cơ bản: một tình huống gắn cả Role Escalation và Mass Assignment | U1 có role user đã biết; body nền thêm `"role":"admin"` | Role thực tế không đổi. Reject/ignore role và tác động field cơ bản TBD | Quan sát role/quyền thực tế trước/sau qua nguồn được phép; nếu cần phiên mới để tránh token cũ gây sai lệch thì coi là kiểm chứng phụ chưa thực hiện | Response trả role/user hay echo không đủ chứng minh persistence; token cũ không chứng minh quyền mới. Không tự thêm admin API thực thi |
| SA-ROLE-02 | SEC-06; D DP-ROLE-03/04; S INV-02 | Role cùng giá trị hoặc null/rỗng/khác kiểu | Xét riêng role hiện tại, `null`, `""`, số, array/object; các field nền ổn định | Không thay role qua dữ liệu client. Cách chấp nhận/từ chối từng hình thức TBD | So role/quyền, phân biệt field bị bỏ qua với thay đổi thực tế | Không tự đặt type schema hoặc nhiều case chỉ vì đổi biểu diễn trong cùng mục tiêu |
| SA-MASS-01 | R FR-04 (UI email); A §2.2; D DP-EMAIL-01/DP-EXTRA-01; S ST-DATA-08; C GAP-04 | Thuộc tính ngoài mẫu chưa có policy API | Body nền thêm `"email":"new@example.invalid"` hoặc `"extra":"demo"`, từng field riêng | Hành vi cụ thể TBD; không gọi thay email qua API là bug chỉ từ câu cấm ở UI. Bất biến chủ thể/role vẫn có hiệu lực | Ghi tác động quan sát được vào field có thể quan sát và đối chiếu policy khi được làm rõ | Không tự đặt whitelist tuyệt đối/additionalProperties=false; không thêm password/thuộc tính nội bộ chưa được xác định vào hợp đồng |

SA-IDOR-01 cũng liên quan Mass Assignment nếu ID client điều khiển đối tượng cập nhật, nhưng vẫn chỉ có **một ID tình huống**. SA-ROLE-01 không được sao chép thành case thứ hai chỉ vì có hai nhãn kỹ thuật.

## 6. SQL Injection, hiển thị dữ liệu và giới hạn ngoài API

| Security ID | Nguồn yêu cầu | Tình huống | Actor/dữ liệu | Kỳ vọng | Cách xác minh | Giới hạn |
| --- | --- | --- | --- | --- | --- | --- |
| SA-SQL-01 | SEC-05; R FR-04; D DP-TEXT-01; S INV-01/02; C GAP-09 | Dấu nháy hợp pháp trong dữ liệu văn bản | U1; name `"O'An"` hoặc address có dấu nháy, xét từng field | Nếu truy vấn sử dụng dữ liệu thì phải parameterize. Không có căn cứ bắt API từ chối chỉ vì dấu nháy. Không sửa user khác/role do nội dung client | Quan sát dữ liệu U1/U2, role và phản hồi. Bằng chứng parameterization cần cấu trúc query/binding được phép kiểm tra riêng | Không có quy tắc round-trip nguyên văn/name grammar; lỗi đơn lẻ không đủ kết luận SQLi, không có lỗi không chứng minh an toàn |
| SA-SQL-02 | SEC-05; R FR-04; D DP-TEXT-01; S INV-01/02 | Chuỗi giống biểu thức SQL trong field văn bản | U1; giá trị chuỗi `"An' OR '1'='1"` trong name hoặc shipping_address, từng field riêng; phone nền hợp lệ | Dữ liệu không được trở thành cú pháp truy vấn chi phối quyền/phạm vi cập nhật; bất biến chủ thể/role vẫn giữ. Chấp nhận literal hay từ chối theo validation chưa rõ | So dữ liệu/quyền trước/sau của các tài khoản thử nghiệm liên quan. Bằng chứng SEC-05 đầy đủ cần review query/bind ngoài bước này | Chỉ là đại diện chưa chạy, không biết query context/driver/DB từ implementation; không dùng DDL/xóa dữ liệu hoặc tự đặt ngưỡng thời gian |
| SA-SQL-03 | SEC-05; R FR-04; D DP-ID-02/DP-QUERY-02; S INV-01; C GAP-04/09 | Chuỗi giống SQL trong field định danh ngoài mẫu | U1; id/user_id ngoài mẫu chứa chuỗi minh họa SQL, nếu được chọn khảo sát | Không được dùng dữ liệu đó để sửa U2 hoặc đổi quyền. Chưa biết field có đi vào query; response parse/type TBD | Chỉ kết luận tác động quan sát được và bất biến; liên kết SA-IDOR thay vì tạo thêm một oracle SQLi giả | Ưu tiên thấp vì field chưa khai báo; không suy ra query shape hoặc lỗi ID phải có status nhất định |
| SA-XSS-01 | SEC-04; D DP-TEXT-01; C GAP-09 | Marker markup trong dữ liệu hồ sơ và ngữ cảnh hiển thị | U1, name/address `"<b>HW06_MARKER</b>"`, xét riêng field | Khi hiển thị UI phải escape đúng, không dùng innerHTML trực tiếp. JSON chứa marker không tự là vi phạm | API chỉ xác định marker có được lưu/trả không; để kiểm chứng SEC-04 cần quan sát UI/DOM/runtime và nguồn render phù hợp | Marker không thực thi mã giúp quan sát xử lý markup, chưa chứng minh mọi XSS. Chưa gọi API/mở UI/đọc frontend code |
| SA-OBS-01 | C GAP-07; SEC-01/05 cần phân biệt | Đánh giá độ đủ của bằng chứng response | Response thành công/lỗi giả định chưa thu thập | Không suy ra password được hash, query được parameterize hay role lưu an toàn chỉ từ response. Không tự đặt schema/error body để ghi bug rò rỉ | Ghi phát hiện thực tế nếu có trong tương lai và xin làm rõ policy bảo vệ dữ liệu tương ứng | Chưa có response mẫu/contract dữ liệu nhạy cảm của PUT. SA-OBS-01 là nguyên tắc đánh giá bằng chứng, không phải case mới để đếm |

Không biến phone sai định dạng thành tình huống SQLi có oracle đặc biệt; các miền phone đã thuộc D và chỉ giữ làm kiểm soát khi phân tích ở đây. Không tuyên bố payload SQL được chấp nhận là SQL Injection nếu chỉ được lưu như dữ liệu và không có bằng chứng vi phạm.

## 7. Cách xác minh và mức độ bằng chứng

| Nội dung kết luận | Bằng chứng có thể dùng qua API sau khi được phép | Khi nào cần bổ sung |
| --- | --- | --- |
| Chặn cập nhật khi thiếu JWT hợp lệ | Request/response thực và snapshot đối chiếu qua phiên hợp lệ riêng | Nếu không xác định được đối tượng hoặc đọc lại đủ dữ liệu thì chưa đủ oracle; không chỉ nhìn response lỗi |
| Chỉ sửa hồ sơ chính mình | Danh tính U1/U2 và snapshot trước/sau qua GET /me bằng token tương ứng, dữ liệu cô lập | GET chưa có schema/nhất quán đọc; cần làm rõ nguồn quan sát và thời điểm so sánh |
| Không đổi role | Nguồn role thực tế đáng tin cậy, kết hợp quan sát quyền với danh tính/phiên phù hợp | Nếu GET không trả role, cần cơ chế quan sát quyền hoặc dữ liệu lưu trữ được phép. Tạo phiên mới không tự chứng minh mọi claim là dữ liệu DB; không đoán claim |
| SEC-05 Parameterized Query | API chỉ phát hiện một số biểu hiện và tác động | Cần bằng chứng cấu trúc query, binding/review triển khai trong công việc riêng; chưa được thực hiện ở đây |
| SEC-04 escape UI | API hỗ trợ nhập/đọc marker | Cần UI/DOM/runtime; chứng minh không innerHTML cần nguồn render bổ sung. Không yêu cầu API phải escape trước khi lưu nếu chưa đặc tả |
| SEC-01 không plaintext | Không kiểm chứng được cách lưu mật khẩu bằng PUT hồ sơ | Cần bằng chứng lưu trữ/hash thuộc chức năng mật khẩu trong phạm vi riêng |
| SEC-07 OTP | Không thuộc operation này | Cần quy trình OTP và bằng chứng vòng đời/entropy, không mở rộng bước này |

Snapshot là quan sát dữ liệu, không phải một State Machine mới. Dữ liệu không đổi khi thiếu JWT là hậu điều kiện của chặn thao tác trái phép; **không mở rộng thành “mọi request lỗi phải rollback”**. Bất biến role không đổi cũng không bắt các trường cơ bản phải rollback khi role bị bỏ qua.

## 8. Truy vết và tránh trùng lặp

| Mục tiêu chính | Security ID chính | Phân vùng ở D | Trạng thái/bất biến ở S | Quy tắc hợp nhất |
| --- | --- | --- | --- | --- |
| Xác thực đúng/ngăn cập nhật không xác thực | SA-AUTH-01–04 | DP-AUTH-01–05 | ST-DATA-01/04; INV-03; POST-01 | Miền khác nhau có thể cần dữ liệu khác nhưng không đếm assertion snapshot/status thành case độc lập |
| Parser/lifecycle còn thiếu | SA-AUTH-05 | DP-AUTH-06/07 | GAP-05 | Tách khảo sát TBD, không tính case sẵn sàng có expected result hoàn chỉnh |
| Sở hữu hồ sơ/IDOR | SA-IDOR-01–03 | DP-ID-01/02; DP-QUERY-02; DP-AUTH-08 | ST-DATA-02/11; INV-01 | SA-IDOR-01 vừa IDOR vừa Mass Assignment, giữ một tình huống chính |
| Không đổi role | SA-ROLE-01/02 | DP-ROLE-02–04; DP-BODY-06 | ST-DATA-03/12; INV-02 | Role Escalation và Mass Assignment dùng chung SA-ROLE-01; kiểm chứng quyền là checkpoint, không thêm case chỉ vì đổi nhãn |
| Field dư chưa có policy | SA-MASS-01 | DP-EMAIL-01; DP-EXTRA-01 | ST-DATA-08; GAP-04 | Không biến email UI thành oracle API; không đếm mọi field chưa rõ là case lỗi |
| Đầu vào SQL/text | SA-SQL-01–03 | DP-TEXT-01; DP-ID-02; DP-QUERY-02 | INV-01/02; GAP-09 | Cùng request có thể quan sát cả SQLi/IDOR/role, nhưng chỉ một mục tiêu chính khi thiết kế sau này; không đếm lại bất biến |
| Hiển thị an toàn | SA-XSS-01 | DP-TEXT-01 | GAP-09 | Phần API và UI là các lớp bằng chứng; không gán JSON chứa HTML thành case FAIL |
| Giới hạn kết luận từ response | SA-OBS-01 | GAP-07/09 | Giới hạn oracle mục 4–6 | Nguyên tắc đánh giá, không cộng thêm số case |

Các tình huống là ứng dụng của miền/bất biến đã có, bổ sung ngữ cảnh bảo mật và cách quan sát; không thay thế hoặc sửa kết quả bước 2–3. Số Security ID **không phải số test case**, không chứng minh đạt ≥35 hoặc coverage bảo mật đầy đủ.

## 9. Khoảng trống và điểm dừng review

1. **GAP-01/02/03:** required/optional, partial/full, kiểu và normalization vẫn TBD. Giữ baseline tài liệu, không tự đặt validation để giải thích phản hồi.
2. **GAP-04:** xử lý role/id/query/email/field dư chưa đầy đủ. Oracle chắc chắn là không sửa người khác/không đổi role; reject/ignore và tác động field cơ bản còn TBD.
3. **GAP-05:** chưa có JWT claims/TTL/revocation hoặc policy khóa/xóa user. Không tự đặt boundary thời gian, thuật toán hay mô hình token.
4. **GAP-06:** chưa có atomicity toàn request; không dùng response lỗi để mặc định rollback.
5. **GAP-07/08:** response/schema, khả năng quan sát role qua GET, nhất quán đọc lại và cleanup chưa xác nhận; tình huống thiếu phương tiện quan sát phải ghi chờ làm rõ.
6. **GAP-09:** SEC-01/04/05/07 có phần ngoài chứng minh của API mục tiêu; ghi rõ chưa kiểm chứng, không đánh dấu an toàn hoặc N/A cho toàn SUT.
7. Không thêm yêu cầu rate limit, CSRF, password change, OTP, token length, latency hoặc policy lỗi khi không có căn cứ trong hợp đồng đã đọc.

**Điểm dừng:** đã thực hiện phân tích SEC-01–07, tình huống/đại diện/oracle và truy vết bước 2–3 ở mức Bước 4. Chưa phân tích implementation, chưa sinh test case hoàn chỉnh, chưa thực thi API/UI hoặc bước 5. Chờ sinh viên review; ghi nối tiếp AI Audit theo AGENTS.md.

