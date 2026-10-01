const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.customers.tsx', 'utf8');

const targetStr = `const hasAppointments = appointments.some(a => a.customerId === custToDelete.id || a.phone === custToDelete.phone);`;
const blockStartIndex = code.indexOf(targetStr);
const blockEndIndex = code.indexOf('if (window.confirm("X', blockStartIndex);

const newBlock = `const hasAppointments = appointments.some(a => a.customerId === custToDelete.id || a.phone === custToDelete.phone);
    const hasPackages = packageHistory.some(h => h.customerId === custToDelete.id) || (custToDelete.packages && custToDelete.packages.length > 0);
    
    if (hasAppointments || hasPackages) {
      alert("Không thể xóa Khách hàng này vì đã có phát sinh Lịch hẹn hoặc Mua gói thẻ trên hệ thống!");
      return;
    }
    `;

code = code.substring(0, blockStartIndex) + newBlock + code.substring(blockEndIndex);

fs.writeFileSync('src/routes/dashboard.customers.tsx', code, 'utf8');
console.log("Injected package check via index");
