# 🌸 Glow & Relax Luxury Spa - Ứng Dụng Theo Dõi Lịch Hẹn & Quản Lý Doanh Thu Spa

Ứng dụng web quản lý Spa chuyên nghiệp, trực quan, hỗ trợ theo dõi lịch hẹn, kỹ thuật viên, phòng trị liệu, quản lý khách hàng (CRM), bán gói liệu trình dài hạn và báo cáo doanh thu chi tiết.

---

## 🔐 Phân Quyền Vai Trò Người Dùng (Role-Based Access Control)

| Vai trò | Tên đăng nhập | Mật khẩu | Quyền Hạn Chi Tiết |
| :--- | :--- | :--- | :--- |
| **👑 Chủ Spa / Quản lý (`admin`)** | `admin` | `123` | **Toàn quyền (Thêm, Sửa, XÓA mọi dữ liệu)**: Xóa lịch hẹn, Xóa doanh thu/gói đã bán, Xóa khách hàng, Xóa dịch vụ/KTV/phòng, Quản lý & tạo tài khoản nhân viên. |
| **🌸 Lễ Tân Spa (`receptionist`)** | `letan` | `123` | **Được Thêm & Sửa - KHÔNG ĐƯỢC XÓA**: Đặt lịch, đổi trạng thái, sửa lịch, thêm/sửa khách hàng, bán gói/thẻ, trừ lượt/tiền thẻ, xem báo cáo. **Ẩn và chặn mọi thao tác Xóa**. |
| **💆‍♀️ Kỹ Thuật Viên (`staff`)** | `ktv` | `123` | **Được Thêm & Sửa - KHÔNG ĐƯỢC XÓA**: Xem lịch làm việc, đổi trạng thái phục vụ khách, thêm ghi chú. **Ẩn và chặn mọi thao tác Xóa**. |

*(Bạn có thể đổi Tên đăng nhập & Mật khẩu bất kỳ lúc nào tại mục **Cài Đặt & Sao Lưu** hoặc bấm vào nút 🔑 ở góc dưới thanh Sidebar)*.

---

## ✨ Điểm Nổi Bật & Các Tính Năng Mới

1. **Sơ Đồ KTV Ca Làm Việc Đến 23:30 (Daily Timeline Grid)**:
   - Khung giờ mở rộng từ **08:00 đến 23:30** hiển thị trực quan các ca phục vụ của từng nhân viên trong ngày.
   - Thao tác kéo ngang mượt mà, phân biệt rõ trạng thái bằng màu sắc.

2. **Bán Gói Dịch Vụ & Thẻ Dài Hạn (Không Lên Lịch Hẹn)**:
   - Nút **"💳 Bán Gói / Thẻ"** nhanh trên thanh công cụ Header.
   - Bán các gói liệu trình nhiều buổi (ví dụ: *Gói 10 buổi Trị Mụn, Combo 5 buổi Massage, Thẻ trả trước 10 Triệu...*).
   - **Tự động cộng thẳng vào Doanh thu** (Dashboard & Báo cáo) và nâng hạng thành viên VIP cho khách.
   - **Hoàn toàn không chiếm chỗ lịch hẹn** trên sơ đồ KTV.
   - Theo dõi số buổi đã làm và còn lại trong hồ sơ khách hàng với nút **"Trừ 1 buổi"** tiện lợi.

3. **Báo Cáo Doanh Thu & Dịch Vụ Đã Hoàn Thành**:
   - Phân hệ báo cáo chi tiết theo ngày, tuần, tháng hoặc khoảng ngày tự chọn.
   - Thống kê doanh thu từ Lịch hẹn hoàn thành và Đơn bán gói dài hạn.
   - Lọc theo từng Kỹ thuật viên (tính doanh số KTV) hoặc theo từng Dịch vụ.
   - **Xuất Excel (.CSV)** và **In báo cáo** khổ A4 có phần ký duyệt.

4. **Theo Dõi Lịch Hẹn Đa Chế Độ Xem (Timeline, Tuần, Bảng)**:
   - Chuyển trạng thái 1 chạm: *Chờ xác nhận ➜ Đã xác nhận ➜ Khách đến ➜ Đang làm ➜ Hoàn thành & Thu tiền ➜ Huỷ*.
   - Cảnh báo trùng lịch thông minh khi xếp trùng KTV hoặc trùng giường.
   - Chỉnh sửa lịch chuẩn xác, không bị nhân bản lịch.

5. **Quản Lý Khách Hàng (CRM)**:
   - Lưu trữ số điện thoại, ngày sinh, tình trạng da, sở thích cá nhân.
   - Tự động phân cấp bậc thành viên (*Khách mới, Thân thiết, VIP Gold, VIP Diamond*).
   - Xem toàn bộ lịch sử các buổi hẹn và các gói liệu trình đang sở hữu.

6. **Sao Lưu & Phục Hồi Dữ Liệu**:
   - Dữ liệu lưu an toàn trên máy (`localStorage`).
   - Hỗ trợ xuất/nhập file sao lưu `.JSON` bảo toàn toàn bộ dữ liệu.

---

## 🚀 Hướng Dẫn Sử Dụng & Triển Khai (Deploy Vercel)

### 1. Chạy trên máy tính (Offline / Trực tiếp):
1. Mở thư mục: `C:\Users\ntvu7\.gemini\antigravity\scratch\spa-appointment-app`
2. Nhấp đúp chuột vào file `index.html` để mở app trên trình duyệt.

### 2. Triển khai lên Vercel (Online):
1. Đẩy toàn bộ thư mục `spa-appointment-app` lên GitHub / GitLab / Bitbucket.
2. Đăng nhập [Vercel](https://vercel.com) ➔ Bấm **Add New...** ➔ **Project** ➔ Chọn repository vừa tạo.
3. Phần **Framework Preset**: Chọn **`Other`** (hoặc để mặc định).
4. Phần **Root Directory**: Để trống (hoặc trỏ vào thư mục chứa `index.html` và `vercel.json`).
5. Bấm **Deploy** ➔ Vercel sẽ tự động cấu hình và chạy ổn định 100% không còn bị lỗi 404!
