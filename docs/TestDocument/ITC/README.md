# ITC - Integration Test Case

Tài liệu Integration Test Case theo luồng nghiệp vụ của hệ thống **ATS**.

## Danh sách scenario

| File | Scenario |
|------|---------|
| [ITC_01_Hiring_Flow.md](./ITC_01_Hiring_Flow.md) | Luồng tuyển dụng đầy đủ, ứng viên nộp đơn, phỏng vấn |
| [ITC_02_Auth_Flow.md](./ITC_02_Auth_Flow.md) | Luồng đăng ký, xác thực email, quên mật khẩu, phân quyền |

## Cấu trúc bảng ITC

| Cột | Ý nghĩa |
|-----|---------|
| Step | Số thứ tự bước |
| Màn hình ID | Route/URL màn hình |
| No | Số thứ tự test case trong step |
| Điều kiện test / Step thao tác | Mô tả hành động theo 4 bước |
| Data / Điều kiện đầu vào | Dữ liệu mẫu dùng để test |
| Kết quả mong muốn | Hành vi kỳ vọng |
| Cách xác nhận | Cách verify kết quả |
| Kết quả test lần 1/2/3 | ○/×/×→○/－ |
| Tài liệu tham khảo | Link DD, API spec |
