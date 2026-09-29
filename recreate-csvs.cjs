const fs = require('fs');
const bom = '\uFEFF';

const khachHangCsv = bom + `Tên khách hàng,Số điện thoại
Nguyễn Văn A,0901234567
Trần Thị B,0987654321`;

const dichVuCsv = bom + `Tên dịch vụ,Thời gian (phút),Giá tiền (VNĐ)
Massage Cổ Vai Gáy,60,350000
Chăm sóc da mặt,90,500000`;

const goiTheCsv = bom + `Tên gói/thẻ,Loại (sessions/balance),Giá trị (số buổi/tiền),Giá bán (VNĐ)
Thẻ Gội Đầu 10 buổi,sessions,10,1500000
Thẻ Tài Khoản 5 Triệu,balance,5000000,4000000`;

fs.writeFileSync('public/templates/khach-hang-mau.csv', khachHangCsv, 'utf8');
fs.writeFileSync('public/templates/dich-vu-mau.csv', dichVuCsv, 'utf8');
fs.writeFileSync('public/templates/goi-the-mau.csv', goiTheCsv, 'utf8');

console.log("Re-created CSV templates successfully.");
