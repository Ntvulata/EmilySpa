const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.services.tsx', 'utf8');

code = code.replace(/K1 thu-t viAn/g, 'Kỹ thuật viên');
code = code.replace(/L\. tAn/g, 'Lễ tân');
code = code.replace(/Qun lA/g, 'Quản lý');
code = code.replace(/\?A/g, 'Đã');
code = code.replace(/\?A3ng/g, 'Đóng');

fs.writeFileSync('src/routes/dashboard.services.tsx', code, 'utf8');
console.log("Fixed encoding in services");
