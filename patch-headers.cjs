const fs = require('fs');

let appt = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');
const apptRegex = /let csv = "\\uFEFF[^"]*?Ngày.*?;/;
const apptRep = `let csv = "\\uFEFF\\\"Ngày\\\",\\\"Giờ\\\",\\\"Khách hàng\\\",\\\"SĐT\\\",\\\"Dịch vụ\\\",\\\"Ghi chú\\\",\\\"KTV\\\",\\\"Sử dụng thẻ\\\",\\\"Trạng thái\\\"\\n";`;
appt = appt.replace(apptRegex, `let csv = "\\uFEFF\\"Ngày\\",\\"Giờ\\",\\"Khách hàng\\",\\"SĐT\\",\\"Dịch vụ\\",\\"Ghi chú\\",\\"KTV\\",\\"Sử dụng thẻ\\",\\"Trạng thái\\"\\n";`);
fs.writeFileSync('src/routes/dashboard.appointments.tsx', appt, 'utf8');


let rep = fs.readFileSync('src/routes/dashboard.reports.tsx', 'utf8');
const repRegex = /let csv = "\\uFEFF[^"]*?Khách hàng.*?;/;
rep = rep.replace(repRegex, `let csv = "\\uFEFF\\"Khách hàng\\",\\"Số ĐT\\",\\"Tên gói/thẻ\\",\\"Đầu kỳ\\",\\"Mua mới\\",\\"Sử dụng\\",\\"Còn lại\\"\\n";`);
fs.writeFileSync('src/routes/dashboard.reports.tsx', rep, 'utf8');

console.log("Patched CSV headers.");
