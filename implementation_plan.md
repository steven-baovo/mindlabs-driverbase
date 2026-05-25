# Kế hoạch khắc phục cảnh báo bảo mật Supabase (getUser vs getSession)

Khắc phục cảnh báo bảo mật trong console hiển thị trên trình duyệt khi chuyển tab bằng cách thay thế hàm `supabase.auth.getSession()` thành `supabase.auth.getUser()` ở các Server Components theo khuyến nghị bảo mật chính thức của Supabase.

## User Review Required

> [!NOTE]
> Việc chuyển sang `getUser()` sẽ gọi API xác thực chữ ký số của token từ Supabase Auth Server. Điều này đảm bảo an toàn tuyệt đối và dập tắt hoàn toàn các cảnh báo trong console của trình duyệt. 

## Open Questions

Không có câu hỏi mở.

## Proposed Changes

### Core Security & Warnings

#### [MODIFY] [layout.tsx](file:///d:/mindlabs/src/app/(frontend)/layout.tsx)
- Thay đổi `supabase.auth.getSession()` thành `supabase.auth.getUser()` để lấy đối tượng `user` an toàn.

#### [MODIFY] [page.tsx](file:///d:/mindlabs/src/app/(frontend)/page.tsx)
- Thay đổi `supabase.auth.getSession()` thành `supabase.auth.getUser()` ở đầu trang Dashboard để kiểm tra đăng nhập.

#### [MODIFY] [page.tsx](file:///d:/mindlabs/src/app/(frontend)/account/page.tsx)
- Thay đổi `supabase.auth.getSession()` thành `supabase.auth.getUser()` ở trang quản lý tài khoản.

## Verification Plan

### Automated Tests
- Chạy lệnh build kiểm tra lỗi Typescript:
  ```cmd
  cmd /c npm run build
  ```

### Manual Verification
- F5 lại ứng dụng và chuyển tab giữa các tính năng.
- Xác minh rằng các cảnh báo màu vàng liên quan đến `getSession()` trong Console đã biến mất hoàn toàn.
