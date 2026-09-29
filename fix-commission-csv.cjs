const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.services.tsx', 'utf8');

const oldLogic = `if (parts.length >= 3) {
                          const name = parts[0].trim();
                          const duration = Number(parts[1].trim());
                          const price = Number(parts[2].trim());
                          if (name && duration && price) {
                            const item = { id: "SRV_" + Date.now() + Math.random().toString(36).substr(2, 5), name, duration: \`\${duration} phAt\`, price, commission: 0 };`;

const newLogic = `if (parts.length >= 3) {
                          const name = parts[0].trim();
                          const duration = Number(parts[1].trim());
                          const price = Number(parts[2].trim());
                          const commission = parts.length >= 4 ? Number(parts[3].trim()) : 0;
                          if (name && duration && price) {
                            const item = { id: "SRV_" + Date.now() + Math.random().toString(36).substr(2, 5), name, duration: \`\${duration} phút\`, price, commission: isNaN(commission) ? 0 : commission };`;

code = code.replace(oldLogic, newLogic);
// Also fixing the accent in 'phAt' if it's there.
code = code.replace(/duration: \`\$\{duration\} phAt\`/g, 'duration: `${duration} phút`');

fs.writeFileSync('src/routes/dashboard.services.tsx', code, 'utf8');

// Now update the template
const bom = '\uFEFF';
const dichVuCsv = bom + `Tên dịch vụ,Thời gian (phút),Giá tiền (VNĐ),Hoa hồng KTV (VNĐ)
Massage Cổ Vai Gáy,60,350000,50000
Chăm sóc da mặt,90,500000,80000`;
fs.writeFileSync('public/templates/dich-vu-mau.csv', dichVuCsv, 'utf8');

console.log("Updated CSV parsing and template for commission.");
