const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.customers.tsx', 'utf8');

const oldCheck = `    const hasAppointments = appointments.some(a => a.customerId === custToDelete.id || a.phone === custToDelete.phone);
    if (hasAppointments) {
      alert("Không thể xóa Khách hàng này vì đã có phát sinh lịch hẹn trên hệ thống (kể cả Admin)!");
      return;
    }`;

const newCheck = `    const hasAppointments = appointments.some(a => a.customerId === custToDelete.id || a.phone === custToDelete.phone);
    const hasPackages = packageHistory.some(h => h.customerId === custToDelete.id) || (custToDelete.packages && custToDelete.packages.length > 0);
    
    if (hasAppointments || hasPackages) {
      alert("Không thể xóa Khách hàng này vì đã có phát sinh Lịch hẹn hoặc Mua gói thẻ trên hệ thống!");
      return;
    }`;

// Since powershell mangled the alert string, let's use regex matching
const regex = /const hasAppointments = appointments\.some[^;]+;\s*if \(hasAppointments\) \{\s*alert\([^)]+\);\s*return;\s*\}/;

code = code.replace(regex, newCheck);

fs.writeFileSync('src/routes/dashboard.customers.tsx', code, 'utf8');
console.log("Injected package check");
