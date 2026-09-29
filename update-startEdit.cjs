const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const startEditRegex = /(const startEdit = \(item: Appointment\) => \{)/;
const injectedAuthCheck = `
  const startEdit = (item: Appointment) => {
    if (!isAdmin && item.status === "xong") {
      const itemDate = new Date(item.date);
      const today = new Date(new Date().toISOString().split("T")[0]);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (itemDate < yesterday) {
        alert("Bạn không có quyền sửa lịch hẹn đã hoàn thành từ " + item.date + " (chỉ được sửa lịch của hôm nay và hôm qua).");
        return;
      }
    }
`;

code = code.replace(startEditRegex, injectedAuthCheck);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Injected RBAC to startEdit");
