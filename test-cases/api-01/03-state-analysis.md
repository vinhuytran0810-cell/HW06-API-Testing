# API 01 — Bước 3: State Transition Analysis

- **API:** `PUT /api/users/me` — FR-04 — Pool A; MSSV 23120274.
- **Skill:** [api-test-generator](../../.agents/skills/api-test-generator/SKILL.md), mục 4, Bước 3.
- **Phạm vi:** phân tích khả năng áp dụng kỹ thuật, dữ liệu trước/sau, bất biến và yêu cầu fixture; chưa sinh test case hoàn chỉnh, phân tích implementation, gửi request hoặc thực hiện bước 4.
- **Trạng thái:** kết quả AI chờ review. Yêu cầu thực hiện bước 3 cho phép tiếp tục phân tích, không tự giải quyết các TBD ở bước 1–2 hoặc xác nhận sinh viên đã phê duyệt tài liệu mới.

## 1. Nguồn và kết luận về State Machine

| Ký hiệu | Nguồn | Phần liên quan |
| --- | --- | --- |
| A | [Đặc tả API](../../specs/api_specification.md), §2–2.2 | Bearer header; GET hồ sơ; PUT cập nhật name/shipping_address/phone |
| R | [Yêu cầu SUT](../../eshop-sut/README.md), FR-02/04, SEC-02/06 | JWT, chỉ cập nhật chính mình, phone, không đổi role |
| R10 | R, FR-10 | State Machine đơn hàng, không phải hồ sơ |
| C | [Bước 1](01-contract-analysis.md), mục 3–7 | Hợp đồng, tiền/hậu điều kiện và GAP-01–GAP-09 |
| D | [Bước 2](02-domain-analysis.md), mục 2–9 | Các miền DP-AUTH/PHONE/ROLE/ID/BODY và TBD |
| G | [AGENTS.md](../../AGENTS.md) | Phạm vi, review, audit và Git |

**Kết luận từ tài liệu:** A §2.2 và R FR-04 **không đặc tả State Machine cho hồ sơ**: không có tập trạng thái nghiệp vụ, sơ đồ chuyển đổi, trạng thái khởi đầu/kết thúc hoặc quy tắc chuyển đổi phụ thuộc lịch sử cập nhật. Các trạng thái pending/confirmed/shipping/delivered/canceled ở FR-10 thuộc đơn hàng; không áp sang API này.

Vì vậy, **không áp dụng coverage trạng thái/cạnh chuyển của một State Machine chính thức cho FR-04**. Phạm vi phù hợp là phân tích hậu điều kiện dữ liệu khi cập nhật được chấp nhận, bất biến khi có thao tác không được phép và những hiệu ứng chưa được đặc tả. Không tạo trạng thái “profile mới”, “đã xác minh”, “hoàn tất” hoặc “bị khóa”.

Bảng và ký hiệu dưới đây là **diễn giải phân tích của AI từ đặc tả**, không phải yêu cầu mới hoặc quan sát implementation. Chưa có thực nghiệm, PASS/FAIL hay bug. Mọi HTTP status, response shape và chi tiết chưa có nguồn được giữ **TBD**.

## 2. Thực thể, actor, sự kiện và ký hiệu snapshot

| Thành phần | Nội dung | Nguồn và giới hạn |
| --- | --- | --- |
| Thực thể | Hồ sơ cá nhân của user được xác thực, gồm các thông tin name/phone/shipping_address | A §2.2; R FR-04 |
| Actor | User đã đăng nhập, chỉ cập nhật hồ sơ mình; không cần quyền admin cho FR-04 | R FR-04; A §2 |
| Sự kiện mục tiêu | PUT cập nhật thông tin cá nhân cơ bản | A §2.2 |
| Điều kiện bảo vệ | JWT hợp lệ; đúng chủ thể; không cho client đổi role | A §2; R FR-04; SEC-02/06 |
| Điều kiện dữ liệu có căn cứ | Phone bắt đầu 0, có 10–11 chữ số | R FR-04; D mục 4–5 |
| Điều kiện còn thiếu | Required/optional, kiểu chặt, partial/full update, null/rỗng, normalization, trường dư | C GAP-01–04/06; D |
| Trạng thái khởi đầu/kết thúc | Không được đặc tả cho hồ sơ | Không mượn final states của đơn hàng FR-10 |
| Nhận biết thành công | Chỉ dùng “cập nhật được chấp nhận” làm điều kiện diễn giải hậu điều kiện | A không nêu response; chưa tự chọn mã HTTP để nhận diện thành công |

Ký hiệu chỉ dùng để ghi **snapshot dữ liệu**, không phải tên trạng thái nghiệp vụ:
- `P_U_trước`, `P_U_sau`: hồ sơ user U trước/sau thao tác.
- `R_U_trước`, `R_U_sau`: role thực tế của U trước/sau; role không phải trường được phép sửa.
- `P_V_trước`, `P_V_sau`: hồ sơ user V khác U, dùng đối chiếu phạm vi tác động.
- `B`: dữ liệu cơ bản gửi lên; không mặc định mọi body đều hợp lệ.

Snapshot là phương pháp quan sát do AI đề xuất. Cần dữ liệu thử nghiệm được cô lập, không có tác nhân khác đồng thời cập nhật hồ sơ đối chiếu để quy kết tác động. Đây là **điều kiện fixture**, không phải yêu cầu concurrency/locking mới của SUT. Chưa có snapshot hoặc fixture thực tế.

## 3. Bảng trạng thái dữ liệu trước/sau

**State ID là ID phân tích theo định dạng Skill, không phải trạng thái mới hoặc test case.** Hợp lệ/không hợp lệ đánh giá phép thay đổi đang xét; không tự suy ra status, message hay rollback. Các hàng không tạo thành một đồ thị State Machine.

| State ID | Trạng thái trước | Actor/sự kiện | Điều kiện | Trạng thái mong đợi | Hợp lệ/không hợp lệ/chưa rõ | Nguồn |
| --- | --- | --- | --- | --- | --- | --- |
| ST-DATA-01 | Có P_U_trước và R_U_trước | U cập nhật thông tin cơ bản của mình | JWT hợp lệ; dữ liệu được chấp nhận theo FR-04 | P_U_sau phản ánh cập nhật được chấp nhận của U; role không đổi. Normalize, trường thiếu và thời điểm đọc lại còn TBD | Hợp lệ về tác vụ; chi tiết còn TBD | A §2.2; R FR-04/SEC-06; C mục 4 |
| ST-DATA-02 | U/V có hồ sơ riêng, dữ liệu đối chiếu cô lập | U gửi dữ liệu nhằm chọn V qua trường ngoài mẫu | Chỉ xác thực là U; id/user_id không được A khai báo | Không cập nhật V bằng quyền U: P_V_sau = P_V_trước trong phạm vi thao tác này. Hồ sơ U có đổi không và cách xử lý trường dư còn TBD | Thay đổi V là không hợp lệ; xử lý request chưa rõ | R FR-04; D DP-ID-01/02; C GAP-04 |
| ST-DATA-03 | Role U đã biết | U gửi role khác trong body | Client đề nghị thay role qua PUT hồ sơ | R_U_sau = R_U_trước. Chưa chốt bỏ qua role hay từ chối toàn request; trường cơ bản có đổi không còn TBD | Thay đổi role không hợp lệ; response/atomicity chưa rõ | R FR-04; SEC-06; D DP-ROLE-02/04 |
| ST-DATA-04 | Hồ sơ/role có giá trị trước thao tác | Tác nhân không có JWT hợp lệ gửi PUT | Thiếu token hoặc token đã xác định không hợp lệ | Không được thực hiện cập nhật hồ sơ qua request không đủ xác thực. Không thay đổi hồ sơ là hậu điều kiện của chặn cập nhật trái phép, không phải rollback chung cho mọi lỗi | Cập nhật không xác thực không hợp lệ | A §2; SEC-02; D DP-AUTH-02–05 |
| ST-DATA-05 | P_U_trước đã biết | U gửi phone vi phạm điều kiện nguyên dạng | JWT hợp lệ; phone sai độ dài/đầu 0/thành phần chữ số | Không coi phone sai quy tắc là phone hợp lệ theo FR-04. Normalize, từ chối/cập nhật phần khác và P_U_sau cụ thể còn TBD | Phone nguyên dạng không hợp lệ; hậu điều kiện toàn request chưa rõ | R FR-04; D DP-PHONE-03–07; C GAP-03/06 |
| ST-DATA-06 | P_U_trước có dữ liệu đối chiếu | U gửi một phần field hoặc body rỗng | Required/optional và full/partial chưa nêu | Chưa xác định giữ cũ/xóa trường thiếu/từ chối. Không tự định nghĩa phép merge hoặc no-op | Chưa rõ | C GAP-01; D DP-BODY-02/05 |
| ST-DATA-07 | Hồ sơ có giá trị trước thao tác | U gửi null/rỗng/sai kiểu cho trường hồ sơ | Các miền TBD của name/address/phone | Không định nghĩa trạng thái “hồ sơ rỗng” hợp lệ/bất hợp lệ; hiệu ứng xóa/chuyển kiểu/giữ cũ/từ chối còn TBD | Chưa rõ | C GAP-02/03; D mục 3–4 |
| ST-DATA-08 | Email U đã biết | U gửi email ngoài mẫu | R cấm đổi email qua UI; API policy chưa rõ | Chưa chốt email sau PUT giữ nguyên/thay đổi hay request bị từ chối chỉ từ yêu cầu UI; quyền chỉ sửa mình vẫn có hiệu lực | Chưa rõ về email qua API | R FR-04; C GAP-04; D DP-EMAIL-01 |
| ST-DATA-09 | Hồ sơ đã có giá trị từng được cập nhật | U gửi lại cùng dữ liệu cơ bản | Dữ liệu vẫn đáp ứng điều kiện đã biết | Chính sách no-op/lặp, response, timestamp/version và side effect chưa nêu. Không đặt self-transition chính thức; nếu được chấp nhận vẫn phải tuân FR-04/SEC-06 | Chưa rõ về hợp đồng lặp | A §2.2; C mục 2/4 |
| ST-DATA-10 | Dự kiến có hai lần cập nhật của U được chấp nhận | U lần lượt gửi hai bộ dữ liệu cơ bản | Chỉ xét field được gửi/được chấp nhận từng lần; không có tác nhân cạnh tranh | Sau mỗi lần thành công, field được chấp nhận phản ánh cập nhật đó. Không suy ra field thiếu ở lần sau giữ cũ hoặc toàn snapshot bằng body cuối | Hợp lệ có điều kiện; merge/normalize còn TBD | A §2.2; R FR-04; C GAP-01/02/08 |
| ST-DATA-11 | U/V có hồ sơ riêng | V dùng JWT hợp lệ của V gửi PUT /me | Danh tính xác thực là V | Đối tượng cập nhật là V; không được đổi U bằng thao tác này. Token V không “sai” chỉ vì đang đối chiếu U | Hợp lệ để sửa V; thay U không hợp lệ | R FR-04; D DP-AUTH-08 |
| ST-DATA-12 | Hồ sơ/role U có snapshot | U gửi đồng thời trường cơ bản và role bị cấm đổi | Field cơ bản có thể hợp lệ; role ngoài mẫu | Role không đổi là bất biến chắc chắn; không chốt mọi field cơ bản rollback hoặc chắc chắn được cập nhật | Đổi role không hợp lệ; hiệu ứng phần còn lại chưa rõ | SEC-06; C GAP-06; D DP-BODY-06/DP-ROLE-02 |

ST-DATA-03 và ST-DATA-12 dùng chung bất biến, khác trọng tâm role và atomicity; không đếm thành hai test case riêng khi chưa thiết kế. Những hàng “chưa rõ” là vấn đề mở, không phải quy tắc chuyển trạng thái được chấp thuận.

## 4. Bất biến và giới hạn oracle

| ID | Bất biến/điều kiện | Căn cứ | Phạm vi kết luận |
| --- | --- | --- | --- |
| INV-01 | Chỉ cập nhật hồ sơ của chính mình | R FR-04 | V khác U không bị cập nhật bởi request xác thực là U; fixture phải cô lập để loại tác động khác |
| INV-02 | Không đổi role bằng API hồ sơ | R FR-04; SEC-06 | R_U_sau = R_U_trước đối với tác động của request, dù có gửi role. Không suy ra toàn request bị từ chối |
| INV-03 | Tác vụ được bảo vệ đòi JWT hợp lệ | A §2; SEC-02 | Không cập nhật trái phép khi thiếu JWT hợp lệ; không tự đặt mã lỗi hoặc vòng đời token |
| INV-04 | Phone được coi hợp lệ phải đầu 0, có 10–11 chữ số | R FR-04; D mục 4–5 | Điều kiện dữ liệu, không chứng minh phone bắt buộc, policy reject/normalize hoặc seed hiện tại đúng |
| POST-01 | Cập nhật được chấp nhận phải phản ánh thông tin cơ bản của chủ thể | A §2.2; R FR-04, diễn giải tác vụ của AI | Chỉ áp field được gửi và chấp nhận; không cam kết giữ nguyên văn, merge thiếu field hoặc nhất quán đọc tức thời |

INV-04 **không tuyên bố DB/seed thực tế đang luôn hợp lệ**. Nếu dữ liệu cũ có phone sai/null, hành vi khi cập nhật field khác chưa được quy định.

Không đủ căn cứ xác lập:
- Email bất biến tại API chỉ vì UI cấm đổi email.
- Mọi response lỗi đều dẫn đến rollback toàn bộ hoặc mọi trường giữ nguyên.
- Token/timestamp/version và mọi thuộc tính ngoài FR-04 luôn bất biến.
- PUT lặp luôn cùng response hoặc không có side effect cụ thể.
- Hồ sơ có trạng thái kết thúc sau cập nhật.
- Cập nhật hồ sơ làm đổi địa chỉ đơn hàng cũ.

SEC-04/05 vẫn có giới hạn chứng minh ngoài response như bước 1–2; không mở rộng thành khảo sát bảo mật/implementation trong bước này.

## 5. API hỗ trợ và yêu cầu fixture

### 5.1. Phân biệt operation mục tiêu và hỗ trợ

| Thao tác | Vai trò dự kiến | Giới hạn |
| --- | --- | --- |
| PUT /api/users/me | Tác vụ mục tiêu, liên quan snapshot trước/sau ở mục 3 | Chỉ hợp đồng FR-04 được phân tích |
| POST /api/login — A §1.2 | Lấy token user thử nghiệm | Điều kiện chuẩn bị, không phải trạng thái hồ sơ. Không đưa logic khóa đăng nhập FR-02 thành chuyển đổi FR-04 |
| GET /api/users/me — A §2.1 | Đề xuất đọc hồ sơ U/V trước/sau bằng token tương ứng | Quan sát, không phải cạnh cập nhật PUT; GET chưa có response schema để bảo đảm đủ trường đối chiếu |
| POST /api/register — A §1.1, nếu cần | Đề xuất có tài khoản thử nghiệm riêng | Không phải mục tiêu; chưa tạo tài khoản, không tự lấp khoảng trống confirmation để setup |
| PUT /api/users/me với snapshot nếu khả thi | Đề xuất khôi phục dữ liệu thử nghiệm | Là lần cập nhật khác, không có reset API riêng; không tự khẳng định có thể quay về nguyên snapshot do null/thiếu/normalization còn TBD |

Không gọi API admin để “đặt trạng thái hồ sơ”: không có hợp đồng cho thao tác đó. Không sửa DB/source làm fixture.

### 5.2. Điều kiện dữ liệu dự kiến, chưa tạo

| Fixture/điều kiện | Mục đích | Điểm cần làm rõ |
| --- | --- | --- |
| Hai user U/V, danh tính và token riêng đã biết | Quan sát quyền sửa chính mình, tránh lẫn chủ thể | Chưa tạo user/token; không lưu credential trong tài liệu |
| Snapshot hồ sơ và role trước/sau | Đối chiếu user đích, người khác và quyền thực tế | GET chưa có schema; chưa biết role có được trả hay nguồn quan sát quyền phù hợp |
| Body cơ bản theo A, phone trong miền FR-04 | Nền cho cập nhật có căn cứ | Chưa chạy baseline; name/address và normalization còn thiếu |
| Không có cập nhật cạnh tranh trên hồ sơ đối chiếu | Quy kết chênh lệch snapshot | Điều kiện môi trường thử nghiệm, không thêm yêu cầu transaction/concurrency cho SUT |
| Token thử nghiệm có tình trạng hợp lệ/không hợp lệ đã xác định | Quan sát chặn cập nhật trái phép | Không tự đặt TTL, claims hoặc credential giả thành dữ liệu đã kiểm chứng |
| Cách phục hồi dữ liệu | Tránh ảnh hưởng các lần kiểm tra sau | Cần review khả thi trước thực thi; không bảo đảm phục hồi null/trường vắng |

Đây là yêu cầu fixture do AI đề xuất, **không phải fixture đã có, script setup/cleanup hoặc test case**. Không tạo file dữ liệu phụ, cài môi trường hoặc thao tác tài khoản.

## 6. Các điểm còn mở và kết thúc bước 3

| Điểm từ C/D | Cách giữ ở bước 3 |
| --- | --- |
| GAP-01: required/optional, partial/full | ST-DATA-06/10 không tự định nghĩa merge/xóa/giữ cũ |
| GAP-02/03: kiểu/null/rỗng/phone/normalization | ST-DATA-05/07 và INV-04 chỉ dùng điều kiện có căn cứ; giá trị lưu cụ thể TBD |
| GAP-04: field dư/email/định danh | ST-DATA-02/08 phân biệt bất biến chủ thể và policy field còn thiếu |
| GAP-05: JWT claims/TTL/tài khoản khóa/xóa | Không tạo State Machine token/tài khoản trong FR-04; chỉ dùng điều kiện JWT hợp lệ |
| GAP-06: role/atomicity | ST-DATA-03/12 chốt role không đổi, không tự suy ra rollback toàn request |
| GAP-07: status/schema | Không ấn định mã HTTP/message/shape để suy ra thành công/thất bại |
| GAP-08: verify/cleanup | API hỗ trợ và fixture vẫn là đề xuất chưa xác nhận khả thi |
| GAP-09: bằng chứng ngoài API | Không suy ra parameterization hoặc XSS an toàn từ snapshot/response |
| Hành vi lặp, timestamp/version, concurrency | Chưa có policy; không thêm optimistic locking, conflict response hoặc tính nguyên tử/idempotency cụ thể |

**Kết quả:** State Transition chính thức không áp dụng vì FR-04 không đặc tả State Machine. Phân tích tập trung snapshot trước/sau có điều kiện, bất biến có nguồn, phép thay đổi không được phép và TBD. Số dòng State ID không phải số test case hoặc bằng chứng bao phủ mọi cạnh.

**Điểm dừng:** chỉ lưu bước 3 và ghi nối tiếp AI Audit. Chưa sinh test case hoàn chỉnh, chưa bước 4 hoặc bước sau, chưa chạy SUT, sửa source, staging/commit/push. Chờ sinh viên review.

