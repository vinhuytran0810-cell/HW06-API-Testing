---
name: api-test-generator
description: Sinh test case API theo đặc tả và yêu cầu nghiệp vụ, phân vùng miền dữ liệu, giá trị biên, chuyển trạng thái, bảo mật và schema. Dùng khi người dùng yêu cầu phân tích hoặc thiết kế API test case; thực hiện từng bước có human review, không tự thực thi kiểm thử.
---

# API Test Generator

## 1. Mục đích và phạm vi

Chuyển đặc tả API thành bộ test case có thể thực thi và truy vết về yêu cầu. Áp dụng cho REST API có tài liệu đặc tả, không phụ thuộc dự án, công cụ thực thi hay số lượng test case cố định. Nếu người dùng đặt mục tiêu số lượng, chỉ sử dụng các tình huống có ý nghĩa để đạt mục tiêu. Skill tập trung vào thiết kế và sinh test case, không thay thế việc đánh giá độc lập của con người, sinh script thực thi hoặc chạy test.

## 2. Đầu vào và đầu ra

Đầu vào:
- API mục tiêu (HTTP method và endpoint, hoặc operation tương ứng trong đặc tả).
- Đặc tả API và các yêu cầu chức năng, nghiệp vụ, bảo mật liên quan do người dùng cung cấp hoặc chỉ định. Chấp nhận OpenAPI/Swagger, Markdown hoặc các định dạng đặc tả khác có thể đọc được.
- Bước cần thực hiện, kết quả phân tích trước đó đã được duyệt (nếu có), và các yêu cầu riêng như số lượng test case hoặc định dạng đầu ra (nếu có).

Nếu chưa xác định được API mục tiêu hoặc chưa có tài liệu cần thiết, nêu thông tin còn thiếu. Không mặc định tên file, đường dẫn, mã yêu cầu, header hoặc cấu trúc repository của bất kỳ dự án nào.

Đầu ra từng bước: bảng phân tích hoặc danh sách test case tương ứng, nguồn yêu cầu và điểm chưa rõ. Đầu ra cuối: bộ AI-generated test cases chưa được người dùng đánh giá độc lập, có mã định danh, dữ liệu, oracle và thông tin coverage. Chỉ lưu file theo yêu cầu của người dùng; không tự tạo hệ thống báo cáo phụ.

## 3. Nguyên tắc xác định oracle

- Dùng đặc tả và yêu cầu chức năng/bảo mật làm căn cứ; ghi đường dẫn, mục hoặc mã yêu cầu cho mỗi ràng buộc. Ví dụ payload không tự chứng minh trường bắt buộc, kiểu dữ liệu chặt hoặc giới hạn.
- Phân biệt yêu cầu API, yêu cầu UI, giả định và hành vi implementation. Không lấy hành vi hiện tại của code làm expected result mặc định. Chỉ khảo sát implementation khi được yêu cầu riêng; không dùng lỗi đã biết để tuyên bố kết quả thực thi.
- Nếu tài liệu mâu thuẫn, trình bày cả hai và xin quyết định; nếu thiếu thông tin, ghi `TBD` cùng lý do. Không tự gán HTTP 400/401/403/404, regex, độ dài, schema hoặc quy tắc nghiệp vụ chưa có căn cứ.
- Nếu biết hậu điều kiện nghiệp vụ nhưng chưa biết mã HTTP chính xác, vẫn mô tả hậu điều kiện có căn cứ và để riêng mã HTTP là TBD. Case chưa có oracle đủ để phân định đúng sai phải được đánh dấu chờ làm rõ, không tính là case sẵn sàng thực thi.
- Mỗi bước kết thúc bằng kết quả, khoảng trống và đề nghị người dùng review. Chỉ thực hiện bước tiếp theo khi người dùng yêu cầu; nếu cần sửa, quay lại đúng bước liên quan. Tuân thủ các chỉ dẫn hiện hành của dự án nếu có.

## 4. Quy trình sinh test case

### Bước 1 — Phân tích hợp đồng API

1. Xác định API mục tiêu cần kiểm thử. Nếu cần, xác định các API hỗ trợ để chuẩn bị dữ liệu, xác minh kết quả hoặc khôi phục dữ liệu.
2. Liệt kê path/query/header/body, kiểu và định dạng được nêu, required/optional, ràng buộc từng tham số và liên tham số, ví dụ hợp lệ, quyền truy cập, trạng thái trước/sau, response thành công/lỗi.
3. Ánh xạ yêu cầu chức năng/bảo mật liên quan; ghi rõ yêu cầu UI hoặc yêu cầu cần bằng chứng ngoài API.
4. Ghi nguồn cho từng quy tắc và đánh dấu khoảng trống/mâu thuẫn. Không coi mẫu JSON là schema hoàn chỉnh.

Đầu ra: bảng `Tham số/quy tắc | Vị trí | Ràng buộc | Nguồn | Khoảng trống`; danh sách API hỗ trợ và điều kiện dữ liệu (nếu cần). Dừng review.

### Bước 2 — Domain Partitioning và Boundary Value Analysis

1. Với mọi tham số đã xác định, chia miền tương đương hợp lệ/không hợp lệ theo từng quy tắc có căn cứ; bao gồm tham số xác thực khi phù hợp.
2. Chọn đại diện từng miền. Xem xét thiếu trường, null, rỗng, sai kiểu, định dạng và tồn tại/không tồn tại khi phù hợp; nếu chưa có quy tắc thì chỉ ghi tình huống khảo sát, không mặc định phải bị từ chối.
3. Với biên có căn cứ, chọn giá trị ngay dưới, tại và ngay trên biên khi khả thi; xác định bước nhảy phù hợp kiểu dữ liệu, không tự đặt độ chính xác số thực. Với chuỗi, dùng độ dài theo đặc tả; nếu đơn vị đếm chưa rõ, ghi giả định.
4. Giữ các tham số khác hợp lệ khi kiểm tra một miền không hợp lệ. Xét quan hệ liên tham số khi được đặc tả, không tạo tích Descartes vô nghĩa.

Đầu ra: bảng `Partition/Boundary ID | Tham số | Miền/biên | Đại diện | Kỳ vọng nghiệp vụ | Nguồn`; danh sách khoảng trống. Dừng review.

### Bước 3 — State Transition Analysis

1. Xác định thực thể, các trạng thái, sự kiện, actor, điều kiện bảo vệ và trạng thái kết thúc từ đặc tả.
2. Lập bảng chuyển trạng thái hợp lệ và không hợp lệ; phân biệt chuyển đổi của API mục tiêu với chuyển đổi chỉ dùng để chuẩn bị dữ liệu. Đánh dấu cạnh hoặc hành vi lặp chưa được quy định.
3. Chọn tình huống bao phủ các cạnh có liên quan, actor và điều kiện khác nhau có căn cứ; kiểm tra trạng thái trước/sau và bất biến khi bị từ chối nếu đặc tả hỗ trợ.
4. Nếu không có state machine, xem xét hậu điều kiện tạo/sửa/xóa hoặc tính bất biến; ghi không áp dụng cho state transition chính thức, không gán nhãn state machine cho mọi CRUD.

Đầu ra: bảng `State ID | Trạng thái trước | Actor/sự kiện | Điều kiện | Trạng thái mong đợi | Hợp lệ/không hợp lệ/chưa rõ | Nguồn`; yêu cầu fixture. Dừng review.

### Bước 4 — Security Analysis

1. Ánh xạ từng yêu cầu bảo mật có liên quan; ghi áp dụng/không áp dụng/cần bằng chứng ngoài API và lý do.
2. Xác định tình huống authentication (thiếu, không hợp lệ, hết hạn nếu có căn cứ), authorization (role, quyền sở hữu), mass assignment/role escalation, injection và dữ liệu nhạy cảm khi phù hợp.
3. Thiết kế bằng tài khoản và dữ liệu thử nghiệm trên SUT được phép kiểm thử; kiểm tra hậu điều kiện và quyền thực tế, không chỉ message hoặc status. Không sử dụng credential thật, không tấn công hệ thống ngoài phạm vi.
4. Không suy ra SQL parameterization chỉ từ một vài request; không suy ra XSS chỉ từ chuỗi HTML trong JSON; không suy ra mật khẩu được lưu an toàn chỉ từ response. Ghi phương pháp kiểm chứng bổ sung nếu cần.

Đầu ra: bảng `Security ID | Nguồn yêu cầu | Tình huống | Actor/dữ liệu | Kỳ vọng | Cách xác minh | Giới hạn`. Dừng review.

### Bước 5 — Schema Analysis

1. Tách hợp đồng response thành HTTP status, Content-Type, cấu trúc, trường bắt buộc, kiểu, enum, nullability và quy tắc additionalProperties nếu được nêu; xem xét cả success và error.
2. Đối chiếu nguồn cho từng assertion. Với response chỉ có ví dụ, ghi rõ phần nào có thể kiểm chứng và phần nào chưa đủ căn cứ để khẳng định exact match.
3. Không tự tạo schema đầy đủ từ response thực tế; schema suy ra chỉ là giả thuyết cần người dùng xác nhận. Không tự thêm ngưỡng latency/SLA.

Đầu ra: bảng `Schema ID | Loại response | Assertion | Nguồn | Trạng thái xác định/TBD`. Dừng review.

### Bước 6 — Sinh test case

Chỉ sử dụng phân tích đã được người dùng duyệt; không biến giả định chưa được xác nhận thành yêu cầu. Chuyển các đại diện miền, biên, chuyển trạng thái, tình huống bảo mật và schema thành test case; ghép các checkpoint tương thích vào cùng một case khi hợp lý. Mỗi case có một mục tiêu chính, có thể có nhiều assertion; một assertion không được tự tính thành một test case độc lập.

Dùng các trường sau (có thể biểu diễn bằng Markdown, CSV, Excel theo yêu cầu):

| Trường | Nội dung |
|---|---|
| Test Case ID | Mã duy nhất, ổn định |
| Requirement / Technique | Nguồn đặc tả/yêu cầu, mã phân tích và kỹ thuật |
| Mục tiêu | Hành vi cần kiểm tra |
| Tiền điều kiện | Actor, dữ liệu, trạng thái trước |
| Test Data | Path/query/header/body hoặc tham chiếu fixture; giữ đúng kiểu, phân biệt thiếu trường và null |
| Các bước | Setup, request mục tiêu, xác minh, cleanup nếu cần |
| Expected Result | Status/schema đã biết, nghiệp vụ và hậu điều kiện; ghi TBD riêng nếu chưa rõ |

Tách dữ liệu khỏi logic để thuận tiện DDT (CSV/JSON); dùng biến cho token, ID và dữ liệu động. Thiết kế request chaining khi cần; request hỗ trợ không tự tính vào số case API mục tiêu. Áp dụng các yêu cầu chung về request do người dùng hoặc dự án cung cấp, nếu có. Không tự chạy request hoặc chỉnh dữ liệu thật. Mọi case sinh ở đây đều là AI-generated, chưa audit.

Đầu ra: danh sách case nháp. Dừng review.

### Bước 7 — Kiểm tra chất lượng và bàn giao

1. Đối chiếu từng case với nguồn và các bảng đã duyệt; tìm oracle thiếu căn cứ, precondition không thể tạo, dữ liệu không phù hợp mục tiêu hoặc bước xác minh thiếu.
2. Rà trùng theo mục tiêu, miền, actor, trạng thái và kỳ vọng; không coi chỉ đổi giá trị trong cùng một miền là coverage mới nếu không có lý do.
3. Tổng hợp coverage theo tham số/partition/biên, cạnh trạng thái, yêu cầu bảo mật và schema áp dụng; nêu mục thiếu và kỹ thuật không áp dụng. Không tuyên bố coverage đầy đủ nếu chưa chứng minh.
4. Báo số case AI sinh, số case trùng đề nghị loại, số case còn TBD và số case có oracle đủ để thực thi. Nếu người dùng đặt mục tiêu số lượng mà chưa đạt, báo thiếu và đề nghị mở rộng các miền/kết hợp có căn cứ; không tự bịa quy tắc.
5. Giữ bản gốc AI-generated và ghi riêng đề xuất chỉnh sửa; không âm thầm xóa hoặc sửa lịch sử. Bàn giao cho người dùng đánh giá độc lập và chỉnh sửa theo quy trình của dự án. Không tự xác nhận rằng con người đã đánh giá hoặc phê duyệt test case.

Đầu ra: bộ case AI-generated, tổng hợp coverage và vấn đề mở. Dừng sau khi bàn giao bộ test case; không chuyển sang triển khai hoặc thực thi kiểm thử.

## 5. Cách sử dụng theo từng bước

Người dùng chỉ định endpoint và bước cần thực hiện, ví dụ: `$api-test-generator` — phân tích hợp đồng API `PUT /api/resources/{id}` (bước 1), dựa trên đặc tả đã cung cấp. Nếu thiếu kết quả bước trước đã duyệt, chỉ ra nội dung cần bổ sung; không tự xác nhận thay người dùng.

## 6. Cơ sở phương pháp

- Equivalence Partitioning và Boundary Value Analysis: chia miền theo yêu cầu, chọn đại diện và giá trị biên.
- State Transition Testing: kiểm tra chuyển đổi trạng thái theo sự kiện, actor và điều kiện.
- Security Testing và Schema Validation: xác định yêu cầu áp dụng, assertion có căn cứ và giới hạn kiểm chứng.
- Tham khảo nguyên tắc của RESTGPT: trích xuất ràng buộc từ đặc tả và không tự suy diễn quy tắc chưa rõ; của AGORA: chú trọng oracle ngữ nghĩa và bất biến nghiệp vụ. Skill không tái triển khai hai phương pháp nghiên cứu này.
- Data-Driven Testing và Request Chaining: hỗ trợ tổ chức dữ liệu và các bước kiểm thử khi cần.
