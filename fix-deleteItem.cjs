const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// 1. Add hard block in deleteItem
const targetDelete = `  const deleteItem = async (id: string) => {`;
const injectedDelete = `  const deleteItem = async (id: string) => {
    const oldAppt = initialAppointments.find(x => x.id === id);
    if (oldAppt && oldAppt.status === "xong") {
      alert("Không thể xóa lịch hẹn đã Hoàn thành!");
      return;
    }`;
code = code.replace(targetDelete, injectedDelete);

// 2. Fix the button rendering logic. It was using form.status.
// Let's use the original status. But since I already added a hard block in deleteItem,
// that is perfectly secure. However, to be cleaner on the UI, I'll update the condition.
// Actually, `form.status !== 'xong'` can just stay, because if they change the dropdown, the button might appear, 
// but clicking it will result in the alert!
// But wait, it's better if it doesn't appear at all.
const btnRegex = /\{editId && form\.status !== 'dang' && form\.status !== 'xong' \? \(/;
code = code.replace(btnRegex, '{editId && (initialAppointments.find(x => x.id === editId)?.status !== "dang" && initialAppointments.find(x => x.id === editId)?.status !== "xong") ? (');

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Fixed deleteItem security");
