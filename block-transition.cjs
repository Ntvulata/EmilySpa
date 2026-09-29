const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const target = 'if (!oldAppt) { alert("Lỗi: Không tìm thấy lịch hẹn cũ."); return; }';
// Wait, powershell encoding might cause `Lỗi` to be read differently. Let's find by a safer substring.
// Or just match `const isRevertingCompleted` line.

const regex = /(const oldAppt = initialAppointments\.find\(x => x\.id === editId\);\s*if \(!oldAppt\) \{[^}]+\}\s*)(const isRevertingCompleted)/;

code = code.replace(regex, `$1if (oldAppt.status === "xong" && form.status === "huy") {
            alert("Lịch đang hoàn thành không được chuyển qua Hủy.");
            return;
          }
          $2`);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Injected block transition from xong to huy");
