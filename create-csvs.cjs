const fs = require('fs');

const bom = '\uFEFF';

const khachHangCsv = bom + `Tên khách hàng,Số điện thoại
Nguyễn Văn A,0901234567
Trần Thị B,0987654321`;

const dichVuCsv = bom + `Tên dịch vụ,Nhóm dịch vụ,Thời gian (phút),Giá tiền (VNĐ),Hoa hồng KTV (VNĐ)
Massage Cổ Vai Gáy,Massage,60,350000,50000
Chăm sóc da mặt,Facial,90,500000,80000`;

const goiTheCsv = bom + `Tên gói/thẻ,Loại (sessions/balance),Giá bán (VNĐ),Giá trị thực tế
Thẻ Gội Đầu 10 buổi,sessions,1500000,10
Thẻ Tài Khoản 5 Triệu,balance,4000000,5000000`;

fs.writeFileSync('public/templates/khach-hang-mau.csv', khachHangCsv, 'utf8');
fs.writeFileSync('public/templates/dich-vu-mau.csv', dichVuCsv, 'utf8');
fs.writeFileSync('public/templates/goi-the-mau.csv', goiTheCsv, 'utf8');

console.log("Created CSV files successfully.");
