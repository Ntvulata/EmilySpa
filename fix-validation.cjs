const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// I'll make the finalEndTime fallback safer. If it fails, it won't crash.
const regex = /let finalEndTime = form\.endTime;[\s\S]*?if \(\!finalEndTime \|\| finalEndTime < form\.time\) return setError\("Giờ kết thúc không được nhỏ hơn giờ bắt đầu\."\);/;

const safeValidation = `let finalEndTime = form.endTime || form.time;
    if (form.status === "xong") {
      try {
        const now = new Date();
        const currentHHMM = \`\${now.getHours().toString().padStart(2, '0')}:\${now.getMinutes().toString().padStart(2, '0')}\`;
        
        // We compare the date string directly from the local timezone, not UTC!
        const localDate = \`\${now.getFullYear()}-\${(now.getMonth()+1).toString().padStart(2, '0')}-\${now.getDate().toString().padStart(2, '0')}\`;
        
        if (form.date === localDate) {
          if (finalEndTime > currentHHMM) {
            finalEndTime = currentHHMM;
          }
        }
      } catch (e) {
        console.error("Time calc error", e);
      }
      if (finalEndTime < form.time) finalEndTime = form.time;
    }

    if (!form.customerId) return setError("Vui lòng chọn khách hàng.");
    if (finalEndTime < form.time) return setError("Giờ kết thúc không được nhỏ hơn giờ bắt đầu.");`;

if (regex.test(code)) {
  code = code.replace(regex, safeValidation);
  fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
  console.log("Made validations safer");
} else {
  console.log("Regex not found");
}
