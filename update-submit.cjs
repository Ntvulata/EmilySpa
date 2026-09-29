const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const oldSubmitStart = `  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.customerId) return setError("Vui lòng chọn khách hàng.");
    if (!form.endTime || form.endTime < form.time) return setError("Giờ kết thúc không được nhỏ hơn giờ bắt đầu.");
    
    // Check overlap
    const hasOverlap = appts.some(app => {
      if (app.id === editId || app.status === 'huy' || app.date !== form.date || app.therapistId !== form.therapistId) return false;
      const appEndTime = app.endTime || app.time; // fallback
      return form.time < appEndTime && form.endTime > app.time;
    });`;

// Wait, the file has different indentation and encoding, I'll use regex.
const regex = /const submit = async \(e: FormEvent\) => \{\s*e\.preventDefault\(\);\s*if \(\!form\.customerId\).*?\s*if \(\!form\.endTime \|\| form\.endTime < form\.time\).*?\s*\/\/ Check overlap\s*const hasOverlap = appts\.some\(app => \{\s*if \(app\.id === editId \|\| app\.status === 'huy' \|\| app\.date !== form\.date \|\| app\.therapistId !== form\.therapistId\) return false;\s*const appEndTime = app\.endTime \|\| app\.time; \/\/ fallback\s*return form\.time < appEndTime && form\.endTime > app\.time;\s*\}\);/;

const newSubmitStart = `const submit = async (e: FormEvent) => {
    e.preventDefault();
    
    let finalEndTime = form.endTime;
    if (form.status === "xong") {
      const now = new Date();
      const currentHHMM = \`\${now.getHours().toString().padStart(2, '0')}:\${now.getMinutes().toString().padStart(2, '0')}\`;
      // Only pull back if today
      if (form.date === now.toISOString().split("T")[0]) {
        if (finalEndTime > currentHHMM) {
          finalEndTime = currentHHMM;
        }
      }
      // Safety check: if pulling back makes it less than start time, just set it to start time
      if (finalEndTime < form.time) finalEndTime = form.time;
    }

    if (!form.customerId) return setError("Vui lòng chọn khách hàng.");
    if (!finalEndTime || finalEndTime < form.time) return setError("Giờ kết thúc không được nhỏ hơn giờ bắt đầu.");
    
    // Check overlap
    const hasOverlap = appts.some(app => {
      if (app.id === editId || app.status === 'huy' || app.date !== form.date || app.therapistId !== form.therapistId) return false;
      const appEndTime = app.endTime || app.time; // fallback
      return form.time < appEndTime && finalEndTime > app.time;
    });`;

if (regex.test(code)) {
  code = code.replace(regex, newSubmitStart);
  
  // Now replace form.endTime with finalEndTime in the rest of the submit function (savedAppt creation)
  // There are two places: one for editId, one for new.
  // We can just replace `endTime: form.endTime,` with `endTime: finalEndTime,` inside `submit`
  // Let's do a replace that only affects the submit function.
  
  const oldAppt1 = `endTime: form.endTime,
        customerId: form.customerId,`;
  const newAppt1 = `endTime: finalEndTime,
        customerId: form.customerId,`;
  
  code = code.split(oldAppt1).join(newAppt1);
  
  fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
  console.log("Updated submit function");
} else {
  console.log("Regex not found");
}
