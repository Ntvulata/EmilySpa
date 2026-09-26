# Hệ Thống Quản Lý Spa (Spa Management System)

Phần mềm quản lý toàn diện dành cho Spa, Salon và các trung tâm chăm sóc sức khỏe. Được thiết kế tối ưu với giao diện thân thiện, hiện đại, giúp chủ cơ sở dễ dàng số hóa mọi hoạt động kinh doanh.

## 🌟 Tính Năng Nổi Bật

- **📅 Quản Lý Lịch Hẹn (Appointments)**
  - Hiển thị trực quan theo dạng **Danh sách (List)** hoặc dạng **Lưới (Grid)** trực quan.
  - Tự động cuộn đến khung giờ hiện tại. Thanh tiêu đề cố định giúp dễ quan sát hàng trăm lịch hẹn.
  - Phân bổ Kỹ thuật viên, chọn Dịch vụ, áp dụng Gói/Thẻ linh hoạt.

- **👥 Quản Lý Khách Hàng (Customers)**
  - Lưu trữ thông tin, số điện thoại, hạng thành viên (Vàng, Bạc, Đồng...).
  - Theo dõi nhanh số dư Gói/Thẻ đang sử dụng của từng khách hàng.
  - Chế độ **Phân trang** (50 người/trang) và chức năng tìm kiếm thông minh.

- **📦 Quản Lý Dịch Vụ & Gói Thẻ (Services & Packages)**
  - Quản lý danh sách dịch vụ lẻ, thời gian làm và giá tiền.
  - Thiết lập hệ thống thẻ liệu trình: trừ theo **Số lượt (Sessions)** hoặc trừ theo **Số dư tiền (Balance)**.

- **💇‍♀️ Quản Lý Nhân Viên (Staff/Therapists)**
  - Cập nhật danh sách Kỹ thuật viên, theo dõi số lượt phục vụ/doanh thu trong ngày.

- **⏱️ Lịch Sử & Thống Kê (History & Reports)**
  - Nhật ký bán thẻ, trừ lượt siêu chi tiết. Phân trang 50 dòng/trang, lọc tự động.
  - Chụp màn hình báo cáo tự động siêu nhanh.

- **📥 Tính Năng Nhập Dữ Liệu (Import CSV)**
  - Hỗ trợ nhập hàng loạt danh sách Khách Hàng, Dịch Vụ, Gói Thẻ bằng file `.csv` chỉ với 1 cú click chuột (File mẫu tải ở mục Cài đặt).

## 🚀 Công Nghệ Sử Dụng

- **Frontend:** React, TypeScript, Tailwind CSS, TanStack Router (TanStack Start).
- **Backend / Database:** Firebase (Cloud Firestore).
- **Công cụ build:** Vite, npm.

## ⚙️ Hướng Dẫn Cài Đặt & Chạy Phần Mềm

### Yêu cầu hệ thống:
- Đã cài đặt [Node.js](https://nodejs.org/) (khuyên dùng bản LTS mới nhất).

### Các bước khởi chạy:

1. **Cài đặt thư viện (Chỉ làm ở lần đầu tiên):**
   Mở terminal tại thư mục dự án và chạy lệnh:
   ```bash
   npm install
   ```

2. **Chạy phần mềm (Chế độ phát triển):**
   ```bash
   npm run dev
   ```
   Sau khi hệ thống báo chạy thành công, mở trình duyệt và truy cập: `http://localhost:2012` (hoặc cổng mà terminal cung cấp).

3. **Xuất bản / Build (Khi cần đưa lên host/server thực tế):**
   ```bash
   npm run build
   ```
   Toàn bộ mã nguồn đã tối ưu sẽ nằm trong thư mục `.output`.

## 📂 Hướng Dẫn Tải File CSV Mẫu
Bạn có thể dễ dàng tìm thấy các file mẫu (Template) CSV để nhập liệu tự động bằng cách:
1. Mở phần mềm, đi tới mục **Cài đặt**.
2. Kéo xuống dưới cùng tại mục **📥 File mẫu nhập liệu (CSV)**.
3. Click để tải về file Khách Hàng, Dịch Vụ, hoặc Gói/Thẻ. Sau khi điền, dùng nút **Nhập CSV** ở các trang tương ứng.

---
*Phần mềm được tinh chỉnh và tối ưu trải nghiệm theo yêu cầu thực tế.*
