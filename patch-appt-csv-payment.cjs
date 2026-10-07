const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const targetHeader = `let csv = "\\uFEFF\\"Ngày\\",\\"Giờ\\",\\"Khách hàng\\",\\"SĐT\\",\\"Dịch vụ\\",\\"Ghi chú\\",\\"KTV\\",\\"Sử dụng thẻ\\",\\"Trạng thái\\"\\n";`;
const repHeader = `let csv = "\\uFEFF\\"Ngày\\",\\"Giờ\\",\\"Khách hàng\\",\\"SĐT\\",\\"Dịch vụ\\",\\"Ghi chú\\",\\"KTV\\",\\"Sử dụng thẻ\\",\\"Thanh toán\\",\\"Trạng thái\\"\\n";`;

const rowRegex = /csv \+= `"\$\{item\.date[^`]*\}`;/;
const repRow = `csv += \`"\${item.date}","\${item.time}","\${cName.replace(/"/g, '""')}","\${cPhone}","\${svcs.replace(/"/g, '""')}","\${(item.note || "").replace(/"/g, '""')}","\${(dbTherapists.find(t => t.id === item.therapistId || t.name === item.therapistId)?.name || item.therapistId || "").replace(/"/g, '""')}","\${pkgText.replace(/"/g, '""')}","\${(item.price || "0").toString().replace(/"/g, '""')}","\${st}"\\n\`;`;

let c1 = code.replace(targetHeader, repHeader);
c1 = c1.replace(rowRegex, repRow);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', c1, 'utf8');
console.log("Patched appointments CSV with payment column.");
