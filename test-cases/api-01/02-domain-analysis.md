# API 01 — Bước 2: Domain Partitioning và Boundary Value Analysis

- **API:** `PUT /api/users/me` — FR-04 — Pool A; MSSV 23120274.
- **Skill:** [api-test-generator](../../.agents/skills/api-test-generator/SKILL.md), mục 4, Bước 2.
- **Phạm vi:** phân tích miền và biên đầu vào; chưa sinh test case, chưa thực hiện các bước 3–7, chưa khảo sát implementation hoặc gửi request.
- **Trạng thái:** bản phân tích AI chờ sinh viên review. Yêu cầu tiếp tục bước 2 là căn cứ thực hiện bước này, không đồng nghĩa các mục TBD ở bước 1 đã được giải quyết.

## 1. Nguồn, phân loại và quy ước

| Ký hiệu | Nguồn | Nội dung dùng |
| --- | --- | --- |
| A | [Đặc tả API](../../specs/api_specification.md), §2–2.2 | Bearer header, endpoint, mẫu JSON ba trường |
| R | [Yêu cầu SUT](../../eshop-sut/README.md), FR-02, FR-04, SEC-02/04/05/06 | JWT, quyền sửa chính mình, phone, role và giới hạn bảo mật |
| C | [Phân tích hợp đồng bước 1](01-contract-analysis.md), mục 2–7 | Tổng hợp hợp đồng và GAP-01–GAP-09 |
| G | [AGENTS.md](../../AGENTS.md) | Giới hạn phạm vi, human review, audit và Git |

Các miền và đại diện là **phân tích của AI dựa trên A/R**, không phải yêu cầu bổ sung hoặc kết quả thực nghiệm.

- **Hợp lệ (HL):** đáp ứng quy tắc đang xét có căn cứ, không bảo đảm toàn request thành công.
- **Không hợp lệ (KHL):** vi phạm quy tắc đang xét có căn cứ. Không tự suy ra status, message, rollback hoặc cách xử lý toàn request.
- **Chưa đủ đặc tả (TBD):** chỉ là miền khảo sát, chưa kết luận phải chấp nhận hay từ chối. Không tính là case sẵn sàng thực thi.
- **HTTP status:** **TBD cho tất cả các dòng**; không ấn định mã cụ thể.
- `THIẾU` nghĩa không gửi field/header; khác JSON `null`, chuỗi `""` và chuỗi `"null"`.
- `<JWT_HỢP_LỆ_CỦA_U1>` là placeholder có điều kiện, không phải token có thể dùng trực tiếp. Chưa tạo user/token hoặc fixture.
- Độ dài phone minh họa bằng chuỗi chữ số ASCII để đếm rõ từng chữ số và giữ số 0 đầu. Đây là **lựa chọn dữ liệu đại diện**, không giới hạn hợp đồng chỉ chấp nhận ASCII; miền chữ số Unicode giữ TBD.
- Miền theo các trục riêng có thể giao nhau. Phân tích từng trục, không lấy tích Descartes hoặc đếm mỗi assertion/đại diện thành một test case.

### Phạm vi mọi đầu vào

| Vị trí | Đầu vào được xem xét | Tình trạng hợp đồng |
| --- | --- | --- |
| Path | Không có path parameter; route cố định `/api/users/me` | Không tự thêm id vào route |
| Query | Không có query parameter được khai báo | Tham số dư chỉ có thể khảo sát TBD |
| Header | Authorization; Content-Type và header dư xét ở mức hợp đồng có/không mô tả | Authorization bắt buộc; media type và header dư chưa có policy chi tiết |
| Body | name, shipping_address, phone | Ba trường trong mẫu A; required/optional và kiểu chặt chưa xác định |
| Ngoài mẫu | role, email, id/user_id và field dư | Không phải tham số được hỗ trợ đã xác nhận; role và quyền chủ thể có bất biến FR-04/SEC-06 |
| Bao gói body | Có/thiếu body, JSON object, null, scalar/array và JSON hỏng | A nêu JSON body; chưa có request schema hoặc chính sách parse/error đầy đủ |

Method và Base URL xác định operation, không phải tham số nghiệp vụ để tự tạo phân hoạch. Đổi method/route là operation khác, không được bổ sung vào bước này.

## 2. Miền Authorization và header

| Partition/Boundary ID | Tham số | Miền/biên | Đại diện | Kỳ vọng nghiệp vụ | Nguồn |
| --- | --- | --- | --- | --- | --- |
| DP-AUTH-01 | Authorization | HL: đúng Bearer và JWT hợp lệ của user hiện hữu | `Bearer <JWT_HỢP_LỆ_CỦA_U1>` | Đủ điều kiện xác thực để cập nhật hồ sơ U1, không yêu cầu admin; kết quả còn phụ thuộc body | A §2; R FR-02/04, SEC-02 |
| DP-AUTH-02 | Authorization | KHL: thiếu header/token xác thực | `THIẾU` | Không được thực hiện cập nhật được bảo vệ khi chưa có JWT hợp lệ | A §2; SEC-02 |
| DP-AUTH-03 | Authorization | KHL: header không cung cấp token | Giá trị header `""` hoặc `Bearer ` | Không đáp ứng JWT hợp lệ; cơ chế báo lỗi TBD | A §2; SEC-02 |
| DP-AUTH-04 | Authorization | KHL: giá trị chắc chắn không phải JWT hợp lệ | `Bearer not-a-jwt` | Không được cho phép tác vụ cần JWT hợp lệ; không suy ra message/status | A §2; SEC-02 |
| DP-AUTH-05 | Authorization | KHL về xác thực nếu biết token đã bị thay đổi và không còn hợp lệ | `Bearer <JWT_SAI_CHỮ_KÝ_ĐÃ_XÁC_ĐỊNH>` | Không được chấp nhận danh tính không xác thực được; chưa thiết kế/cấp token này | SEC-02; C GAP-05 |
| DP-AUTH-06 | Authorization | TBD: cách parser xử lý scheme, khoảng trắng, header lặp | `Basic <giá-trị>`; Bearer có khoảng trắng phụ; nhiều giá trị | A chỉ chỉ định Bearer; các hình thức này không được xác nhận là HL. Không có policy fallback/parser để chốt response; nếu không có JWT hợp lệ thì điều kiện SEC-02 vẫn không đạt | A §2; C GAP-05 |
| DP-AUTH-07 | Authorization | TBD: tuổi thọ và vòng đời token/tài khoản | Token có thời điểm hết hạn chưa được đặc tả; token gắn user đã khóa/xóa | Chưa đặt được miền theo TTL hoặc hành vi thu hồi; không tự gán thời hạn. Token đã được xác định không hợp lệ vẫn phải tuân SEC-02 | R FR-02; C GAP-05 |
| DP-AUTH-08 | Authorization và chủ thể | HL về xác thực: JWT hợp lệ của U2, khác user đang được dùng làm dữ liệu tham chiếu | `Bearer <JWT_HỢP_LỆ_CỦA_U2>` | `me` phải cập nhật hồ sơ U2; không được coi token U2 là “token sai” chỉ vì trước đó đang quan sát U1 | R FR-04; A §2 |
| DP-HDR-01 | Content-Type | TBD: khai báo JSON | `application/json` | Phù hợp body JSON được A mô tả; chưa có quy tắc header bắt buộc hoặc response theo media type | A §2.2; C GAP-07 |
| DP-HDR-02 | Content-Type | TBD: thiếu/khác header media type | `THIẾU`; `text/plain` | Chưa kết luận parse JSON, bỏ qua hay từ chối; không tự đặt status | A §2.2; C mục 2 |
| DP-HDR-03 | Header khác | TBD: header ngoài khai báo | Header minh họa `X-Extra: demo` | Chưa có policy header dư; không tự thêm API key hoặc biến header minh họa thành yêu cầu bắt buộc | A §2; C mục 2 |

DP-AUTH-02/03/04/05 cùng không đáp ứng điều kiện JWT nhưng khác hình thức đầu vào có ý nghĩa. Chưa có căn cứ cho độ dài tối thiểu/tối đa token hoặc boundary thời gian cụ thể. Bước này không thiết kế chi tiết các tình huống Security Analysis.

## 3. Miền name và shipping_address

A có ví dụ chuỗi thường, nhưng không định nghĩa đầy đủ miền tên/địa chỉ được phép. Dòng HL bên dưới chỉ xác nhận **đại diện xuất hiện trong mẫu hợp đồng**, không tuyên bố mọi string đều hợp lệ.

| Partition/Boundary ID | Tham số | Miền/biên | Đại diện | Kỳ vọng nghiệp vụ | Nguồn |
| --- | --- | --- | --- | --- | --- |
| DP-NAME-01 | name | HL theo mẫu: tên minh họa trong A | `"Nguyen Van A"` | Là thông tin được phép cập nhật của chính user; chưa đủ để khẳng định request thành công độc lập | A §2.2; R FR-04 |
| DP-NAME-02 | name | TBD: thiếu field | `THIẾU` | Chưa rõ required/optional, giữ cũ hay xóa; không áp quy tắc required của đăng ký FR-01 | C GAP-01; A §2.2; R FR-04 |
| DP-NAME-03 | name | TBD: null/rỗng/chỉ khoảng trắng | `null`; `""`; `"   "` | Chưa có chính sách chấp nhận, trim hoặc từ chối; ba đại diện khác nhau, không coi tương đương đã được chứng minh | C GAP-02 |
| DP-NAME-04 | name | TBD: kiểu khác chuỗi mẫu | `123`; `true`; `[]`; `{}` | Kiểu chặt/ép kiểu chưa đặc tả; chưa kết luận KHL chỉ từ mẫu string | A §2.2; C GAP-02 |
| DP-NAME-05 | name | TBD: Unicode, dấu câu và khoảng trắng đầu/cuối | `"Nguyễn Văn An"`; `"An-Bình"`; `" An "` | Không có regex tên hoặc normalization; không tự cấm dấu tiếng Việt, dấu nối hay khoảng trắng | C GAP-02; R FR-04 |
| DP-NAME-06 | name | TBD: độ dài tùy ý ngoài mẫu | Chưa chọn độ dài giới hạn | Không có min/max length; không tự đặt biên 1/255/256 hoặc giới hạn khác | A §2.2; R FR-04 |
| DP-ADDR-01 | shipping_address | HL theo mẫu: địa chỉ minh họa trong A | `"123 Le Loi, Q1, TP.HCM"` | Địa chỉ giao hàng mặc định là thông tin được phép cập nhật của user | A §2.2; R FR-04 |
| DP-ADDR-02 | shipping_address | TBD: thiếu field | `THIẾU` | Chưa rõ required/optional và semantics trường bỏ sót | C GAP-01 |
| DP-ADDR-03 | shipping_address | TBD: null/rỗng/chỉ khoảng trắng | `null`; `""`; `"   "` | Chưa có quy tắc địa chỉ trống hay trim | C GAP-02 |
| DP-ADDR-04 | shipping_address | TBD: kiểu khác chuỗi mẫu | `123`; `false`; `[]`; `{}` | Chưa rõ kiểu chặt/ép kiểu; không đặt expected rejection | A §2.2; C GAP-02 |
| DP-ADDR-05 | shipping_address | TBD: Unicode, nhiều dòng hoặc chuẩn hóa | `"12 Lê Lợi, TP.HCM"`; chuỗi chứa xuống dòng; `" 12 Le Loi "` | Không có quy tắc cấu trúc địa chỉ, normalization hoặc liên hệ với tỉnh/thành | R FR-04; C GAP-02 |
| DP-ADDR-06 | shipping_address | TBD: độ dài ngoài mẫu | Chưa chọn độ dài giới hạn | Không có min/max length; không mượn giới hạn trường sản phẩm FR-15 | A §2.2; R FR-04 |
| DP-TEXT-01 | name/shipping_address, xét riêng từng field | TBD về API: nội dung có dấu nháy hoặc markup | `"O'An"`; `"<b>An</b>"` | Không có căn cứ từ chối chỉ vì dấu nháy/HTML. SEC-05 yêu cầu truy vấn an toàn; SEC-04 yêu cầu escape khi render UI, không định nghĩa miền cấm của JSON | R SEC-04/05; C GAP-09 |

Chưa xác định được miền **KHL chắc chắn** riêng cho name/address từ các ràng buộc hiện có. Điều này là giới hạn tài liệu, không phải kết luận API phải chấp nhận mọi giá trị.

## 4. Miền phone

Chia theo ba trục: độ dài, ký tự đầu và thành phần chữ số. Ở các dòng có oracle rõ, giữ hai trục còn lại thỏa FR-04. Các đại diện là **chuỗi JSON**, không chuyển phone thành số.

| Partition/Boundary ID | Tham số | Miền/biên | Đại diện | Kỳ vọng nghiệp vụ | Nguồn |
| --- | --- | --- | --- | --- | --- |
| DP-PHONE-01 | phone | HL: chuỗi 10 chữ số bắt đầu 0 | `"0912345678"` | Thỏa điều kiện phone hợp lệ theo FR-04 | R FR-04; A §2.2 |
| DP-PHONE-02 | phone | HL: chuỗi 11 chữ số bắt đầu 0 | `"09123456789"` | Thỏa điều kiện phone hợp lệ; không tự cấm 11 chữ số vì thực tiễn nhà mạng | R FR-04 |
| DP-PHONE-03 | phone | KHL: có 1–9 chữ số, bắt đầu 0 | `"091234567"` (9 chữ số) | Không thỏa độ dài tối thiểu; cơ chế từ chối/chuẩn hóa và hậu điều kiện toàn request TBD | R FR-04; C GAP-03/06 |
| DP-PHONE-04 | phone | KHL: có từ 12 chữ số, bắt đầu 0 | `"091234567890"` (12 chữ số) | Không thỏa độ dài tối đa; không coi đây là phone hợp lệ nguyên dạng | R FR-04 |
| DP-PHONE-05 | phone | KHL: 10–11 chữ số nhưng không bắt đầu 0 | `"1912345678"` | Vi phạm điều kiện bắt đầu bằng 0; không tự đặt quy tắc theo mã nhà mạng | R FR-04 |
| DP-PHONE-06 | phone | KHL về định dạng nguyên dạng: độ dài 10, đầu 0, có chữ cái | `"09123A5678"` | Không phải chuỗi toàn chữ số theo FR-04; cách xử lý request và mọi quy tắc chuyển đổi vẫn TBD | R FR-04; C GAP-03 |
| DP-PHONE-07 | phone | TBD về xử lý API: dấu phân cách/khoảng trắng/mã quốc tế | `"091 2345678"`; `"091-2345678"`; `" 0912345678 "`; `"+84912345678"` | Các chuỗi nguyên dạng không khớp mô tả phone chỉ gồm 10–11 chữ số, bắt đầu 0; tài liệu chưa quy định có normalize trước validation hay không. Không tự kết luận API phải từ chối mọi đại diện | R FR-04; C GAP-03 |
| DP-PHONE-08 | phone | TBD: thiếu field | `THIẾU` | Required/optional và PUT partial/full chưa xác định | C GAP-01 |
| DP-PHONE-09 | phone | TBD: null/rỗng/chỉ khoảng trắng | `null`; `""`; `"   "` | Không đại diện cho phone hợp lệ theo FR-04, nhưng chưa rõ được phép không cung cấp/xóa phone hay normalize; không tự đặt required hoặc expected rejection | C GAP-01/02/03 |
| DP-PHONE-10 | phone | TBD: kiểu khác string trong mẫu | `912345678`; `true`; `[]`; `{}` | Không suy ra API phải nhận hoặc từ chối các kiểu này; không dùng JSON number có số 0 đầu làm dữ liệu phone hợp lệ | A §2.2; C GAP-02/03 |
| DP-PHONE-11 | phone | TBD: chữ số Unicode | `"０９１２３４５６７８"` | Chưa có quy định bộ chữ số/normalization; không tự giới hạn ASCII hoặc chốt ký tự đầu Unicode tương đương 0 | R FR-04; C GAP-03 |
| DP-PHONE-12 | phone | HL theo riêng các điều kiện đã nêu, không đại diện tính tồn tại thuê bao | `"0000000000"` | Có 10 chữ số và đầu 0; không có yêu cầu số đang hoạt động/đầu số nhà mạng/duy nhất. Không được tự gán KHL vì suy đoán nghiệp vụ thực tế | R FR-04 |

**Phân biệt oracle:** DP-PHONE-03/04/05/06 xác định vi phạm điều kiện của phone nguyên dạng; chưa quy định một status, error body hoặc rollback toàn bộ. Với các dòng TBD về chuẩn hóa/thiếu/kiểu, không biến điều kiện phone hợp lệ thành ràng buộc required hoặc ép kiểu tự đặt.

## 5. Boundary Value Analysis

### 5.1. Biên có căn cứ: số chữ số của phone

R FR-04 nêu từ 10 đến 11 chữ số, gồm cả hai đầu. Với đại diện ASCII, một chữ số tương ứng một ký tự; **bước nhảy là 1 chữ số**. Giữ đầu 0 và toàn bộ ký tự là chữ số để cô lập độ dài.

| Partition/Boundary ID | Tham số | Miền/biên | Đại diện | Kỳ vọng nghiệp vụ | Nguồn |
| --- | --- | --- | --- | --- | --- |
| BVA-PHONE-01 | phone.length | KHL: 9 = ngay dưới biên dưới 10 | `"091234567"` | Không thỏa độ dài FR-04; xử lý request/status TBD | R FR-04; DP-PHONE-03 |
| BVA-PHONE-02 | phone.length | HL: 10 = tại biên dưới; đồng thời ngay dưới biên trên 11 | `"0912345678"` | Thỏa độ dài; đầu 0 và chữ số cũng thỏa | R FR-04; DP-PHONE-01 |
| BVA-PHONE-03 | phone.length | HL: 11 = ngay trên biên dưới 10; đồng thời tại biên trên | `"09123456789"` | Thỏa độ dài; đầu 0 và chữ số cũng thỏa | R FR-04; DP-PHONE-02 |
| BVA-PHONE-04 | phone.length | KHL: 12 = ngay trên biên trên 11 | `"091234567890"` | Không thỏa độ dài FR-04; xử lý request/status TBD | R FR-04; DP-PHONE-04 |

Miền hợp lệ chỉ có hai độ dài nguyên 10 và 11, không tồn tại điểm nguyên “giữa” khác. Hợp hai bộ `{9,10,11}` và `{10,11,12}` cho bốn đại diện duy nhất; không nhân đôi 10/11 để tăng số lượng.

### 5.2. Nơi không đặt biên

| Tham số/quy tắc | Kết luận BVA | Lý do |
| --- | --- | --- |
| name, shipping_address | Chưa có biên định lượng | Không có min/max length trong FR-04/A; không tự chọn ngưỡng |
| phone bắt đầu 0 | Phân hoạch định dạng, không BVA số học | Không tính phone ±1 hoặc coi giá trị điện thoại là khoảng số |
| phone bộ chữ số/normalization | TBD, không đặt biên | Không có regex hoặc giới hạn chuẩn hóa |
| Authorization | Không đặt biên độ dài hay TTL | Không có giới hạn token, thuật toán hoặc thời hạn cụ thể |
| role/email/id/user_id/field dư | Không có biên định lượng | Chính sách trường dư thiếu; role có bất biến quyền, không phải miền số |
| Content-Type/header dư/body size | Không đặt biên kích thước | Chưa có giới hạn payload/header trong tài liệu |
| Path/query | Không BVA cho tham số không được khai báo | Không thêm id/pagination hoặc tham số mới |

## 6. Trường ngoài mẫu và quyền chủ thể

Các tên dưới đây được xét vì đã nhận diện ở bước 1. Chúng **không trở thành tham số API được hỗ trợ**. Không thiết kế ma trận Security Analysis chi tiết trong bước 2.

| Partition/Boundary ID | Tham số | Miền/biên | Đại diện | Kỳ vọng nghiệp vụ | Nguồn |
| --- | --- | --- | --- | --- | --- |
| DP-ROLE-01 | role | HL về hình dạng mẫu: không gửi trường ngoài mẫu | `THIẾU` | Không có yêu cầu body phải gửi role; user không tự đổi quyền qua FR-04 | A §2.2; R FR-04, SEC-06 |
| DP-ROLE-02 | role | KHL về thay đổi quyền: giá trị đề nghị khác role hiện tại | U1 hiện là user; body có `"role":"admin"` | **Role không được thay đổi**. Không chốt toàn request phải thất bại hoặc role bị bỏ qua; status TBD | R FR-04; SEC-06; C GAP-06 |
| DP-ROLE-03 | role | TBD về xử lý field: gửi cùng role hiện tại | U1 hiện là user; `"role":"user"` | Role vẫn không đổi; việc chấp nhận/bỏ qua/từ chối field chưa đặc tả | SEC-06; C GAP-04/06 |
| DP-ROLE-04 | role | TBD về xử lý field/kiểu | `null`; `""`; `123`; `[]`; `{}` | Không được dùng giá trị client để thay role; cơ chế lỗi và các field khác còn TBD | SEC-06; C GAP-04/06 |
| DP-EMAIL-01 | email | TBD: ngoài body mẫu, đủ/thiếu/sai định dạng hoặc kiểu | `THIẾU`; `"new@example.invalid"`; `"abc"`; `null`; `123` | Không áp validation email của đăng ký sang PUT. R cấm đổi email qua UI, chưa định nghĩa API xử lý trường này | R FR-04; A §2.2; C GAP-04 |
| DP-ID-01 | id/user_id | TBD về xử lý field; bất biến quyền đã rõ | Tham chiếu ID của U1 hoặc U2 trong body, xét từng tên field | Không được cập nhật hồ sơ U2 khi chỉ xác thực là U1. Không suy ra field được hỗ trợ, kiểu ID hoặc claim ánh xạ user | R FR-04; C GAP-04/05 |
| DP-ID-02 | id/user_id | TBD: định danh ngoài mẫu thiếu/không tồn tại/sai kiểu | `THIẾU`; `<ID_CHƯA_TỒN_TẠI>`; `null`; `"abc"`; `[]` | Không đặt quy tắc parse/existence hoặc status cho field chưa khai báo; quyền “chỉ mình” vẫn có hiệu lực | A §2.2; R FR-04; C GAP-04 |
| DP-EXTRA-01 | Field dư bất kỳ | TBD: chưa có additionalProperties policy | `"extra":"demo"` | Chưa kết luận bỏ qua hay từ chối; không tự đặt whitelist tuyệt đối | A §2.2; C GAP-04 |

Giá trị placeholder ID chỉ là điều kiện dữ liệu cần có, không xác nhận bản ghi tồn tại/không tồn tại. Không tự đặt biên ID 0/1 hoặc giới hạn số nguyên vì endpoint không khai báo ID đầu vào.

## 7. Bao gói body và query dư

| Partition/Boundary ID | Tham số | Miền/biên | Đại diện | Kỳ vọng nghiệp vụ | Nguồn |
| --- | --- | --- | --- | --- | --- |
| DP-BODY-01 | Body | HL theo mẫu JSON object chứa ba thông tin cơ bản | Object mẫu A §2.2 với name/address mẫu và phone 10 chữ số | Phù hợp hình dạng minh họa; không tự chứng minh request schema đầy đủ | A §2.2; C mục 3 |
| DP-BODY-02 | Body | TBD: thiếu body hoặc object rỗng | Không gửi body; `{}` | Chưa có quy tắc ít nhất một trường/đủ ba trường, semantics no-op hoặc lỗi | C GAP-01 |
| DP-BODY-03 | Body | TBD: top-level khác object mẫu | `null`; `[]`; `"abc"`; `123`; `true` | JSON cú pháp có thể hợp lệ, nhưng chưa có request schema hoặc policy chấp nhận/từ chối các dạng này | A §2.2; C mục 2 |
| DP-BODY-04 | Body | KHL về cú pháp JSON | Văn bản `{"name":}` | Không phải JSON hợp lệ theo định dạng body đã nêu; parser/status/error/atomicity chưa được đặc tả | A §2.2; C mục 2/4 |
| DP-BODY-05 | Body | TBD: chỉ gửi một phần các field khai báo | Object chỉ có name; object thiếu phone, các dạng xem riêng | Không suy ra partial update được hỗ trợ hoặc các field vắng bị xóa | C GAP-01 |
| DP-BODY-06 | Body | TBD: lặp khóa hoặc phối hợp field HL/KHL | Object có khóa name lặp; object có phone sai điều kiện và name mẫu | Không tự định nghĩa ưu tiên khóa, lỗi ưu tiên hoặc rollback toàn request | C GAP-01/06; A §2.2 |
| DP-QUERY-01 | Query | HL theo operation được mô tả: không có query | Không gửi query | Phù hợp URL operation; không có query bắt buộc được khai báo | A §2.2 |
| DP-QUERY-02 | Query | TBD: có query ngoài khai báo | `?extra=demo`; `?user_id=<ID_U2>` | Không có policy query dư; nếu danh tính U1 thì không được cập nhật U2, nhưng không tự chốt parse/response | A §2.2; R FR-04; C GAP-04 |

Các dạng thiếu/null/rỗng/sai kiểu đã được xét cho từng field hoặc nhóm field ở mục 2–7. Không coi JSON hỏng và JSON hợp lệ nhưng khác hình dạng mẫu là cùng một miền.

## 8. Cách giữ các yếu tố khác ổn định

Đây là nguyên tắc cho việc dùng phân tích ở các bước sau, chưa phải test case hoặc thao tác chuẩn bị dữ liệu:

1. Khi phân tích phone, dùng name/address từ mẫu A, một JSON object đầy đủ và placeholder JWT hợp lệ; chỉ đổi một trục phone mỗi lần. Phone KHL phải giữ các điều kiện phone khác thỏa khi có thể.
2. Mẫu A chỉ là đại diện nền có căn cứ tài liệu; chưa có thực nghiệm chứng minh baseline chạy thành công. Nếu baseline hoặc khả năng đọc lại còn thiếu, phải giữ điểm đó mở.
3. Khi xét thiếu/null/rỗng/sai kiểu của một field, chỉ thay field đó; các dòng có nhiều đại diện là các dạng khảo sát riêng, không mặc nhiên cùng oracle.
4. Khi xét header xác thực, giữ body mẫu; không trộn phone sai với token sai để suy đoán thứ tự validation.
5. Với role hoặc id/user_id, cần biết danh tính/role hiện tại và dữ liệu tham chiếu của các user thử nghiệm; chưa tạo dữ liệu. Token hợp lệ của U2 tương ứng quyền sửa U2, không tương ứng quyền sửa U1.
6. Không có quy tắc liên trường name/phone/address được nêu. Chưa lập tích kết hợp, không tự đặt “ít nhất một field” hoặc quan hệ địa chỉ/số điện thoại.
7. Khi một trường không hợp lệ, không tự khẳng định tất cả trường khác giữ nguyên vì tính nguyên tử update chưa được đặc tả.
8. Các nội dung bảo mật và schema chỉ xuất hiện ở đây để định nghĩa miền đầu vào/bất biến có căn cứ, không thay thế đầu ra bước 4/5.

## 9. Khoảng trống và điểm dừng review

| Khoảng trống từ bước 1 | Tình trạng ở bước 2 |
| --- | --- |
| GAP-01 — required/optional và partial/full | Vẫn TBD; thiếu field, body thiếu/rỗng và cập nhật từng phần không có expected rejection tự đặt |
| GAP-02 — kiểu/null/rỗng/trim/độ dài name/address | Vẫn TBD; không gán KHL hoặc biên tùy ý |
| GAP-03 — phone normalization/bộ chữ số/xử lý lỗi | Có miền và biên rõ cho các chuỗi đại diện nguyên dạng; Unicode, kiểu, chuẩn hóa còn TBD |
| GAP-04 — field dư/email/định danh | Vẫn TBD về xử lý; bất biến không sửa người khác và không đổi role vẫn có căn cứ |
| GAP-05 — JWT claims/TTL/vòng đời tài khoản | Chưa có biên token hoặc thời gian cụ thể; chỉ chốt điều kiện JWT hợp lệ |
| GAP-06 — role và atomicity | Role không được đổi; bỏ qua/từ chối và tác động đến các field khác vẫn TBD |
| GAP-07 — status/schema | Mọi HTTP status và response shape vẫn TBD; không lấy thông lệ HTTP làm đặc tả |
| GAP-08 — GET verify/cleanup | Chưa kiểm tra hoặc khẳng định khả thi; không chạy API |
| GAP-09 — SEC-04/05 ngoài API | Không suy ra XSS từ JSON hay parameterization từ phản hồi; chưa khảo sát implementation |

**Kết quả:** đã phân tích mọi vị trí/tham số đầu vào nhận diện ở bước 1, tách HL/KHL/TBD và BVA độ dài phone có căn cứ. Số dòng partition/boundary **không phải** số test case, không chứng minh đạt mục tiêu ≥35 case có ý nghĩa.

**Dừng tại bước 2:** chờ sinh viên review; chưa tự đánh dấu phê duyệt, chưa thực hiện State Transition Analysis hoặc các bước tiếp theo, chưa sinh/chạy test case, chưa sửa source hoặc thao tác staging/commit/push.

