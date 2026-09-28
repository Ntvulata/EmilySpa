# Emily Spa - Luxury Management

Hệ thống quản lý Spa toàn diện, được thiết kế chuyên biệt để tối ưu hóa quy trình đặt lịch, chăm sóc khách hàng, quản lý gói liệu trình và tính toán hoa hồng cho Kỹ thuật viên (KTV).

## 🌟 Tính năng nổi bật

* **📅 Quản lý Lịch hẹn thông minh:** 
  * Hiển thị dạng Danh sách (List) và Lưới thời gian (Grid).
  * Tự động cuộn đến khung giờ hiện tại.
  * Cảnh báo trùng lịch KTV.
* **👥 Quản lý Khách hàng & Gói/Thẻ:** 
  * Lưu trữ thông tin, số điện thoại, hạng thành viên.
  * Quản lý số buổi/số tiền còn lại của thẻ liệu trình bằng cơ chế **Kế toán dòng tiền (Event Sourcing)** tuyệt đối chính xác (không sợ kẹt số, âm số).
* **💆‍♀️ Dịch vụ & Kỹ thuật viên:** 
  * Cài đặt giá tiền, thời lượng, và **hoa hồng cố định** cho từng dịch vụ.
  * Quản lý danh sách KTV.
  * Sử dụng hệ thống **Mã định danh ẩn (Hidden ID)** giúp thoải mái đổi tên/SĐT mà không lo đứt gãy dữ liệu lịch sử.
* **📊 Báo cáo & Thống kê:**
  * Báo cáo doanh thu theo ngày (Dịch vụ trực tiếp vs Bán Thẻ).
  * Tỷ trọng dịch vụ hoàn thành.
  * **Báo cáo Hoa hồng KTV:** Tự động tính toán số ca, số dịch vụ và tổng tiền hoa hồng.
  * Tính năng **Xuất file Excel (CSV)** chi tiết từng ca làm để nộp thuế hoặc tính lương.
* **🔒 Bảo mật & Phân quyền:**
  * Tích hợp đăng nhập và lưu trữ đám mây thời gian thực với Firebase.

## 🛠 Công nghệ sử dụng

* **Frontend:** React, TypeScript, Vite.
* **Routing:** TanStack Router.
* **Styling:** Tailwind CSS, Lucide Icons.
* **Database & Auth:** Firebase Firestore (Cloud Database).

## 🚀 Hướng dẫn khởi động (Dành cho nội bộ)

**Cách 1: Mở nhanh qua nút bấm (Desktop)**
Chỉ cần nhấp đúp chuột vào file `KhoiDong_EmilySpa.bat` ngoài màn hình Desktop. Hệ thống sẽ tự động bật máy chủ và có thể truy cập tại: `http://localhost:2012/`

**Cách 2: Khởi động thủ công qua Terminal (Dev)**
1. Mở thư mục dự án trong VS Code.
2. Cài đặt thư viện (nếu chạy lần đầu):
   ```bash
   npm install
   ```
3. Khởi động môi trường phát triển:
   ```bash
   npm run dev
   ```
4. Truy cập `http://localhost:2012/` trên trình duyệt.

## 📝 Cấu trúc dữ liệu chính (Lưu ý kỹ thuật)
* Mọi thực thể (Khách hàng, Dịch vụ, KTV, Lịch hẹn) đều liên kết với nhau bằng **Mã ID ngầm (`customerId`, `therapistId`, `serviceIds`)** thay vì dùng Tên.
* Dữ liệu thẻ của khách hàng được tính toán bằng cách cộng dồn lịch sử (SUM) từ bảng `packageHistory`, đảm bảo tính minh bạch 100%.

---
&copy; 2026 Emily Spa &bull; Luxury Management &bull; Phát triển bởi Nguyễn Tuấn Vũ
